import styles from './menu-item-card.module.css';
import type { MenuItem } from '@redux/menu-item-slice/menuItemTypes';
import Stars from '@components/stars/Stars';

type Props = {
  item: MenuItem;
  selected?: boolean;
  onClick?: () => void;
};

export function MenuItemCard({ item, selected, onClick }: Props) {
  return (
    <button
      type="button"
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={onClick}
    >
      <div className={styles.topRow}>
        <div className={styles.title}>{item.name}</div>

        <div className={styles.rating}>
          <Stars starCount={item.avgRating} />
          <span className={styles.count}>({item.ratingCount})</span>
        </div>
      </div>

      {item.description ? <div className={styles.desc}>{item.description}</div> : null}
      <div className={styles.metaRow}>
      {item.price != null ? (
          <span className={styles.pill} style={{ fontWeight: 600, color: '#333' }}>
            ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
          </span>
        ) : null}
        {item.macros?.calories != null ? (
          <span className={styles.pill}>{item.macros.calories} cal</span>
        ) : null}
        {item.macros?.protein != null ? (
          <span className={styles.pill}>{item.macros.protein}g protein</span>
        ) : null}
      </div>
    </button>
  );
}
