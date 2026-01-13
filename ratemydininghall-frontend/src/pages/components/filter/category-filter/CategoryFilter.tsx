import Pill from '@components/ui/pill/Pill';
import styles from './category-filter.module.css';

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
  
  if (categories.length <= 1) return null;

  return (
    <div className={styles.container}>
      <div className={styles.scrollArea}>
        {categories.map((cat) => (
          <Pill
            key={cat}
            label={cat}
            size="sm" 
            selected={selectedCategory === cat}
            onClick={() => onSelectCategory(cat)}
          />
        ))}
      </div>
    </div>
  );
}