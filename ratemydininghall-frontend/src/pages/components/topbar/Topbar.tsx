import { useState } from 'react';
import { selectDiningHalls } from '@redux/dining-hall-slice/diningHallSelectors';
import { useSelector } from 'react-redux';
import styles from './topbar.module.css';
import globalContainerStyles from '@containerStyles/globalContainer.module.css';
import popupStyles from '@globalStyles/popup-styles/popupStyles.module.css';
import ReviewForm from '@components/reviews/review-form/ReviewForm';
import { useNavigate } from 'react-router-dom';

function Topbar({ header }: { header?: string }) {
    // Fetch dining halls from redux store, we only need to fetch it once here and pass it down
    const diningHalls = useSelector(selectDiningHalls);
    const navigate = useNavigate();
    const [isReviewFormOpen, setReviewFormOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const handleOpenReviewForm = () => {
        setReviewFormOpen(true);
        setIsClosing(false);
        document.body.style.overflow = 'hidden';
    }

    const handleCloseReviewForm = () => {
        setIsClosing(true);
        document.body.style.overflow = 'unset';

        setTimeout(() => {
            setReviewFormOpen(false);
            setIsClosing(false);
        }, 200);
    }

    return (
    <>
        <header className={styles.appHeader}>
        <div className={styles.container}>
            <div className={styles.left}>
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

                <button 
                    className={styles.btn}
                    onClick={() => navigate('/')}
                
                >
                    Back to All Halls
                </button>
            </div>
        </div>
        <div className={styles.right}>
            <button
                className={`${styles.btn} ${styles.btnGhost}`}
                onClick={() => navigate('/login')}
            >
                Login
            </button>
        </div>
        </div>
        </header>

        {isReviewFormOpen && (
        <div 
            className={`${popupStyles.popupBackground} ${isClosing ? popupStyles.closing : ''}`}
            onClick={handleCloseReviewForm}
        >
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
