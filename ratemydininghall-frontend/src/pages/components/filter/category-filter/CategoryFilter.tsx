import Pill from '@components/ui/pill/Pill';
import styles from './category-filter.module.css';
import { useDraggableScroll } from '@hooks/useDraggableScroll'; // Import the hook

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory
}: CategoryFilterProps) {

  const { scrollRef, events } = useDraggableScroll();

  if (categories.length <= 1) return null;

  return (
    <div className={styles.container}>
      <div
        className={styles.scrollArea}
        ref={scrollRef}
        {...events}
      >
        {categories.map((cat) => (
          <div key={cat} className={styles.pillWrapper}>
            <Pill
              label={cat}
              size="sm"
              selected={selectedCategory === cat}
              onClick={() => onSelectCategory(cat)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}