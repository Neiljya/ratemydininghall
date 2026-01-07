import { useState } from 'react';
import { selectDiningHalls } from '@redux/dining-hall-slice/diningHallSelectors';
import { useSelector } from 'react-redux';
import styles from './topbar.module.css';
import globalContainerStyles from '@containerStyles/globalContainer.module.css';
import popupStyles from '@globalStyles/popup-styles/popupStyles.module.css';
import ReviewForm from '@components/reviews/review-form/ReviewForm';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import { logout } from '@redux/auth-slice/authSlice';
import { selectIsAuthed, selectIsAdmin, selectAuthLoading } from '@redux/auth-slice/authSelectors';
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
            <svg 
                width="20" 
                height="20" 
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
            
            {/* Logo */}
            <img
                src={logoucsd}
                alt='RateMyDiningHall-UCSD'
                className={styles.logo}
                onClick={() => navigate('/')}
            />

            <div className={styles.left}>
                <div className={styles.controls}>
                    <button 
                        className={styles.btn}
                        onClick={() => navigate('/')}
                    >
                        All Halls
                    </button>
                    
                    <button 
                        className={styles.btn}
                        onClick={handleClearCache}
                        title="Refresh data"
                    >
                        Refresh
                    </button>

                    {isAdmin && (
                        <button className={styles.btn} onClick={() => navigate('/admin')}>
                            Admin
                        </button>
                    )}

                    <button
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={handleOpenReviewForm}
                    >
                        + Add Review
                    </button>
                </div>
            </div>

            <div className={styles.right}>
                <button
                    className={`${styles.btn} ${styles.btnGhost}`}
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