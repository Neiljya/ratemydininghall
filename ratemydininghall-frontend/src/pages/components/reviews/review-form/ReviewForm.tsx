import { useState, useRef, useEffect } from 'react';
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
import { useUser, useAuth } from '@clerk/react-router';
import { createReviewUploadUrl } from '@graphQL/mutations/createReviewUploadUrl';

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

function ReviewForm({
    diningHallSlug = '',
    diningHalls = [],
    source,
    onClose,
    showClose = false,
    menuItemId = null
}: ReviewFormProps) {
    const { user, isLoaded, isSignedIn } = useUser();
    const { getToken } = useAuth();
    const navigate = useNavigate();

    const [rating, setRating] = useState<number>(0);
    const [reviewerName, setReviewerName] = useState<string>('');
    const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
    const [selectedHall, setSelectedHall] = useState<string>(diningHallSlug);
    const [description, setDescription] = useState<string>('');
    const [reviewImages, setReviewImages] = useState<File[]>([]);
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

    // const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const files = Array.from(e.target.files || []);
    //     setReviewImages(files.slice(0, 2)); // optional max of 2
    // };

    

    const uploadReviewImages = async (
        files: File[],
        diningHallSlug: string
    ): Promise<string[]> => {
        if (!files.length) return [];

        const token = await getToken();
        const uploadedUrls: string[] = [];

        for (const file of files) {
            const uploadData = await createReviewUploadUrl(
                {
                    diningHallId: diningHallSlug,
                    filename: file.name,
                    contentType: file.type,
                },
                token
            ) as { uploadUrl: string; publicUrl?: string; key?: string } | null;

            if (!uploadData || !uploadData.uploadUrl) {
                throw new Error(`Invalid upload data for image: ${file.name}`);
            }

            const uploadRes = await fetch(uploadData.uploadUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': file.type,
                },
                body: file,
            });

            if (!uploadRes.ok) {
                throw new Error(`Failed to upload image: ${file.name}`);
            }

            const publicUrl = uploadData.publicUrl ?? uploadData.key;
            if (!publicUrl) {
                throw new Error(`No public URL returned for image: ${file.name}`);
            }

            uploadedUrls.push(publicUrl);
        }

        return uploadedUrls;
    };

    const showNotif = (variant: NotificationVariant, message: string) => {
        setNotif({ show: true, variant, message });
    };

    // Auto-fill strictly with the Clerk username
    useEffect(() => {
        if (isLoaded && isSignedIn && user?.username) {
            setReviewerName(`@${user.username}`);
        } else {
            setReviewerName('');
        }
    }, [isLoaded, isSignedIn, user]);

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
        onClose?.(); 
        navigate(`/dining-hall/${viewMenuSlug}`);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Security Guard
        if (!isSignedIn) {
            showNotif('error', 'You must be signed in to submit a review.');
            return;
        }

        if (!captchaToken) {
            showNotif('error', 'Please verify that you are a human');
            return;
        }

        const hallSlugToUse = source === 'topbar' ? selectedHall : diningHallSlug;

        if (!hallSlugToUse) {
            showNotif('error', 'Please select a dining hall to review.');
            return;
        }

        if (rating < 1 || rating > 5) {
            showNotif('error', 'Please provide a rating between 1 and 5 stars.');
            return;
        }

        if (!description.trim()) {
            showNotif('error', 'Please provide a description for your review.');
            return;
        }

        setSubmitting(true);
        const authorToUse = isAnonymous ? 'Anonymous' : (reviewerName || 'Anonymous');
        
        try {
            const token = await getToken();
            const uploadedImageUrls = await uploadReviewImages(reviewImages, hallSlugToUse);

            await submitPendingReview({
                diningHallSlug: hallSlugToUse,
                author: authorToUse,
                description: description.trim(),
                rating,
                menuItemId: menuItemId ?? null,
                captchaToken,
                imageUrls: uploadedImageUrls,
            }, token);

            showNotif('success', 'Review submitted for approval!');
            setDescription('')
            setRating(0);
            
            setIsAnonymous(false); 
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
                
                {/* Locked Reviewer Name Input */}
                <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="reviewerName">Name</label>
                    <input
                        id="reviewerName"
                        type="text"
                        className={styles.reviewerNameInput}
                        placeholder={
                            isAnonymous 
                                ? "Anonymous User" 
                                : (isSignedIn ? "Your Username" : "Sign in to use your name")
                        }
                        value={isAnonymous ? 'Anonymous' : reviewerName}
                        disabled={true} 
                    />
                </div>

                <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="anonymousToggle" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                    id="anonymousToggle"
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    disabled={!isSignedIn}
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
                        placeholder={isSignedIn ? "Short note about your experience" : "Please sign in to write a review"}
                        rows={4}
                        value={description}
                        maxLength={MAX_CHARS}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={!isSignedIn}
                    />
                </div>
            
            {isSignedIn && (
                <CaptchaProtection
                    actions={captchaRef}
                    onVerify={setCaptchaToken}
                />
            )}

            {/* <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="reviewImages">Photos</label>
                <input
                    id="reviewImages"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    disabled={!isSignedIn || submitting}
                />
                {reviewImages.length > 0 && (
                    <p className={styles.helperText}>
                        {reviewImages.length} image{reviewImages.length === 1 ? '' : 's'} selected
                    </p>
                )}
            </div> */}

            <div className={styles.buttonRow}>
                {isSignedIn ? (
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={submitting}
                    >
                        {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                ) : (
                    <button
                        type="button"
                        className={styles.submitButton}
                        style={{ background: 'var(--color-primary-dark, #005ea2)' }}
                        onClick={() => {
                            onClose?.();
                            navigate('/login');
                        }}
                    >
                        Sign in to Post
                    </button>
                )}

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