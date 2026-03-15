import styles from './tag-filter-widget.module.css'; // Make sure this path matches yours!
import { getTagName } from 'src/constants/tags';

interface TagFilterWidgetProps {
  dietaryTags: string[];
  allergenTags: string[];
  includedTags: string[];
  excludedTags: string[];
  onToggleIncluded: (tag: string) => void;
  onToggleExcluded: (tag: string) => void;
  onClear: () => void;
}

export default function TagFilterWidget({
  dietaryTags,
  allergenTags,
  includedTags,
  excludedTags,
  onToggleIncluded,
  onToggleExcluded,
  onClear
}: TagFilterWidgetProps) {
  
  const hasActiveFilters = includedTags.length > 0 || excludedTags.length > 0;

  if (dietaryTags.length === 0 && allergenTags.length === 0) return null;

  return (
    <div className={styles.widgetContainer}>
      <div className={styles.headerRow}>
        <h3 className={styles.title}>Filters</h3>
        {hasActiveFilters && (
          <button className={styles.clearBtn} onClick={onClear} type="button">
            Clear
          </button>
        )}
      </div>

      {/* --- Filter IN (Dietary) --- */}
      {dietaryTags.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Dietary
          </div>
          <div className={styles.tagList}>
            {dietaryTags.map(tag => {
              const isActive = includedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  className={`${styles.tagRow} ${isActive ? styles.active : ''}`}
                  onClick={() => onToggleIncluded(tag)}
                >
                  <div className={styles.checkbox}>
                    {isActive && <div className={styles.checkInner} />}
                  </div>
                  <span className={styles.tagName}>{getTagName(tag)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* --- Filter OUT (Allergens) --- */}
      {allergenTags.length > 0 && (
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Avoid
          </div>
          <div className={styles.tagList}>
            {allergenTags.map(tag => {
              const isActive = excludedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  className={`${styles.tagRow} ${isActive ? styles.active : ''}`}
                  onClick={() => onToggleExcluded(tag)}
                >
                  <div className={styles.checkbox}>
                    {isActive && <div className={styles.checkInner} />}
                  </div>
                  <span className={styles.tagName}>{getTagName(tag)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      
    </div>
  );
}