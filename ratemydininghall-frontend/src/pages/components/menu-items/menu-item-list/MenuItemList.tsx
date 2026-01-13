import { useMemo } from 'react';
import styles from './menu-item-list.module.css'; 
import { useMenuItems } from '@hooks/useMenuItems';
import type { MenuItem } from '@redux/menu-item-slice/menuItemTypes';
import { MenuItemCard } from '@components/menu-items/menu-item-card/MenuItemCard';

interface MenuItemListProps {
  diningHallSlug: string;
  selectedId?: string | null;
  onSelect?: (item: MenuItem) => void;
  sortBy?: string;
  selectedCategory?: string;
  selectedTags?: string[];
}

export default function MenuItemList({
  diningHallSlug,
  selectedId,
  onSelect,
  sortBy = 'default',
  selectedCategory = 'All',
  selectedTags = [],
}: MenuItemListProps) {
  const { items, status } = useMenuItems(diningHallSlug);


  const sortedItems = useMemo(() => {
    if (!items) return [];

    let list = [...items];

    if (selectedCategory !== 'All') {
      list = list.filter((item) => item.category === selectedCategory);
    }

    if (selectedTags.length > 0) {
      list = list.filter((item) => {
        if (!item.tags || item.tags.length === 0) return true;
        const hasExcludedTag = item.tags.some((tag) => selectedTags.includes(tag));
        return !hasExcludedTag;
      });
    }

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
  }, [items, sortBy, selectedTags, selectedCategory]);

  if (status === 'loading') {
    return <div className={styles.muted}>Loading menu items…</div>;
  }

  return (
    <div className={styles.menuList}>
      {sortedItems.map((item) => (
        <MenuItemCard
          key={item.id}
          item={item}
          selected={selectedId === item.id}
          onClick={() => onSelect?.(item)}
        />
      ))}

      {status === 'succeeded' && sortedItems.length === 0 && (
        <div className={styles.muted}>No menu items found.</div>
      )}
    </div>
  );
}