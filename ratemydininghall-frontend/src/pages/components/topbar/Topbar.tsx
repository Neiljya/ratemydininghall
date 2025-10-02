import { useState } from 'react';
import { selectDiningHalls } from '@redux/dining-hall-slice/diningHallSelectors';
import { useSelector } from 'react-redux';
import styles from './Topbar.module.css';
import globalContainerStyles from '@containerStyles/globalContainer.module.css';
import popupStyles from '@globalStyles/popup-styles/popupStyles.module.css';
import ReviewForm from '@components/reviews/review-form/ReviewForm';

function Topbar({ header }: { header?: string }) {
    // Fetch dining halls from redux store, we only need to fetch it once here and pass it down
    const diningHalls = useSelector(selectDiningHalls);
    const [isReviewFormOpen, setReviewFormOpen] = useState(false);

    const handleOpenReviewForm = () => setReviewFormOpen(true);
    const handleCloseReviewForm = () => setReviewFormOpen(false);

    return (
    <>
        <header className={styles.appHeader}>
        <div className={styles.container}>
            <h1 className={styles.title}>{header}</h1>
            <div className={styles.controls}>
            <select
                id="sort-select"
                aria-label="Sort reviews"
                className={styles.select}
            >
                <option value="rating-desc">Highest rated</option>
                <option value="rating-asc">Lowest rated</option>
            </select>

            <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleOpenReviewForm}
            >
                Add Review
            </button>

            <button className={styles.btn}>
                Back to All Halls
            </button>
            </div>
        </div>
        </header>

        {isReviewFormOpen && (
        <div className={popupStyles.popupBackground} onClick={handleCloseReviewForm}>
            <div
            className={`${globalContainerStyles.roundContainer} ${popupStyles.popupContent}`}
            onClick={(e) => e.stopPropagation()}
            >
            <ReviewForm 
                source="topbar" 
                onClose={handleCloseReviewForm}
                diningHalls={diningHalls}
            />
            </div>
        </div>
        )}
    </>
    );
}

export default Topbar;
