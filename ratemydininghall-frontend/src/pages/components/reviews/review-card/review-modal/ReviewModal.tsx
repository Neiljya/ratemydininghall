import { useSelector } from 'react-redux';
import { selectReviewsByDiningHallSlug } from '@redux/review-slice/reviewSliceSelectors';
import ReviewForm from '../../review-form/ReviewForm';
import ReviewItem from '../../review-item/ReviewItem';
import Stars from '@stars/Stars';
import globalContainerStyles from '@containerStyles/globalContainer.module.css';
import styles from './review-modal.module.css';

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
  if (!isOpen) return null;

  return ( 
    <div className={styles.modal} onClick={onClose}>
      <div
        className={`${globalContainerStyles.roundContainer} ${styles.modalContent}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeButton} onClick={onClose}>✕</button>

        {/* Header Section */}
        <div className={styles.header}>
          <img src={placeholderUrl} alt="Dining Hall" className={styles.headerImage} />
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>{headerText || "Harvest Kitchen"}</h1>
            <div className={styles.rating}>
              <div className={styles.stars}>
                {/* TODO: replace with an avg rating count */}
                <Stars starCount={4} />
                <span className={styles.ratingBadge}>4</span>
              </div>
            </div>
            <p className={styles.description}>{description || "Build-your-own bowls, fresh ingredients."}</p>
          </div>
        </div>

        {/* Reviews Section */}
        <div className={styles.reviewsSection}>
          <h2 className={styles.sectionTitle}>Reviews</h2>

          {/* List of Reviews from the state */}
          {!!reviews && reviews.map(review => (
            <ReviewItem
              key={review?.id}
              rating={review?.rating}
              author={review?.author}
              description={review?.description}
              date={Number(review?.createdAt)}
            />
          ))}

          {/* Add Review Form */}
          <ReviewForm diningHallSlug={diningHallSlug}/>
        </div>
      </div>
    </div>
  );
}

export default ReviewModal;