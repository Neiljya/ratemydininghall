import styles from './stars.module.css';

interface StarsProps {
    starCount?: number;
    size?: number;
}

function Stars({ starCount = 0, size = 18 }: StarsProps) {
    return (
        <div 
            className={styles.reviewStars}
        >
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