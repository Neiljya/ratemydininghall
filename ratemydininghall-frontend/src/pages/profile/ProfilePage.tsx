import { useUser, UserProfile, useAuth } from '@clerk/react-router';
import { useEffect, useState } from 'react';
import styles from './profile-page.module.css';
import containerStyles from '@containerStyles/globalContainer.module.css';
import { graphQLRequest } from '@graphQL/graphQLClient';
import { getMyReviewsQuery } from '@graphQL/queries/reviewQueries';
import type { Review } from '@redux/review-slice/reviewSlice';

export default function ProfilePage() {
    const { isLoaded, isSignedIn } = useUser();
    const { getToken } = useAuth();
    
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMyReviews = async () => {
            // Only fetch if the user is actually signed in
            if (!isSignedIn) return;

            setLoadingReviews(true);
            setError(null);

            try {
                // Get the secure Clerk token
                const token = await getToken();
                
                // Execute the query
                const data = await graphQLRequest<{ myReviews: Review[] }>(
                    getMyReviewsQuery,
                    {}, // This query doesn't need variables as the backend uses the token
                    token
                );
                
                setReviews(data.myReviews || []);
            } catch (err: any) {
                console.error("Failed to load reviews", err);
                setError(err.message || "Could not retrieve your review history.");
            } finally {
                setLoadingReviews(false);
            }
        };

        if (isLoaded && isSignedIn) {
            fetchMyReviews();
        }
    }, [isLoaded, isSignedIn, getToken]);

    // Show nothing while Clerk is still initializing
    if (!isLoaded) return null;

    // If not signed in, you might want to redirect or show a login prompt
    if (!isSignedIn) {
        return (
            <div className={styles.profilePage}>
                <div className={containerStyles.roundContainer}>
                    <p>Please sign in to view your profile.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.profilePage}>
            <div className={styles.layout}>
                {/* Left Side: Clerk Account Management */}
                <section className={styles.settingsSection}>
                    <UserProfile 
                        routing="hash" 
                        appearance={{
                            elements: {
                                rootBox: styles.clerkRoot,
                                card: styles.clerkCard,
                                navbar: styles.clerkNavbar,
                                scrollBox: styles.clerkScrollBox
                            }
                        }}
                    />
                </section>

                {/* Right Side: Personal Review History */}
                <section className={styles.reviewsSection}>
                    <div className={`${containerStyles.roundContainer} ${styles.reviewsContainer}`}>
                        <h2 className={styles.sectionTitle}>My Reviews</h2>
                        <hr className={styles.divider} />
                        
                        {error && <p className={styles.errorText}>{error}</p>}

                        {loadingReviews ? (
                            <p className={styles.muted}>Loading your history...</p>
                        ) : reviews.length > 0 ? (
                            <div className={styles.reviewList}>
                                {reviews.map((rev) => (
                                    <div key={rev.id} className={styles.reviewItem}>
                                        <div className={styles.reviewHeader}>
                                            <span className={styles.hallName}>
                                                {rev.diningHallSlug ? rev.diningHallSlug.replace(/-/g, ' ') : ''}
                                            </span>
                                            <span className={styles.stars}>{"★".repeat(rev.rating)}</span>
                                        </div>
                                        <p className={styles.reviewText}>{rev.description}</p>
                                        <div className={styles.reviewFooter}>
                                            <span className={styles.statusBadge}>
                                                {rev.status === 'pending' ? '⏳ Pending Approval' : '✅ Published'}
                                            </span>
                                            <span className={styles.date}>
                                                {new Date(rev.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className={styles.muted}>You haven't written any reviews yet.</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}