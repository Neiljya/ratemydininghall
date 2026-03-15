import { useMemo } from 'react';
import styles from './menu-item-list.module.css';
import { useMenuItems } from '@hooks/useMenuItems';
import { MenuItemCard } from '@components/menu-items/menu-item-card/MenuItemCard';
import type { MenuItem } from '@redux/menu-item-slice/menuItemTypes';
// 1. Import Redux hooks to access reviews
import { useAppSelector } from '@redux/hooks';
import { selectReviews } from '@redux/review-slice/reviewSliceSelectors';

interface MenuItemListProps {
  diningHallSlug: string;
  selectedId?: string | null;
  onSelect?: (item: MenuItem) => void;
  searchQuery: string;
  selectedCategories: string[]; 
  includedTags: string[]; 
  excludedTags: string[]; 
  sortBy: string;
}

export default function MenuItemList({
  diningHallSlug,
  selectedId,
  onSelect,
  searchQuery,
  selectedCategories, 
  includedTags,
  excludedTags,
  sortBy
}: MenuItemListProps) {
  const { items, status } = useMenuItems(diningHallSlug);
  
  // 2. Pull all reviews for this specific dining hall
  const reviewsByHall = useAppSelector(selectReviews);
  const hallReviews = reviewsByHall[diningHallSlug] || [];

  const sortedItems = useMemo(() => {
    if (!items) return [];
    let list = [...items];

    // ... Search Query Filter ...
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item => 
        item.name.toLowerCase().includes(q) || 
        (item.description && item.description.toLowerCase().includes(q))
      );
    }

    // ... Category Filter ...
    if (selectedCategories.length > 0) {
      list = list.filter(item => item.category && selectedCategories.includes(item.category));
    }

    // ... Filter OUT ...
    if (excludedTags.length > 0) {
      list = list.filter(item => {
        if (!item.tags || item.tags.length === 0) return true; 
        return !item.tags.some(tag => excludedTags.includes(tag));
      });
    }

    // ... Filter IN ...
    if (includedTags.length > 0) {
      list = list.filter(item => {
        if (!item.tags || item.tags.length === 0) return false;
        return includedTags.some(tag => item.tags!.includes(tag));
      });
    }

    // 3. Helper function to calculate average rating for sorting
    const getAverageRating = (itemId: string) => {
      const itemReviews = hallReviews.filter((r: any) => r.menuItemId === itemId);
      if (itemReviews.length === 0) return 0; // Unrated items get 0
      const sum = itemReviews.reduce((acc: number, r: any) => acc + r.rating, 0);
      return sum / itemReviews.length;
    };

    // 4. Sorting with the new Rating cases
    switch (sortBy) {
      case 'rating-desc': 
        return list.sort((a, b) => getAverageRating(b.id) - getAverageRating(a.id));
      case 'rating-asc': 
        return list.sort((a, b) => {
          // Push unrated items (0) to the bottom even when sorting by lowest rated
          const ratingA = getAverageRating(a.id) || 99; 
          const ratingB = getAverageRating(b.id) || 99;
          return ratingA - ratingB;
        });
      case 'protein-desc': return list.sort((a, b) => (b.macros?.protein || 0) - (a.macros?.protein || 0));
      case 'calories-asc': return list.sort((a, b) => (a.macros?.calories || 0) - (b.macros?.calories || 0));
      case 'calories-desc': return list.sort((a, b) => (b.macros?.calories || 0) - (a.macros?.calories || 0));
      case 'carbs-desc': return list.sort((a, b) => (b.macros?.carbs || 0) - (a.macros?.carbs || 0));
      case 'fat-asc': return list.sort((a, b) => (a.macros?.fat || 0) - (b.macros?.fat || 0));
      default: return list;
    }
  }, [items, searchQuery, selectedCategories, includedTags, excludedTags, sortBy, hallReviews]); 
  // ^ Make sure hallReviews is in the dependency array!

  if (status === 'loading') return <div className={styles.muted}>Loading menu items…</div>;

  return (
    <div className={styles.menuList}>
      {sortedItems.map(item => (
        <MenuItemCard
          key={item.id}
          item={item}
          selected={selectedId === item.id}
          onClick={() => onSelect?.(item)}
        />
      ))}
      {status === 'succeeded' && sortedItems.length === 0 && (
        <div className={styles.muted}>No items match your filters.</div>
      )}
    </div>
  );
}