import styles from './macro-widget.module.css';

interface Props {
  macros?: {
    calories?: number | null;
    protein?: number | null;
    carbs?: number | null;
    fat?: number | null;
  } | null;
}

export default function MacroWidget({ macros }: Props) {
  if (!macros) return null;

  const val = (n?: number | null) => (n !== undefined && n !== null ? n : '-');

  return (
    <div className={styles.widget}>
      <div className={styles.mainStat}>
        <span className={styles.caloriesValue}>{val(macros.calories)}</span>
        <span className={styles.caloriesLabel}>Calories</span>
      </div>
      
      <div className={styles.grid}>
        <div className={styles.statItem}>
          <span className={styles.label}>Protein</span>
          <div className={styles.barContainer}>
             {/* Simple visual bar based on a rough max of 50g */}
             <div className={styles.bar} style={{ width: `${Math.min((macros.protein || 0) * 2, 100)}%`, background: '#3b82f6' }} />
          </div>
          <span className={styles.value}>{val(macros.protein)}g</span>
        </div>

        <div className={styles.statItem}>
          <span className={styles.label}>Carbs</span>
          <div className={styles.barContainer}>
             <div className={styles.bar} style={{ width: `${Math.min((macros.carbs || 0), 100)}%`, background: '#f59e0b' }} />
          </div>
          <span className={styles.value}>{val(macros.carbs)}g</span>
        </div>

        <div className={styles.statItem}>
          <span className={styles.label}>Fat</span>
          <div className={styles.barContainer}>
             <div className={styles.bar} style={{ width: `${Math.min((macros.fat || 0) * 2, 100)}%`, background: '#ef4444' }} />
          </div>
          <span className={styles.value}>{val(macros.fat)}g</span>
        </div>
      </div>
    </div>
  );
}