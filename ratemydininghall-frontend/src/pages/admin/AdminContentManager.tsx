import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { selectDiningHalls } from "@redux/dining-hall-slice/diningHallSelectors";
import { fetchDiningHalls } from "@redux/dining-hall-slice/diningHallSlice";

import Notification, { type NotificationVariant } from "@components/notifications/Notification";
import CustomSelect from "@components/ui/custom-select/CustomSelect";
import styles from "./admin-content-manager.module.css";

import type { MenuItem } from "@redux/menu-item-slice/menuItemTypes";
import { useMenuItemsBootstrap } from "@hooks/useMenuItemsBootstrap";
import { fetchMenuItemsByHall } from "@redux/menu-item-slice/menuItemSlice";
import { useMenuItems } from "@hooks/useMenuItems";

import {
  createDiningHall,
  updateDiningHall,
  deleteDiningHall,
  createMenuItemsBatch,
  updateMenuItem,
  deleteMenuItem,
  type CreateMenuItemInput,
} from "@graphQL/mutations/adminRequests";

import { TAG_REGISTRY } from "../../constants/tags";

type Tab = "addHall" | "manageHalls" | "menuItems";

type DraftMenuItem = {
  name: string;
  description: string;
  imageUrl: string;
  tags: string[];
  price: string; 
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
};

function toNullableNum(s: string): number | null {
  const t = s.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

const TagSelector = ({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (tags: string[]) => void;
}) => {
  const availableTags = useMemo(
    () => Object.entries(TAG_REGISTRY).sort((a, b) => a[1].localeCompare(b[1])),
    []
  );

  const addTag = (id: string) => {
    if (id && !selected.includes(id)) {
      onChange([...selected, id]);
    }
  };

  const removeTag = (id: string) => {
    onChange(selected.filter((t) => t !== id));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", minHeight: "24px" }}>
        {selected.map((tagId) => (
          <span
            key={tagId}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "2px 8px",
              borderRadius: "12px",
              background: "#f0f2f5",
              border: "1px solid #d0d7de",
              fontSize: "0.8rem",
              fontWeight: 500,
              color: "#333",
            }}
          >
            {TAG_REGISTRY[tagId] || tagId}
            <button
              type="button"
              onClick={() => removeTag(tagId)}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "#666",
                fontSize: "14px",
                lineHeight: 1,
                padding: 0,
                display: "flex",
                alignItems: "center",
              }}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <select
        className={styles.input}
        onChange={(e) => {
          addTag(e.target.value);
          e.target.value = "";
        }}
        defaultValue=""
        style={{ padding: "6px" }}
      >
        <option value="" disabled>
          + Add Tag...
        </option>
        {availableTags.map(([id, label]) => (
          <option key={id} value={id} disabled={selected.includes(id)}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default function AdminContentManager() {
  const dispatch = useAppDispatch();
  const halls = useAppSelector(selectDiningHalls);

  const [tab, setTab] = useState<Tab>("addHall");
  const [saving, setSaving] = useState(false);
  const [notif, setNotif] = useState<{ show: boolean; message: string; variant: NotificationVariant }>({
    show: false,
    message: "",
    variant: "info",
  });

  const showNotif = (variant: NotificationVariant, message: string) => setNotif({ show: true, variant, message });

  // -------------------------
  // ADD HALL
  // -------------------------
  const [newHall, setNewHall] = useState({
    name: "",
    slug: "",
    imageUrl: "",
    description: "",
    parentHallSlug: "",
  });

  const createHall = async () => {
    if (!newHall.name.trim() || !newHall.slug.trim()) {
      showNotif("error", "Name and slug are required.");
      return;
    }

    if (newHall.parentHallSlug.trim() && newHall.parentHallSlug.trim() === newHall.slug.trim()) {
      showNotif("error", "Parent hall cannot be the same as the hall.");
      return;
    }

    setSaving(true);
    try {
      await createDiningHall({
        name: newHall.name.trim(),
        slug: newHall.slug.trim(),
        imageUrl: newHall.imageUrl.trim() || null,
        description: newHall.description.trim() || null,
        parentHallSlug: newHall.parentHallSlug.trim() || null,
      });

      showNotif("success", "Dining hall created.");
      setNewHall({ name: "", slug: "", imageUrl: "", description: "", parentHallSlug: "" });
      dispatch(fetchDiningHalls());
      setTab("manageHalls");
    } catch (e: any) {
      showNotif("error", e?.message ?? "Failed to create dining hall");
    } finally {
      setSaving(false);
    }
  };

  // -------------------------
  // MANAGE HALLS
  // -------------------------
  const [selectedHallId, setSelectedHallId] = useState<string>("");
  const selectedHall = useMemo(() => halls.find((h: any) => h.id === selectedHallId) ?? null, [halls, selectedHallId]);
  const hallOptions = useMemo(() => halls.map((h: any) => ({ value: h.id, label: h.name })), [halls]);

  const [editHall, setEditHall] = useState({
    name: "",
    slug: "",
    imageUrl: "",
    description: "",
    parentHallSlug: "",
  });

  useEffect(() => {
    if (!selectedHall) return;
    setEditHall({
      name: selectedHall.name ?? "",
      slug: selectedHall.slug ?? "",
      imageUrl: selectedHall.imageUrl ?? "",
      description: selectedHall.description ?? "",
      parentHallSlug: (selectedHall as any).parentHallSlug ?? "",
    });
  }, [selectedHall]);

  const saveHall = async () => {
    if (!selectedHall) return;
    if (!editHall.name.trim() || !editHall.slug.trim()) {
      showNotif("error", "Name and slug are required.");
      return;
    }

    if (editHall.parentHallSlug.trim() && editHall.parentHallSlug.trim() === editHall.slug.trim()) {
      showNotif("error", "Parent hall cannot be the same as the hall.");
      return;
    }

    setSaving(true);
    try {
      await updateDiningHall({
        id: selectedHall.id,
        name: editHall.name.trim(),
        slug: editHall.slug.trim(),
        imageUrl: editHall.imageUrl.trim() || null,
        description: editHall.description.trim() || null,
        parentHallSlug: editHall.parentHallSlug.trim() || null,
      });

      showNotif("success", "Dining hall updated.");
      dispatch(fetchDiningHalls());
    } catch (e: any) {
      showNotif("error", e?.message ?? "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const removeHall = async () => {
    if (!selectedHall) return;
    const ok = window.confirm(`Delete "${selectedHall.name}"?\n\nThis will also delete its menu items and reviews.`);
    if (!ok) return;
    setSaving(true);
    try {
      await deleteDiningHall(selectedHall.id);
      showNotif("success", "Dining hall deleted.");
      setSelectedHallId("");
      dispatch(fetchDiningHalls());
    } catch (e: any) {
      showNotif("error", e?.message ?? "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  // -------------------------
  // MENU ITEMS
  // -------------------------
  const [itemsHallSlug, setItemsHallSlug] = useState<string>("");
  useMenuItemsBootstrap(itemsHallSlug);
  const { items: hallItems, status: itemsStatus } = useMenuItems(itemsHallSlug);
  const hallSlugOptions = useMemo(() => halls.map((h: any) => ({ value: h.slug, label: h.name })), [halls]);

  const [drafts, setDrafts] = useState<DraftMenuItem[]>([
    { name: "", description: "", imageUrl: "", tags: [], price: "", calories: "", protein: "", carbs: "", fat: "" }, // ✅ added
  ]);

  const addDraftRow = () =>
    setDrafts((prev) => [
      ...prev,
      { name: "", description: "", imageUrl: "", tags: [], price: "", calories: "", protein: "", carbs: "", fat: "" }, // ✅ added
    ]);

  const removeDraftRow = (idx: number) => setDrafts((prev) => prev.filter((_, i) => i !== idx));

  const updateDraft = (idx: number, patch: Partial<DraftMenuItem>) =>
    setDrafts((prev) => prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)));

  const saveBatchMenuItems = async () => {
    const slug = itemsHallSlug.trim();
    if (!slug) {
      showNotif("error", "Pick a dining hall for menu items first.");
      return;
    }

    const cleaned: CreateMenuItemInput[] = drafts
      .map((d) => ({
        diningHallSlug: slug,
        name: d.name.trim(),
        description: d.description.trim() || null,
        imageUrl: d.imageUrl.trim() || null,
        tags: d.tags,
        price: toNullableNum(d.price), // ✅ added
        macros: {
          calories: toNullableNum(d.calories),
          protein: toNullableNum(d.protein),
          carbs: toNullableNum(d.carbs),
          fat: toNullableNum(d.fat),
        },
      }))
      .filter((x) => x.name.length > 0);

    if (cleaned.length === 0) {
      showNotif("error", "Add at least 1 menu item name before saving.");
      return;
    }

    setSaving(true);
    try {
      await createMenuItemsBatch(slug, cleaned);
      showNotif("success", `Uploaded ${cleaned.length} menu item(s).`);
      setDrafts([{ name: "", description: "", imageUrl: "", tags: [], price: "", calories: "", protein: "", carbs: "", fat: "" }]); // ✅ added
      dispatch(fetchMenuItemsByHall(slug));
    } catch (e: any) {
      showNotif("error", e?.message ?? "Failed to upload menu items batch");
    } finally {
      setSaving(false);
    }
  };

  const [editItemId, setEditItemId] = useState<string>("");

  const editItem = useMemo<MenuItem | null>(
    () => (hallItems ?? []).find((m: any) => m.id === editItemId) ?? null,
    [hallItems, editItemId]
  );

  const itemOptions = useMemo(() => (hallItems ?? []).map((m: any) => ({ value: m.id, label: m.name })), [hallItems]);

  const [editItemForm, setEditItemForm] = useState<{
    name: string;
    description: string;
    imageUrl: string;
    tags: string[];
    price: string; // ✅ added
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  }>({
    name: "",
    description: "",
    imageUrl: "",
    tags: [],
    price: "", // ✅ added
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });

  useEffect(() => {
    if (!editItem) return;
    setEditItemForm({
      name: editItem.name ?? "",
      description: (editItem as any).description ?? "",
      imageUrl: (editItem as any).imageUrl ?? "",
      tags: (editItem as any).tags ?? [],
      price: String((editItem as any).price ?? ""), // ✅ added
      calories: String((editItem as any).macros?.calories ?? ""),
      protein: String((editItem as any).macros?.protein ?? ""),
      carbs: String((editItem as any).macros?.carbs ?? ""),
      fat: String((editItem as any).macros?.fat ?? ""),
    });
  }, [editItem]);

  const saveMenuItemEdits = async () => {
    if (!editItemId) return;

    if (!editItemForm.name.trim()) {
      showNotif("error", "Menu item name is required.");
      return;
    }

    setSaving(true);
    try {
      await updateMenuItem(editItemId, {
        name: editItemForm.name.trim(),
        description: editItemForm.description.trim() || null,
        imageUrl: editItemForm.imageUrl.trim() || null,
        tags: editItemForm.tags,
        price: toNullableNum(editItemForm.price), // ✅ added
        macros: {
          calories: toNullableNum(editItemForm.calories),
          protein: toNullableNum(editItemForm.protein),
          carbs: toNullableNum(editItemForm.carbs),
          fat: toNullableNum(editItemForm.fat),
        },
      });

      showNotif("success", "Menu item updated.");
      dispatch(fetchMenuItemsByHall(itemsHallSlug));
    } catch (e: any) {
      showNotif("error", e?.message ?? "Failed to update menu item");
    } finally {
      setSaving(false);
    }
  };

  const removeMenuItem = async () => {
    if (!editItemId) return;
    const ok = window.confirm("Delete this menu item?");
    if (!ok) return;

    setSaving(true);
    try {
      await deleteMenuItem(editItemId);
      showNotif("success", "Menu item deleted.");
      setEditItemId("");
      dispatch(fetchMenuItemsByHall(itemsHallSlug));
    } catch (e: any) {
      showNotif("error", e?.message ?? "Failed to delete menu item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <Notification
        show={notif.show}
        variant={notif.variant}
        message={notif.message}
        durationMs={2600}
        onClose={() => setNotif((n) => ({ ...n, show: false }))}
      />

      <div className={styles.tabRow}>
        <button className={`${styles.tabBtn} ${tab === "addHall" ? styles.tabActive : ""}`} onClick={() => setTab("addHall")} type="button">
          Add Hall
        </button>
        <button className={`${styles.tabBtn} ${tab === "manageHalls" ? styles.tabActive : ""}`} onClick={() => setTab("manageHalls")} type="button">
          Manage Halls
        </button>
        <button className={`${styles.tabBtn} ${tab === "menuItems" ? styles.tabActive : ""}`} onClick={() => setTab("menuItems")} type="button">
          Menu Items
        </button>
      </div>

      {/* ADD HALL */}
      {tab === "addHall" && (
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Add Dining Hall</h3>

          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label}>Name</label>
              <input className={styles.input} value={newHall.name} onChange={(e) => setNewHall((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. 64 Degrees" />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Slug</label>
              <input className={styles.input} value={newHall.slug} onChange={(e) => setNewHall((p) => ({ ...p, slug: e.target.value }))} placeholder="e.g. 64-degrees" />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Parent Hall Slug (optional)</label>
            <input className={styles.input} value={newHall.parentHallSlug} onChange={(e) => setNewHall((p) => ({ ...p, parentHallSlug: e.target.value }))} placeholder="e.g. ventanas (leave blank for none)" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Image URL</label>
            <input className={styles.input} value={newHall.imageUrl} onChange={(e) => setNewHall((p) => ({ ...p, imageUrl: e.target.value }))} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea className={styles.textarea} rows={3} value={newHall.description} onChange={(e) => setNewHall((p) => ({ ...p, description: e.target.value }))} />
          </div>

          <div className={styles.actionsRow}>
            <button className={styles.primaryBtn} type="button" disabled={saving} onClick={createHall}>
              {saving ? "Saving..." : "Create Dining Hall"}
            </button>
          </div>
        </div>
      )}

      {/* MANAGE HALLS */}
      {tab === "manageHalls" && (
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Edit / Delete Dining Halls</h3>

          <div className={styles.field}>
            <label className={styles.label}>Select Hall</label>
            <CustomSelect options={hallOptions} value={selectedHallId} onChange={setSelectedHallId} placeholder="-- Choose a hall to edit --" />
          </div>

          {!selectedHall ? (
            <div className={styles.muted}>Please select a dining hall above.</div>
          ) : (
            <>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label className={styles.label}>Name</label>
                  <input className={styles.input} value={editHall.name} onChange={(e) => setEditHall((p) => ({ ...p, name: e.target.value }))} />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Slug</label>
                  <input className={styles.input} value={editHall.slug} onChange={(e) => setEditHall((p) => ({ ...p, slug: e.target.value }))} />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Parent Hall Slug (optional)</label>
                <input className={styles.input} value={editHall.parentHallSlug} onChange={(e) => setEditHall((p) => ({ ...p, parentHallSlug: e.target.value }))} placeholder="e.g. ventanas (leave blank for none)" />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Image URL</label>
                <input className={styles.input} value={editHall.imageUrl} onChange={(e) => setEditHall((p) => ({ ...p, imageUrl: e.target.value }))} />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Description</label>
                <textarea className={styles.textarea} rows={3} value={editHall.description} onChange={(e) => setEditHall((p) => ({ ...p, description: e.target.value }))} />
              </div>

              <div className={styles.actionsRow}>
                <button className={styles.dangerBtn} type="button" disabled={saving} onClick={removeHall}>
                  Delete Hall
                </button>
                <button className={styles.primaryBtn} type="button" disabled={saving} onClick={saveHall}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* MENU ITEMS */}
      {tab === "menuItems" && (
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Menu Items Manager</h3>

          <div className={styles.field}>
            <label className={styles.label}>Select Dining Hall</label>
            <CustomSelect options={hallSlugOptions} value={itemsHallSlug} onChange={setItemsHallSlug} placeholder="-- Choose a hall --" />
          </div>

          <h4 className={styles.subTitle}>Batch Upload New Items</h4>
          {drafts.map((d, idx) => (
            <div key={idx} className={styles.itemRow}>
              <div className={styles.grid2}>
                <input className={styles.input} placeholder="Item Name" value={d.name} onChange={(e) => updateDraft(idx, { name: e.target.value })} />
                <input className={styles.input} placeholder="Image URL (optional)" value={d.imageUrl} onChange={(e) => updateDraft(idx, { imageUrl: e.target.value })} />
              </div>

              {/* ✅ price field added for batch */}
              <input className={styles.input} placeholder="Price (e.g. 4.99)" value={d.price} onChange={(e) => updateDraft(idx, { price: e.target.value })} />

              <input className={styles.input} placeholder="Description" value={d.description} onChange={(e) => updateDraft(idx, { description: e.target.value })} />
              <div className={styles.field}>
                <label className={styles.label} style={{ fontSize: "0.85rem" }}>
                  Tags
                </label>
                <TagSelector selected={d.tags} onChange={(newTags) => updateDraft(idx, { tags: newTags })} />
              </div>

              <div className={styles.macroRow}>
                <input className={styles.input} placeholder="Cals" value={d.calories} onChange={(e) => updateDraft(idx, { calories: e.target.value })} />
                <input className={styles.input} placeholder="Protein" value={d.protein} onChange={(e) => updateDraft(idx, { protein: e.target.value })} />
                <input className={styles.input} placeholder="Carbs" value={d.carbs} onChange={(e) => updateDraft(idx, { carbs: e.target.value })} />
                <input className={styles.input} placeholder="Fat" value={d.fat} onChange={(e) => updateDraft(idx, { fat: e.target.value })} />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className={styles.iconBtn} type="button" onClick={() => removeDraftRow(idx)} disabled={drafts.length === 1}>
                  Delete Row ✕
                </button>
              </div>
            </div>
          ))}

          <div className={styles.actionsRow}>
            <button className={styles.ghostBtn} type="button" onClick={addDraftRow}>
              + Add Another Row
            </button>
            <button className={styles.primaryBtn} type="button" disabled={saving || !itemsHallSlug} onClick={saveBatchMenuItems}>
              {saving ? "Saving..." : "Upload Batch"}
            </button>
          </div>

          <h4 className={styles.subTitle} style={{ marginTop: "40px" }}>
            Edit Existing Items
          </h4>

          {!itemsHallSlug ? (
            <div className={styles.muted}>Select a dining hall above.</div>
          ) : itemsStatus === "loading" ? (
            <div className={styles.muted}>Loading menu items…</div>
          ) : (
            <>
              <div className={styles.field}>
                <label className={styles.label}>Select Item to Edit</label>
                <CustomSelect options={itemOptions} value={editItemId} onChange={setEditItemId} placeholder="-- Choose item --" />
              </div>

              {!editItemId ? (
                <div className={styles.muted}>Pick a menu item to edit details.</div>
              ) : (
                <div style={{ marginTop: "20px", borderTop: "1px solid var(--color-border-soft)", paddingTop: "20px" }}>
                  <div className={styles.grid2}>
                    <div className={styles.field}>
                      <label className={styles.label}>Name</label>
                      <input className={styles.input} value={editItemForm.name} onChange={(e) => setEditItemForm((p) => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Image URL</label>
                      <input className={styles.input} value={editItemForm.imageUrl} onChange={(e) => setEditItemForm((p) => ({ ...p, imageUrl: e.target.value }))} />
                    </div>
                  </div>

                  {/* ✅ price field added for edit */}
                  <div className={styles.field}>
                    <label className={styles.label}>Price</label>
                    <input
                      className={styles.input}
                      placeholder="e.g. 4.99"
                      value={editItemForm.price}
                      onChange={(e) => setEditItemForm((p) => ({ ...p, price: e.target.value }))}
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Description</label>
                    <textarea className={styles.textarea} rows={2} value={editItemForm.description} onChange={(e) => setEditItemForm((p) => ({ ...p, description: e.target.value }))} />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Tags</label>
                    <TagSelector selected={editItemForm.tags} onChange={(newTags) => setEditItemForm((p) => ({ ...p, tags: newTags }))} />
                  </div>

                  <div className={styles.macroRow2}>
                    <div className={styles.field}>
                      <label className={styles.label}>Cals</label>
                      <input className={styles.input} value={editItemForm.calories} onChange={(e) => setEditItemForm((p) => ({ ...p, calories: e.target.value }))} />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Protein</label>
                      <input className={styles.input} value={editItemForm.protein} onChange={(e) => setEditItemForm((p) => ({ ...p, protein: e.target.value }))} />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Carbs</label>
                      <input className={styles.input} value={editItemForm.carbs} onChange={(e) => setEditItemForm((p) => ({ ...p, carbs: e.target.value }))} />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Fat</label>
                      <input className={styles.input} value={editItemForm.fat} onChange={(e) => setEditItemForm((p) => ({ ...p, fat: e.target.value }))} />
                    </div>
                  </div>

                  <div className={styles.actionsRow}>
                    <button className={styles.dangerBtn} type="button" disabled={saving} onClick={removeMenuItem}>
                      Delete Item
                    </button>
                    <button className={styles.primaryBtn} type="button" disabled={saving} onClick={saveMenuItemEdits}>
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
