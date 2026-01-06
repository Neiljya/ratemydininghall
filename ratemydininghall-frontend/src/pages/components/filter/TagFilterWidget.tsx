import styles from './tag-filter-widget.module.css';

interface TagFilterWidgetProps {
    availableTags: string[];
    selectedTags: string[];
    onToggleTag: (tag: string) => void;
    onClear: () => void;
}

export default function TagFilterWidget({ 
    availableTags, 
    selectedTags, 
    onToggleTag, 
    onClear 
}: TagFilterWidgetProps) {

    if (availableTags.length === 0) return null;

    return (
        <div className={styles.widgetContainer}>
            <div className={styles.headerRow}>
                <h4 className={styles.title}>Filters</h4>
                {selectedTags.length > 0 && (
                    <button onClick={onClear} className={styles.clearBtn}>
                        Clear
                    </button>
                )}
            </div>
            
            {/* TODO: Change the checkbox style later because it looks a little ugly */}
            <div className={styles.tagList}>
                {availableTags.map(tag => {
                    const isActive = selectedTags.includes(tag);
                    return (
                        <button
                            key={tag}
                            className={`${styles.tagRow} ${isActive ? styles.active : ''}`}
                            onClick={() => onToggleTag(tag)}
                        >
                            <div className={styles.checkbox}>
                                {isActive && <div className={styles.checkInner} />}
                            </div>
                            <span className={styles.tagName}>{tag}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}