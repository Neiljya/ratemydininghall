import Pill from '@components/ui/pill/Pill';
import styles from './category-filter.module.css';
import { useDraggableScroll } from '@hooks/useDraggableScroll'; 

interface CategoryFilterProps {
  categories: string[];
  selectedCategories: string[]; // <-- Now an array
  onToggleCategory: (category: string) => void; // <-- Changed to toggle
}

export default function CategoryFilter({
  categories,
  selectedCategories,
  onToggleCategory
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
        {categories.map((cat) => {
          // 'All' is selected if the array is empty, otherwise check if the category is in the array
          const isSelected = cat === 'All' 
            ? selectedCategories.length === 0 
            : selectedCategories.includes(cat);

          return (
            <div key={cat} className={styles.pillWrapper}>
              <Pill
                label={cat}
                size="sm"
                selected={isSelected}
                onClick={() => onToggleCategory(cat)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}