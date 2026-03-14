import { useState, useRef, useEffect } from 'react';
import Stars from '@stars/Stars';
import styles from './review-item.module.css';
import { formatReviewDate } from '@utils/dateUtils';
import { useUser } from '@clerk/react-router';

interface ReviewItemProps {
    reviewId: string;
    userId?: string | null;
    rating?: number;
    author?: string;
    date?: number;
    description?: string;
    imageUrls?: string[];
    onDelete?: (reviewId: string) => void | Promise<void>;
}

function ReviewItem({
    reviewId,
    userId,
    rating = 0,
    author,
    date,
    description,
    imageUrls = [],
    onDelete,
}: ReviewItemProps) {
    const { user } = useUser();
    
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    
    const menuRef = useRef<HTMLDivElement>(null);
    const formattedDate = date ? formatReviewDate(date) : '';
    const isOwner = Boolean(user?.id && userId && user.id === userId);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
                setIsConfirming(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleConfirmDelete = async () => {
        if (!onDelete) return;
        setIsMenuOpen(false); 
        setIsExiting(true);   
        
        setTimeout(async () => {
            try {
                await onDelete(reviewId);
            } catch (error) {
                setIsExiting(false);
            }
        }, 400); 
    };

    return (
        <div className={`${styles.container} ${isExiting ? styles.exiting : ''}`}>
            <div className={styles.header}>
                <div className={styles.metaInfo}>
                    <span className={styles.author}>{author || 'Anonymous'}</span>
                    <span className={styles.date}>{formattedDate}</span>
                </div>

                <div className={styles.headerRight}>
                    {isOwner && onDelete && (
                        <div className={styles.menuContainer} ref={menuRef}>
                            <button
                                type="button"
                                className={styles.dotsButton}
                                onClick={() => {
                                    setIsMenuOpen(!isMenuOpen);
                                    setIsConfirming(false); 
                                }}
                                aria-label="Review options"
                            >
                                {/* Horizontal 3 Dots */}
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="5" cy="12" r="1.5"></circle>
                                    <circle cx="12" cy="12" r="1.5"></circle>
                                    <circle cx="19" cy="12" r="1.5"></circle>
                                </svg>
                            </button>

                            {isMenuOpen && (
                                <div className={styles.dropdownMenu}>
                                    {!isConfirming ? (
                                        <button 
                                            className={styles.dropdownItem}
                                            onClick={() => setIsConfirming(true)}
                                        >
                                            Delete Review
                                        </button>
                                    ) : (
                                        <div className={styles.confirmState}>
                                            <span className={styles.confirmText}>Are you sure?</span>
                                            <div className={styles.confirmActions}>
                                                <button 
                                                    className={styles.cancelBtn} 
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    Cancel
                                                </button>
                                                <button 
                                                    className={styles.yesBtn} 
                                                    onClick={handleConfirmDelete}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    <Stars starCount={rating} size={16} />
                </div>
            </div>

            <p className={styles.description}>{description}</p>

            {/* ... image grid remains the same ... */}
            {imageUrls.length > 0 && (
                <div className={styles.imageGrid}>
                    {imageUrls.map((url, index) => (
                        <img key={`${url}-${index}`} src={url} alt={`Review ${index + 1}`} className={styles.reviewImage} loading="lazy" />
                    ))}
                </div>
            )}
        </div>
    );
}

export default ReviewItem;