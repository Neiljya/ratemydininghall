import { useMemo } from 'react';
import styles from './menu-item-list.module.css';
import { useMenuItems } from '@hooks/useMenuItems';
import { MenuItemCard } from '@components/menu-items/menu-item-card/MenuItemCard';
import type { MenuItem } from '@redux/menu-item-slice/menuItemTypes';

interface MenuItemListProps {
  diningHallSlug: string;
  selectedId?: string | null;
  onSelect?: (item: MenuItem) => void;
  searchQuery: string;
  selectedCategories: string[]; 
  includedTags: string[]; // <-- Replaced selectedTags
  excludedTags: string[]; // <-- New exclusion array
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

  const sortedItems = useMemo(() => {
    if (!items) return [];
    let list = [...items];

    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item => 
        item.name.toLowerCase().includes(q) || 
        (item.description && item.description.toLowerCase().includes(q))
      );
    }

    // 2. Category Filter
    if (selectedCategories.length > 0) {
      list = list.filter(item => item.category && selectedCategories.includes(item.category));
    }

    // 3. Filter OUT (Allergens/Ingredients to avoid)
    if (excludedTags.length > 0) {
      list = list.filter(item => {
        if (!item.tags || item.tags.length === 0) return true; // Safe if it has no tags
        // If the item contains ANY of the excluded tags, drop it
        return !item.tags.some(tag => excludedTags.includes(tag));
      });
    }

    // 4. Filter IN (Dietary preferences)
    if (includedTags.length > 0) {
      list = list.filter(item => {
        if (!item.tags || item.tags.length === 0) return false;
        // Keep it if it matches AT LEAST ONE of the included dietary tags
        return includedTags.some(tag => item.tags!.includes(tag));
      });
    }

    // 5. Sorting
    switch (sortBy) {
      case 'protein-desc': return list.sort((a, b) => (b.macros?.protein || 0) - (a.macros?.protein || 0));
      case 'calories-asc': return list.sort((a, b) => (a.macros?.calories || 0) - (b.macros?.calories || 0));
      case 'calories-desc': return list.sort((a, b) => (b.macros?.calories || 0) - (a.macros?.calories || 0));
      case 'carbs-desc': return list.sort((a, b) => (b.macros?.carbs || 0) - (a.macros?.carbs || 0));
      case 'fat-asc': return list.sort((a, b) => (a.macros?.fat || 0) - (b.macros?.fat || 0));
      default: return list;
    }
  }, [items, searchQuery, selectedCategories, includedTags, excludedTags, sortBy]); 

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