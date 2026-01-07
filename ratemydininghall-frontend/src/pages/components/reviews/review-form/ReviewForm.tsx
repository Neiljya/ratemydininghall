import { useState, useRef } from 'react';
import type { DiningHall } from '@redux/dining-hall-slice/diningHallSlice';
import styles from '../../../styles/review-form.module.css'
import containerStyles from '@containerStyles/globalContainer.module.css';
import ImageContainer from '@components/image-components/ImageContainer';
import BoldHeader from '@components/text-components/custom-headers/BoldHeader';
import StarSelector from '@components/stars/StarSelector';
import { submitPendingReview } from '@graphQL/mutations/submitPendingReview';
import Notification, { type NotificationVariant } from '@components/notifications/Notification';
import { useNavigate } from 'react-router-dom';
import CaptchaProtection, { type CaptchaRef } from '@components/captchas/CaptchaProtection';

export type ReviewFormSource = 'topbar' | 'modal' | 'inline';

const MAX_CHARS = 500;

interface ReviewFormProps {
    diningHallSlug?: string;
    diningHalls?: DiningHall[];
    source?: ReviewFormSource;
    onClose?: () => void;
    showClose?: boolean;
    menuItemId?: string | null;
}

// // Placeholder dining halls data for test
// const DINING_HALLS = [
//     { id: '1', name: 'Bistro', image: 'https://images.squarespace-cdn.com/content/v1/57e94430d2b8579f31ebcc38/1528371545872-6211WXGHXMLN7CMLV44J/UCSD+The+Bistro+interior' },
//     { id: '2', name: 'Harvest Kitchen', image: 'https://images.squarespace-cdn.com/content/v1/57e94430d2b8579f31ebcc38/1528371545872-6211WXGHXMLN7CMLV44J/UCSD+The+Bistro+interior' },
//     { id: '3', name: 'Ocean View Terrace', image: 'https://images.squarespace-cdn.com/content/v1/57e94430d2b8579f31ebcc38/1528371545872-6211WXGHXMLN7CMLV44J/UCSD+The+Bistro+interior' },
//     { id: '4', name: 'Canyon Vista', image: 'https://images.squarespace-cdn.com/content/v1/57e94430d2b8579f31ebcc38/1528371545872-6211WXGHXMLN7CMLV44J/UCSD+The+Bistro+interior' },
// ];

function ReviewForm({
    diningHallSlug = '',
    diningHalls = [],
    source,
    onClose,
    showClose = false,
    menuItemId = null
}: ReviewFormProps) {
    const [rating, setRating] = useState<number>(0);

    // eventually, once accounts are implemented, we can get the user's name from state
    const [reviewerName, setReviewerName] = useState<string>('');
    const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
    const [selectedHall, setSelectedHall] = useState<string>(diningHallSlug);
    const [description, setDescription] = useState<string>('');
    const shouldShowCloseBtn = Boolean(onClose) || showClose;

    // captchas
    const [captchaToken, setCaptchaToken] = useState<string | null>('');
    const captchaRef = useRef<CaptchaRef>(null)

    // vars for handling submission state
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [notif, setNotif] = useState<{ show: boolean; message: string; variant: NotificationVariant }>({
        show: false,
        message: '',
        variant: 'info',
    });

    const navigate = useNavigate();
    const showNotif = (variant: NotificationVariant, message: string) => {
        setNotif({ show: true, variant, message });
    };

    const canViewMenu =
    source === 'modal'
        ? Boolean(diningHallSlug)
        : source === 'topbar'
        ? Boolean(selectedHall)
        : Boolean(diningHallSlug);

    const viewMenuSlug =
    source === 'topbar' ? selectedHall : diningHallSlug;

    const handleViewMenu = () => {
    if (!viewMenuSlug) return;
    onClose?.(); // close modal if provided
    navigate(`/dining-hall/${viewMenuSlug}`);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        // prevent refreshing the page
        e.preventDefault();
        setSubmitting(true);

        // captcha needs to be filled before submitting
        if (!captchaToken) {
            showNotif('error', 'Please verify that you are a human');
            setSubmitting(false);
            return;
        }

        const hallSlugToUse = source === 'topbar' ? selectedHall : diningHallSlug;

        if (!hallSlugToUse) {
            showNotif('error', 'Please select a dining hall to review.');
            setSubmitting(false);
            return;
        }

        if (rating < 1 || rating > 5) {
            showNotif('error', 'Please provide a rating between 1 and 5 stars.');
            setSubmitting(false);
            return;
        }

        if (!description.trim()) {
            showNotif('error', 'Please provide a description for your review.');
            setSubmitting(false);
            return;
        }

        const authorToUse = isAnonymous ? 'Anonymous' : (reviewerName.trim() || 'Anonymous');
        try {
            // //disabling in prod for now
            // if (!import.meta.env.PROD) {
            //     await submitPendingReview({
            //         diningHallSlug: hallSlugToUse,
            //         author: authorToUse,
            //         description: description.trim(),
            //         rating,
            //         menuItemId: menuItemId ?? null,
            //         captchaToken
            //     });
            // }
            await submitPendingReview({
                diningHallSlug: hallSlugToUse,
                author: authorToUse,
                description: description.trim(),
                rating,
                menuItemId: menuItemId ?? null,
                captchaToken
            });

            showNotif('success', 'Review submitted for approval!');
            setDescription('')
            setRating(0);

            captchaRef.current?.reset();
        } catch (error: any) {
            console.error(error);
            showNotif('error', error.message ?? 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <Notification
                show={notif.show}
                variant={notif.variant}
                message={notif.message}
                durationMs={2600}
                onClose={() => setNotif((n) => ({ ...n, show: false }))}
            />
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
                                key={hall?.slug}
                                className={`${containerStyles.roundContainer} ${containerStyles.containerEffect} ${
                                    selectedHall === hall?.slug ? containerStyles.selectedCard : ''
                                }`}
                                onClick={() => setSelectedHall(hall.slug)}
                            >
                            <ImageContainer 
                                imageUrl={hall?.imageUrl} 
                                alt={hall.name} 
                                height={'80%'}
                            />
                                <p className={containerStyles.cardText}>{hall.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <form className={styles.addReviewSection} onSubmit={handleSubmit}>

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
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                        <label className={styles.label} style={{ marginBottom: 0 }}>Review</label>
                        <span style={{ fontSize: '12px', color: description.length >= MAX_CHARS ? 'red' : '#666' }}>
                            {description.length} / {MAX_CHARS}
                        </span>
                    </div>
                    <textarea
                        className={styles.reviewTextarea}
                        placeholder="Short note about your experience"
                        rows={4}
                        value={description}
                        maxLength={MAX_CHARS}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

            <CaptchaProtection
                actions={captchaRef}
                onVerify={setCaptchaToken}
            />

            <div className={styles.buttonRow}>
                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={submitting}
                >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                </button>

                {canViewMenu && (
                    <button
                    type="button"
                    className={styles.viewMenuButton}
                    onClick={handleViewMenu}
                    disabled={submitting}
                    >
                    View Menu
                    </button>
                )}
            </div>
            </form>
        </div>
    )
}

export default ReviewForm;