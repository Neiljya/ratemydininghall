import { useState } from 'react';
import { selectDiningHalls } from '@redux/dining-hall-slice/diningHallSelectors';
import { useSelector } from 'react-redux';
import styles from './topbar.module.css';
import globalContainerStyles from '@containerStyles/globalContainer.module.css';
import popupStyles from '@globalStyles/popup-styles/popupStyles.module.css';
import ReviewForm from '@components/reviews/review-form/ReviewForm';
import buttonStyles from '@containerStyles/buttons.module.css';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import { logout } from '@redux/auth-slice/authSlice';
import { selectIsAuthed, selectIsAdmin, selectAuthLoading } from '@redux/auth-slice/authSelectors';
import CustomSelect from '@components/ui/custom-select/CustomSelect';
import logoucsd from '../../../assets/logoucsd.png';
import { clearCache } from '@utils/cache';

function Topbar() {
    // Fetch dining halls from redux store, we only need to fetch it once here and pass it down
    const diningHalls = useSelector(selectDiningHalls);
    const navigate = useNavigate();
    const [isReviewFormOpen, setReviewFormOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [isMobileHidden, setIsMobileHidden] = useState(false);

    const dispatch = useAppDispatch();
    const isAuthed = useAppSelector(selectIsAuthed);
    const isAdmin = useAppSelector(selectIsAdmin);
    const authLoading = useAppSelector(selectAuthLoading);

    // sort state
    const [sortValue, setSortValue] = useState('rating-desc');

    const handleClearCache = () => {
        clearCache();
        window.location.reload();
    }

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

    const handleAuthButton = async () => {
        if (!isAuthed) {
            navigate('/login');
            return;
        }

        try {
            await dispatch(logout()).unwrap();
        } finally {
            navigate('/');
        }
    };

    return (
    <>
    <header className={`${styles.appHeader} ${isMobileHidden ? styles.hidden : ''}`}>
        <button 
            className={styles.mobileToggle}
            onClick={() => setIsMobileHidden(!isMobileHidden)}
            aria-label={isMobileHidden ? "Show Menu" : "Hide Menu"}
        >
            {/* Chevron Icon */}
            <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            >
                <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
        </button>
        <div className={styles.container}>
            <div className={styles.left}>
                <div className={styles.controls}>
                <CustomSelect
                    options={[
                       { value: 'rating-desc', label: 'Highest rated' },
                       { value: 'rating-asc', label: 'Lowest rated' },
                    ]}
                    value={sortValue}
                    onChange={setSortValue}
                />


                <button 
                    className={`${styles.btn} ${buttonStyles['btn-fill-anim']}`}
                    onClick={() => navigate('/')}
                
                >
                    Back to All Halls
                </button>


                <button
                    className={`${styles.btn} ${styles.btnPrimary} ${buttonStyles['btn-dark-fill-anim']}`}
                    onClick={handleOpenReviewForm}
                >
                    Add Review
                </button>

                {/* admin only button */}
                {isAdmin && (
                    <button className={`${styles.btn} ${buttonStyles['btn-fill-anim']}`} onClick={() => navigate('/admin')}>
                        Admin Panel
                    </button>
                )}
            </div>
        </div>
        <img
            src={logoucsd}
            alt='RateMyDiningHall-UCSD'
            className={styles.logo}
            onClick={() => navigate('/')}
        />
        <div className={styles.right}>
            <button 
                    className={`${styles.btn} ${buttonStyles['btn-fill-anim']}`}
                    onClick={handleClearCache}
                    title="Refresh data"
                >
                    Clear Cache
            </button>
            <button
                className={`${styles.btn} ${styles.btnGhost} ${buttonStyles['btn-fill-anim']}`}
                onClick={handleAuthButton}
                disabled={authLoading}
            >
                {isAuthed ? (authLoading ? '...' : 'Logout') : 'Login'}
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
