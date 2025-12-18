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
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.metaInfo}>
                    <span className={styles.author}>{author || 'Anonymous'}</span>
                    <span className={styles.date}>{formattedDate}</span>
                </div>
                <Stars starCount={rating} size={16} />
            </div>
            <p className={styles.description}>{description}</p>
        </div>
    );
}

export default ReviewItem;