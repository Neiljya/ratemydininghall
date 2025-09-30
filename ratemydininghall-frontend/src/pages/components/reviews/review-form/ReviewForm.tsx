import styles from '../../../styles/review-form.module.css'

function ReviewForm() {
    return (
        <div className={styles.addReviewSection}>
            <div className={styles.formGroup}>
                <label className={styles.label}>Rating</label>
                <select className={styles.ratingSelect}>
                    <option>Choose...</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                </select>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Review</label>
                <textarea
                    className={styles.reviewTextarea}
                    placeholder="Short note about your experience"
                    rows={4}
                />
            </div>

            <button className={styles.submitButton}>Submit Review</button>
        </div>
    )
}

export default ReviewForm;