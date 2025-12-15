import { useEffect, useMemo, useState } from "react";
import containerStyles from "@containerStyles/globalContainer.module.css";
import styles from "./admin-panel.module.css";

import { graphQLRequest } from "@graphQL/graphQLClient";
import { getPendingReviewsQuery, getAcceptedReviewsQuery } from "@graphQL/queries/adminQueries";
import {
  approvePendingReviewMutation,
  rejectPendingReviewMutation,
  moveAcceptedToPendingMutation,
  deleteReviewMutation,
} from "@graphQL/mutations/adminMutations";
import type { Review } from "@redux/review-slice/reviewSlice";

type ChangeOp =
  | { type: "APPROVE"; id: string }
  | { type: "REJECT"; id: string }
  | { type: "MOVE_BACK"; id: string }
  | { type: "DELETE"; id: string };

function uniqById(list: Review[]) {
  const m = new Map<string, Review>();
  for (const r of list) m.set(r.id, r);
  return Array.from(m.values());
}

function removeById(list: Review[], id: string) {
  return list.filter((r) => r.id !== id);
}

function findById(list: Review[], id: string) {
  return list.find((r) => r.id === id);
}


function normalizeOps(ops: ChangeOp[]) {
  const last = new Map<string, ChangeOp>();
  for (const op of ops) last.set(op.id, op);

  const seen = new Set<string>();
  const out: ChangeOp[] = [];
  for (let i = ops.length - 1; i >= 0; i--) {
    const op = ops[i];
    if (seen.has(op.id)) continue;
    seen.add(op.id);
    out.unshift(last.get(op.id)!);
  }
  return out;
}

export default function AdminPanelPage() {
  // server truth
  const [serverPending, setServerPending] = useState<Review[]>([]);
  const [serverAccepted, setServerAccepted] = useState<Review[]>([]);

  // preview state (what the user sees)
  const [pending, setPending] = useState<Review[]>([]);
  const [accepted, setAccepted] = useState<Review[]>([]);

  // staged changes
  const [ops, setOps] = useState<ChangeOp[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const hasUnsavedChanges = ops.length > 0;

  const load = async () => {
    setLoading(true);
    setErr(null);

    try {
      const pendingList = await graphQLRequest<{ pendingReviews: Review[] }>(getPendingReviewsQuery);
      const acceptedList = await graphQLRequest<{ acceptedReviews: Review[] }>(getAcceptedReviewsQuery);

      const p = pendingList.pendingReviews ?? [];
      const a = acceptedList.acceptedReviews ?? [];

      setServerPending(p);
      setServerAccepted(a);

      // reset preview to server
      setPending(p);
      setAccepted(a);

      // clear staged on reload
      setOps([]);
    } catch (error: any) {
      setErr(error.message ?? "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ---------- preview-only actions ----------
  const stage = (op: ChangeOp) => setOps((prev) => [...prev, op]);

  const previewApprove = (id: string) => {
    const r = findById(pending, id);
    if (!r) return;

    setPending((prev) => removeById(prev, id));
    setAccepted((prev) => uniqById([{ ...r, status: "accepted" }, ...prev]));
    stage({ type: "APPROVE", id });
  };

  const previewReject = (id: string) => {
    // reject means remove from pending list (preview) and stage REJECT
    setPending((prev) => removeById(prev, id));
    stage({ type: "REJECT", id });
  };

  const previewMoveBack = (id: string) => {
    const r = findById(accepted, id);
    if (!r) return;

    setAccepted((prev) => removeById(prev, id));
    setPending((prev) => uniqById([{ ...r, status: "pending" }, ...prev]));
    stage({ type: "MOVE_BACK", id });
  };

  const previewDeleteAccepted = (id: string) => {
    setAccepted((prev) => removeById(prev, id));
    stage({ type: "DELETE", id });
  };

  const discardChanges = () => {
    setPending(serverPending);
    setAccepted(serverAccepted);
    setOps([]);
    setErr(null);
  };

  // ---------- save staged operations ----------
  const saveChanges = async () => {
    if (!hasUnsavedChanges) return;

    setSaving(true);
    setErr(null);

    try {
      const normalized = normalizeOps(ops);

      // run sequentially so its easier to debug
      for (const op of normalized) {
        if (op.type === "APPROVE") {
          await graphQLRequest(approvePendingReviewMutation, { id: op.id });
        } else if (op.type === "REJECT") {
          await graphQLRequest(rejectPendingReviewMutation, { id: op.id });
        } else if (op.type === "MOVE_BACK") {
          await graphQLRequest(moveAcceptedToPendingMutation, { id: op.id });
        } else if (op.type === "DELETE") {
          await graphQLRequest(deleteReviewMutation, { id: op.id });
        }
      }

      // reload from server
      await load();
    } catch (error: any) {
      setErr(error.message ?? "Failed to save changes");
      // keep preview state
    } finally {
      setSaving(false);
    }
  };

  const pendingCount = pending.length;
  const acceptedCount = accepted.length;

  const opSummary = useMemo(() => {
    if (!hasUnsavedChanges) return null;
    const normalized = normalizeOps(ops);
    const byType = normalized.reduce(
      (acc, op) => {
        acc[op.type] = (acc[op.type] ?? 0) + 1;
        return acc;
      },
      {} as Record<ChangeOp["type"], number>
    );

    const parts: string[] = [];
    if (byType.APPROVE) parts.push(`${byType.APPROVE} approve`);
    if (byType.REJECT) parts.push(`${byType.REJECT} reject`);
    if (byType.MOVE_BACK) parts.push(`${byType.MOVE_BACK} move back`);
    if (byType.DELETE) parts.push(`${byType.DELETE} delete`);
    return parts.join(" • ");
  }, [ops, hasUnsavedChanges]);

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h2 className={styles.h2}>Moderation</h2>

        <div className={styles.headerActions}>
          <button className={styles.btn} onClick={load} disabled={loading || saving}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>

          {/* save/discard only appears when there are changes */}
          {hasUnsavedChanges && (
            <>
              <button className={styles.btn} onClick={discardChanges} disabled={saving}>
                Discard
              </button>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={saveChanges} disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Unsaved changes banner */}
      {hasUnsavedChanges && (
        <div className={styles.notice}>
          <strong>Preview mode:</strong> {opSummary ?? "Unsaved changes"} — click <b>Save changes</b> to commit.
        </div>
      )}

      {err && <div className={styles.error}>{err}</div>}

      <div className={styles.grid}>
        {/* Pending */}
        <section className={`${containerStyles.roundContainer} ${styles.panel}`}>
          <div className={styles.panelHeader}>
            <h3 className={styles.h3}>Pending Reviews</h3>
            <span className={styles.badge}>{pendingCount}</span>
          </div>

          <div className={styles.list}>
            {pending.map((r) => (
              <div key={r.id} className={styles.item}>
                <div className={styles.meta}>
                  <div className={styles.line1}>
                    <span className={styles.slug}>{r.diningHallSlug}</span>
                    <span className={styles.dot}>•</span>
                    <span className={styles.author}>{r.author}</span>
                    <span className={styles.dot}>•</span>
                    <span className={styles.rating}>{r.rating}★</span>
                  </div>
                  <div className={styles.desc}>{r.description}</div>
                  <div className={styles.time}>{new Date(r.createdAt).toLocaleString()}</div>
                </div>

                <div className={styles.actions}>
                  <button
                    className={`${styles.btn} ${styles.btnApprove}`}
                    onClick={() => previewApprove(r.id)}
                    disabled={saving}
                    type="button"
                  >
                    Approve
                  </button>
                  <button
                    className={styles.btnDanger}
                    onClick={() => previewReject(r.id)}
                    disabled={saving}
                    type="button"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}

            {pending.length === 0 && <div className={styles.empty}>No pending reviews.</div>}
          </div>
        </section>

        {/* Accepted */}
        <section className={`${containerStyles.roundContainer} ${styles.panel}`}>
          <div className={styles.panelHeader}>
            <h3 className={styles.h3}>Accepted Reviews</h3>
            <span className={styles.badge}>{acceptedCount}</span>
          </div>

          <div className={styles.list}>
            {accepted.map((r) => (
              <div key={r.id} className={styles.item}>
                <div className={styles.meta}>
                  <div className={styles.line1}>
                    <span className={styles.slug}>{r.diningHallSlug}</span>
                    <span className={styles.dot}>•</span>
                    <span className={styles.author}>{r.author}</span>
                    <span className={styles.dot}>•</span>
                    <span className={styles.rating}>{r.rating}★</span>
                  </div>
                  <div className={styles.desc}>{r.description}</div>
                  <div className={styles.time}>{new Date(r.createdAt).toLocaleString()}</div>
                </div>

                <div className={styles.actions}>
                  <button 
                    className={`${styles.btn} ${styles.btnWarning}`} 
                    onClick={() => previewMoveBack(r.id)} 
                    disabled={saving} 
                    type="button"
                  >
                    Move to Pending
                  </button>
                  <button
                    className={styles.btnDanger}
                    onClick={() => previewDeleteAccepted(r.id)}
                    disabled={saving}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {accepted.length === 0 && <div className={styles.empty}>No accepted reviews.</div>}
          </div>
        </section>
      </div>
    </div>
  );
}