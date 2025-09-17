import styles from './Topbar.module.css';

function Topbar({ header }: { header?: string }) {
    return (
        <header className={styles.appHeader}>
            <div className={styles.container}>
                <h1 className={styles.title}>{header}</h1>
                <div className={styles.controls}>
                    <select 
                        id="sort-select" 
                        aria-label="Sort reviews"
                        className={styles.select}
                    >
                        <option value="newest">Newest</option>
                        <option value="rating-desc">Highest rated</option>
                        <option value="rating-asc">Lowest rated</option>
                        <option value="oldest">Oldest</option>
                    </select>
                    <button className={`${styles.btn} ${styles.btnPrimary}`}>
                        Add Review
                    </button>
                    <button className={styles.btn}>
                        Back to All Halls
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Topbar;