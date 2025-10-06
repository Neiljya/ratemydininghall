import { useState } from 'react';
import type { DiningHall } from '@redux/dining-hall-slice/diningHallSlice';
import styles from '../../../styles/review-form.module.css'
import containerStyles from '@containerStyles/globalContainer.module.css';
import ImageContainer from '@components/image-components/ImageContainer';
import BoldHeader from '@components/text-components/custom-headers/BoldHeader';
import StarSelector from '@components/stars/StarSelector';

export type ReviewFormSource = 'topbar' | 'modal' | 'inline';

interface ReviewFormProps {
    diningHallId?: string;
    diningHalls?: DiningHall[];
    source?: ReviewFormSource;
    onClose?: () => void;
    showClose?: boolean;
}

// // Placeholder dining halls data for test
// const DINING_HALLS = [
//     { id: '1', name: 'Bistro', image: 'https://images.squarespace-cdn.com/content/v1/57e94430d2b8579f31ebcc38/1528371545872-6211WXGHXMLN7CMLV44J/UCSD+The+Bistro+interior' },
//     { id: '2', name: 'Harvest Kitchen', image: 'https://images.squarespace-cdn.com/content/v1/57e94430d2b8579f31ebcc38/1528371545872-6211WXGHXMLN7CMLV44J/UCSD+The+Bistro+interior' },
//     { id: '3', name: 'Ocean View Terrace', image: 'https://images.squarespace-cdn.com/content/v1/57e94430d2b8579f31ebcc38/1528371545872-6211WXGHXMLN7CMLV44J/UCSD+The+Bistro+interior' },
//     { id: '4', name: 'Canyon Vista', image: 'https://images.squarespace-cdn.com/content/v1/57e94430d2b8579f31ebcc38/1528371545872-6211WXGHXMLN7CMLV44J/UCSD+The+Bistro+interior' },
// ];

function ReviewForm({
    diningHallId = '',
    diningHalls = [],
    source,
    onClose,
    showClose = false,
}: ReviewFormProps) {
    const [rating, setRating] = useState<number>(0);

    // eventually, once accounts are implemented, we can get the user's name from state
    const [reviewerName, setReviewerName] = useState<string>('');
    const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

    const [selectedHall, setSelectedHall] = useState<string>(diningHallId);
    const shouldShowCloseBtn = Boolean(onClose) || showClose;

    return (
        <div>
            {shouldShowCloseBtn && (
                <button
                    type="button"
                    className={styles.closeButton}
                    aria-label="Close"
                    onClick={onClose}
                > 
                    X 
                </button>
            )}

            {source === 'topbar' && (
                <div className={containerStyles.scrollableContainer}>
                    <BoldHeader text="Choose A Dining Hall To Review" />
                    <div className={containerStyles.scrollableContent}>
                        {diningHalls.map((hall) => (
                            <div
                                key={hall?.id}
                                className={`${containerStyles.roundContainer} ${containerStyles.containerEffect} ${
                                    selectedHall === hall?.id ? containerStyles.selectedCard : ''
                                }`}
                                onClick={() => setSelectedHall(hall.id)}
                            >
                            <ImageContainer imageUrl={hall?.imageUrl} alt={hall.name} />
                                <p className={containerStyles.cardText}>{hall.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <form className={styles.addReviewSection}>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Rating</label>
                    <StarSelector value={rating} onChange={setRating} />
                </div>
                
                {/* Reviewer Name Input (optional) */}
                <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="reviewerName">Name (optional)</label>
                    <input
                        id="reviewerName"
                        type="text"
                        className={styles.reviewerNameInput}
                        placeholder={!isAnonymous ? "Your display name" : "Anonymous User"}
                        value={isAnonymous ? '' : reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        disabled={isAnonymous}
                    />
                </div>

                {/* Anonymous checkbox */}
                <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="anonymousToggle" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                    id="anonymousToggle"
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => {
                        const checked = e.target.checked;
                        setIsAnonymous(checked);
                        if (checked) setReviewerName('');
                    }}
                    style={{ marginRight: 8 }}
                    />
                    Post as Anonymous
                </label>
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
            </form>
        </div>
    )
}

export default ReviewForm;