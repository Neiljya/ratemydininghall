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
  selectedCategory: string;
  selectedTags: string[];
  sortBy: string;
}

export default function MenuItemList({
  diningHallSlug,
  selectedId,
  onSelect,
  searchQuery,
  selectedCategory,
  selectedTags,
  sortBy
}: MenuItemListProps) {
  const { items, status } = useMenuItems(diningHallSlug);

  const sortedItems = useMemo(() => {
    if (!items) return [];
    let list = [...items];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item => 
        item.name.toLowerCase().includes(q) || 
        (item.description && item.description.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'All') {
      list = list.filter(item => item.category === selectedCategory);
    }

    if (selectedTags.length > 0) {
      list = list.filter(item => {
        if (!item.tags || item.tags.length === 0) return true;
        return !item.tags.some(tag => selectedTags.includes(tag));
      });
    }

    switch (sortBy) {
      case 'protein-desc': return list.sort((a, b) => (b.macros?.protein || 0) - (a.macros?.protein || 0));
      case 'calories-asc': return list.sort((a, b) => (a.macros?.calories || 0) - (b.macros?.calories || 0));
      case 'calories-desc': return list.sort((a, b) => (b.macros?.calories || 0) - (a.macros?.calories || 0));
      case 'carbs-desc': return list.sort((a, b) => (b.macros?.carbs || 0) - (a.macros?.carbs || 0));
      case 'fat-asc': return list.sort((a, b) => (a.macros?.fat || 0) - (b.macros?.fat || 0));
      default: return list;
    }
  }, [items, searchQuery, selectedCategory, selectedTags, sortBy]);

  if (status === 'loading') {
    return <div className={styles.muted}>Loading menu items…</div>;
  }

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