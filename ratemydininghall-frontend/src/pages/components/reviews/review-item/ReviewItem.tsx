import Stars from '@stars/Stars';
import styles from './review-item.module.css';
import { formatReviewDate } from '@utils/dateUtils';

interface ReviewItemProps {
    rating?: number;
    author?: string;
    date?: number;
    description?: string;
}

function ReviewItem({ rating = 0, author, date, description }: ReviewItemProps) {
    const formattedDate = date ? formatReviewDate(date) : '';

    return (
        <div className={styles.review}>
            <Stars starCount={rating} />
            <div className={styles.reviewMeta}>
                {author && <span className={styles.reviewAuthorText}>{author}</span>}
                <span className={styles.reviewDate}>{formattedDate}</span>
            </div>
            <p className={styles.reviewText}>{description}</p>
        </div>

    )
}

export default ReviewItem;