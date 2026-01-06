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
import CustomSelect from '@components/ui/custom-select/CustomSelect'; 
import MacroWidget from '@components/menu-items/macro-widget/MacroWidget';

export default function DiningHallDetailPage() {
  const { slug = '' } = useParams();
  useMenuItemsBootstrap(slug);
  const { items, status } = useMenuItems(slug);

  const reviewsByHall = useAppSelector(selectReviews);
  const [selected, setSelected] = useState<MenuItem | null>(null);
  
  console.log('selectedtags: ', selected?.tags);
  // state for the filtering dropdown
  const [sortBy, setSortBy] = useState<string>('default');

  // Filtering logic
  const sortedItems = useMemo(() => {
    if (!items) return [];
    // creating a copy to not modify the state itself
    const list = [...items];

    switch (sortBy) {
        case 'protein-desc':
            return list.sort((a, b) => (b.macros?.protein || 0) - (a.macros?.protein || 0));
        case 'calories-asc':
            return list.sort((a, b) => (a.macros?.calories || 0) - (b.macros?.calories || 0));
        case 'calories-desc':
            return list.sort((a, b) => (b.macros?.calories || 0) - (a.macros?.calories || 0));
        case 'carbs-desc':
            return list.sort((a, b) => (b.macros?.carbs || 0) - (a.macros?.carbs || 0));
        case 'fat-asc':
            return list.sort((a, b) => (a.macros?.fat || 0) - (b.macros?.fat || 0));
        default:
            return list;
    }
  }, [items, sortBy]);

  // --- Review Filtering ---
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
                ← Back
              </button>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
             <div className={styles.sectionTitle} style={{ margin: 0 }}>Today's Menu</div>
             
             {/* Filter / Sort Widget */}
             <div style={{ width: '170px' }}>
                <CustomSelect 
                    placeholder="Sort items..."
                    value={sortBy}
                    onChange={setSortBy}
                    options={[
                        { value: 'default', label: 'Default' },
                        { value: 'protein-desc', label: 'Highest Protein' },
                        { value: 'calories-asc', label: 'Lowest Calories' },
                        { value: 'calories-desc', label: 'Highest Calories' },
                        { value: 'carbs-desc', label: 'Highest Carbs' },
                        { value: 'fat-asc', label: 'Lowest Fat' },
                    ]}
                />
             </div>
          </div>

          {status === 'loading' ? (
            <div className={styles.muted} style={{ textAlign: 'left', padding: 0 }}>Loading menu items…</div>
          ) : null}

          <div className={styles.menuListContainer}>
            <div className={styles.menuList}>
              {/* Use sortedItems map */}
              {sortedItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  selected={selected?.id === item.id}
                  onClick={() => setSelected(item)}
                />
              ))}
              {status === 'succeeded' && sortedItems.length === 0 && (
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

          {selected && selected.macros && (
             <MacroWidget macros={selected.macros} />
          )}

          {selected && selected.tags && selected.tags.length > 0 && (
            <div className={styles.tagRow}>
                {selected.tags.map((tag) => (
                  <span key={tag} className={styles.tagBadge}>
                      {tag}
                  </span>
                ))}
            </div>
          )}

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