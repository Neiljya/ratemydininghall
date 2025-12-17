import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import styles from './dining-hall-detail.module.css';

import { useMenuItemsBootstrap } from '@hooks/useMenuItemsBootstrap';
import { useMenuItems } from '@hooks/useMenuItems';
import { useAppSelector } from '@redux/hooks';
import { selectReviews } from '@redux/review-slice/reviewSliceSelectors';

import type { MenuItem } from '@redux/menu-item-slice/menuItemTypes';
import { MenuItemCard } from '@components/menu-items/menu-item-card/MenuItemCard';
import ReviewForm from '@components/reviews/review-form/ReviewForm';
import ReviewItem from '@components/reviews/review-item/ReviewItem';

export default function DiningHallDetailPage() {
  const { slug = '' } = useParams();
  useMenuItemsBootstrap(slug);
  const { items, status } = useMenuItems(slug);

  const reviewsByHall = useAppSelector(selectReviews);
  const [selected, setSelected] = useState<MenuItem | null>(null);

  // accepted review list in store;
  const hallReviews = useMemo(() => {
    const list = reviewsByHall[slug] ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return list.filter((r: any) => !r.menuItemId);   
  }, [reviewsByHall, slug]);

  const menuItemReviews = useMemo(() => {
    if (!selected) return [];
    const list = reviewsByHall[slug] ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return list.filter((r: any) => r.menuItemId === selected.id); 
  }, [reviewsByHall, slug, selected]);

  const activeReviews = selected ? menuItemReviews : hallReviews;

  const formatTitle = (s: string) => s.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const displayTitle = formatTitle(slug);

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        
        {/* Left Column: Menu Items */}
        <aside className={styles.leftColumn}>
          <div className={styles.header}>
            <h2 className={styles.title}>{displayTitle}</h2>
            {selected && (
              <button
                className={styles.ghostBtn}
                onClick={() => setSelected(null)}
                type="button"
              >
                ← Back to Hall Overview
              </button>
            )}
          </div>

          <div className={styles.sectionTitle}>Today's Menu</div>

          {status === 'loading' ? (
            <div className={styles.muted} style={{ textAlign: 'left', padding: 0 }}>Loading menu items…</div>
          ) : null}

          {/* Scrollable container for menu items */}
          <div className={styles.menuListContainer}>
            <div className={styles.menuList}>
              {items.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  selected={selected?.id === item.id}
                  onClick={() => setSelected(item)}
                />
              ))}
              {status === 'succeeded' && items.length === 0 && (
                 <div className={styles.muted}>No menu items found for today.</div>
              )}
            </div>
          </div>
        </aside>

        {/* Right Panel: Reviews & Form */}
        <main className={styles.rightPanel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>
              {selected ? selected.name : 'Dining Hall Reviews'}
            </h2>
            <p className={styles.panelSubtitle}>
                {selected ? 'Share your thoughts on this item.' : `See what others are saying about ${displayTitle}.`}
            </p>
          </div>

          {/* Scrollable container for past reviews (MOVED ABOVE FORM) */}
          <div className={styles.reviewListContainer}>
            <div className={styles.reviewList}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {activeReviews.map((r: any) => (
                <ReviewItem
                    key={r.id}
                    rating={r.rating}
                    author={r.author}
                    description={r.description}
                    date={Number(r.createdAt)}
                />
              ))}

              {activeReviews.length === 0 ? (
                <div className={styles.muted}>
                  No reviews yet. Be the first to share your experience!
                </div>
              ) : null}
            </div>
          </div>

          {/* Review Form sits at the BOTTOM of the panel */}
          <div className={styles.formContainer}>
            <ReviewForm
              diningHallSlug={slug}
              menuItemId={selected?.id ?? null}
            />
          </div>
        </main>
      </div>
    </div>
  );
}