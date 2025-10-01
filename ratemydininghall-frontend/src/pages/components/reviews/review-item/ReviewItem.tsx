import Stars from '@stars/Stars';
import styles from './review-item.module.css';
import { formatReviewDate } from '@utils/dateUtils';

interface ReviewItemProps {
    rating?: number;
    date?: number;
    description?: string;
}

function ReviewItem({ rating = 0, date, description }: ReviewItemProps) {
    const formattedDate = date ? formatReviewDate(date) : '';

    return (
        <div className={styles.review}>
            <Stars starCount={rating} />
            <div className={styles.reviewMeta}>
                <span className={styles.reviewDate}>{formattedDate}</span>
            </div>
            <p className={styles.reviewText}>{description}</p>
        </div>

    )
}

export default ReviewItem;