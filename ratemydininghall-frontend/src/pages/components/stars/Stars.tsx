import styles from './stars.module.css';

interface StarsProps {
    starCount?: number;
}

function Stars({ starCount }: StarsProps) {
    return (
        <div className={styles.reviewStars}>
            {Array.from({ length: 5 }, (_, i) => (
                <span
                    key={i}
                    className={styles.star}
                    style={{ color: i < starCount ? '#f5b400' : '#ccc' }}
                >
                    ★
                </span>
            ))}
        </div>
    )
}

export default Stars;