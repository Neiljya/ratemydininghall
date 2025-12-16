import { useSelector } from 'react-redux';
import { selectReviewsByDiningHallSlug } from '@redux/review-slice/reviewSliceSelectors';
import ReviewForm from '../../review-form/ReviewForm';
import ReviewItem from '../../review-item/ReviewItem';
import Stars from '@stars/Stars';
import globalContainerStyles from '@containerStyles/globalContainer.module.css';
import globalPopupStyles from '@globalStyles/popup-styles/popupStyles.module.css';
import { useState, useEffect } from 'react';
import styles from './review-modal.module.css';
import { selectAvgRatingByHallSlug, selectRatingsByHall } from '@redux/ratings-slice/ratingsSelectors';
import { useAppSelector } from '@redux/hooks';

interface ReviewModalProps {
  diningHallSlug: string;
  isOpen: boolean;
  onClose: () => void;
  headerText?: string;
  description?: string;
}

const placeholderUrl: string = "https://images.squarespace-cdn.com/content/v1/57e94430d2b8579f31ebcc38/1528371545872-6211WXGHXMLN7CMLV44J/UCSD+The+Bistro+interior";

function ReviewModal({ diningHallSlug, isOpen, onClose, headerText, description }: ReviewModalProps) {
  const reviews = useSelector(selectReviewsByDiningHallSlug(diningHallSlug));
  const byHall = useAppSelector(selectRatingsByHall);
  const agg = byHall[diningHallSlug];

  const avg = agg?.avg ?? 0;
  const count = agg?.count ?? 0;
  
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
      if (isOpen) {
        setIsClosing(false);
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
  }, [isOpen]);
  
  const handleClose = () => {
    if (isClosing) return;

    setIsClosing(true);

    setTimeout(() => {
      onClose();
    }, 200);
  };

  if (!isOpen) return null;

  return ( 
    <div className={`
      ${styles.modal}
      ${globalPopupStyles.popupBackground}
      ${isClosing ? globalPopupStyles.closing : ''}
      `} 
    
      onClick={handleClose}>
      <div
        className={`${globalContainerStyles.roundContainer} ${styles.modalContent}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeButton} onClick={handleClose}>✕</button>

        {/* Header Section */}
        <div className={styles.header}>
          <img src={placeholderUrl} alt="Dining Hall" className={styles.headerImage} />
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>{headerText || "Harvest Kitchen"}</h1>
            <div className={styles.rating}>
              <div className={styles.stars}>
                {/* TODO: replace with an avg rating count */}
                <Stars starCount={avg} />
                <span className={styles.ratingBadge}>{avg}</span>
              </div>
            </div>
            <p className={styles.description}>{description || "Build-your-own bowls, fresh ingredients."}</p>
          </div>
        </div>

        {/* Reviews Section */}
        <div className={styles.reviewsSection}>
          <h2 className={styles.sectionTitle}>Reviews ({count})</h2> 
          


          {/* List of Reviews from the state */}
          <div className={styles.reviewsListContainer}>
            {!!reviews && reviews.map(review => (
              <ReviewItem
                key={review?.id}
                rating={review?.rating}
                author={review?.author}
                description={review?.description}
                date={Number(review?.createdAt)}
              />
            ))}
            {(!reviews || reviews.length === 0) && (
              <p style={{ color: 'var(--color-text)', opacity: 0.7, fontStyle: 'italic'}}>
                No reviews yet. Be the first to add one!
              </p>
            )}

          </div>


          {/* Add Review Form */}
          <ReviewForm diningHallSlug={diningHallSlug}/>
        </div>
      </div>
    </div>
  );
}

export default ReviewModal;