import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './dining-hall-detail.module.css';
import { useMenuItemsBootstrap } from '@hooks/useMenuItemsBootstrap';
import { useMenuItems } from '@hooks/useMenuItems';
import { useAppSelector } from '@redux/hooks';
import { selectReviews } from '@redux/review-slice/reviewSliceSelectors';
import type { MenuItem } from '@redux/menu-item-slice/menuItemTypes';
import globalPopupStyles from '@globalStyles/popup-styles/popupStyles.module.css';
import ReviewForm from '@components/reviews/review-form/ReviewForm';
import ReviewItem from '@components/reviews/review-item/ReviewItem';
import CustomSelect from '@components/ui/custom-select/CustomSelect';
import MacroWidget from '@components/menu-items/macro-widget/MacroWidget';
import TagFilterWidget from '@components/filter/TagFilterWidget';
import CloseButton from '@components/ui/close-button/CloseButton';
import PriceTag from '@components/ui/price-tag/PriceTag';
import CategoryFilter from '@components/filter/category-filter/CategoryFilter';
import Pill from '@components/ui/pill/Pill';
import MenuItemList from '@components/menu-items/menu-item-list/MenuItemList';
import { TAG_REGISTRY } from 'src/constants/tags';

export default function DiningHallDetailPage() {
  const { slug = '' } = useParams();
  

  useMenuItemsBootstrap(slug);
  const { items } = useMenuItems(slug);
  const reviewsByHall = useAppSelector(selectReviews);
  const [isClosing, setIsClosing] = useState(false);
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('default');

  const availableCategories = useMemo(() => {
    if (!items) return ['All'];
    const cats = new Set<string>(['All']);
    items.forEach(item => {
      if (item.category) cats.add(item.category);
    });
    return Array.from(cats);
  }, [items]);

  const availableTags = useMemo(() => {
    if (!items) return [];
    const tags = new Set<string>();
    items.forEach(item => {
      item.tags?.forEach(tagId => {
        if (TAG_REGISTRY[tagId]) tags.add(tagId);
      });
    });
    return Array.from(tags).sort((a, b) => 
      TAG_REGISTRY[a].localeCompare(TAG_REGISTRY[b])
    );
  }, [items]);

  const hallReviews = useMemo(() => {
    const list = reviewsByHall[slug] ?? [];
    return list.filter((r: any) => !r.menuItemId);
  }, [reviewsByHall, slug]);

  const menuItemReviews = useMemo(() => {
    if (!selected) return [];
    const list = reviewsByHall[slug] ?? [];
    return list.filter((r: any) => r.menuItemId === selected.id);
  }, [reviewsByHall, slug, selected]);

  const activeReviews = selected ? menuItemReviews : hallReviews;

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleCloseMobile = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelected(null);
      setIsClosing(false);
    }, 200);
  };

  const formatTitle = (s: string) =>
    s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        
        {/* ================= LEFT COLUMN ================= */}
        <aside className={styles.leftColumn}>
          <div className={styles.header}>
            <h2 className={styles.title}>{formatTitle(slug)}</h2>
            {selected && (
              <button className={styles.ghostBtn} onClick={() => setSelected(null)} type="button">
                ← Back
              </button>
            )}
          </div>

          <div className={styles.controlsRow}>
            <div className={styles.sectionTitle} style={{ margin: 0 }}>
              Today's Menu
            </div>
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

          <CategoryFilter 
            categories={availableCategories} 
            selectedCategory={selectedCategory} 
            onSelectCategory={setSelectedCategory} 
          />

          <div className={styles.contentSplit}>
            <TagFilterWidget
              availableTags={availableTags}
              selectedTags={selectedTags}
              onToggleTag={toggleTag}
              onClear={() => setSelectedTags([])}
            />
            
            <MenuItemList 
              diningHallSlug={slug}
              selectedId={selected?.id}
              onSelect={setSelected}
              sortBy={sortBy}
              selectedCategory={selectedCategory}
              selectedTags={selectedTags}
            />
          </div>
        </aside>

        {/* ... (Mobile Backdrop & Right Panel Logic remains identical) ... */}
        {selected && (
          <div
            className={`${styles.mobileBackdrop} ${globalPopupStyles.popupBackground} ${isClosing ? globalPopupStyles.closing : ''}`}
            onClick={handleCloseMobile}
          />
        )}

        <main className={`${styles.rightPanel} ${selected ? styles.mobilePopup : ''} ${selected ? globalPopupStyles.popupContent : ''} ${isClosing ? globalPopupStyles.closing : ''}`}>
          {selected && (
            <div className={styles.mobileCloseBtn}>
              <CloseButton onClick={handleCloseMobile} />
            </div>
          )}

          <div className={styles.panelHeader}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                <h2 className={styles.panelTitle}>
                    {selected ? selected.name : 'Dining Hall Reviews'}
                </h2>
                {selected?.price != null && <PriceTag price={selected.price} size="sm" />}
            </div>
            <p className={styles.panelSubtitle}>
              {selected ? 'Share your thoughts on this item.' : `See what others are saying about ${formatTitle(slug)}.`}
            </p>
          </div>

          {selected && selected.macros && <MacroWidget macros={selected.macros} />}

          {selected && selected.tags && selected.tags.length > 0 && (
            <div className={styles.tagRow}>
              {selected.tags.filter(t => TAG_REGISTRY[t]).map(t => (
                  <Pill key={t} label={TAG_REGISTRY[t]} size="sm" />
              ))}
            </div>
          )}

          <div className={styles.reviewListContainer}>
            <div className={styles.reviewList}>
              {activeReviews.map((r: any) => (
                <ReviewItem key={r.id} rating={r.rating} author={r.author} description={r.description} date={Number(r.createdAt)} />
              ))}
              {activeReviews.length === 0 && <div className={styles.muted}>No reviews yet.</div>}
            </div>
          </div>

          <div className={styles.formContainer}>
            <ReviewForm diningHallSlug={slug} menuItemId={selected?.id ?? null} />
          </div>
        </main>
      </div>
    </div>
  );
}