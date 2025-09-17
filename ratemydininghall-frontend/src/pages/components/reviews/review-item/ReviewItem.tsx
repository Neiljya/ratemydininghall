import Stars from '@stars/Stars';
import styles from './review-item.module.css';

interface ReviewItemProps {
    starCount?: number;
    date?: string;
    time?: string;
    reviewText?: string;
}

function ReviewItem({ starCount = 0, date, time, reviewText }: ReviewItemProps) {
    // Either need to format date/time prior to passing in or in function

    return (
        <div className={styles.review}>
            <Stars starCount={4} />
            <div className={styles.reviewMeta}>
                <span className={styles.reviewDate}>9/6/2025, 4:47:11 PM</span>
            </div>
            <p className={styles.reviewText}>{reviewText}</p>
        </div>

    )
}

export default ReviewItem;