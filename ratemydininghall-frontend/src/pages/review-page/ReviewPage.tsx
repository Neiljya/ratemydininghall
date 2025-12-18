import { useState } from 'react'; 
import ReviewCard from '@components/reviews/review-card/ReviewCard';
import ReviewModal from '@components/reviews/review-card/review-modal/ReviewModal'; 
import { useDiningHalls } from '@hooks/useDiningHalls';
import styles from './review-page.module.css';
import type { DiningHall } from '@redux/dining-hall-slice/diningHallSlice'; 
import { useAppSelector } from '@redux/hooks';
import { selectRatingsByHall } from '@redux/ratings-slice/ratingsSelectors';

function ReviewPage() {
    const { halls, loading, error } = useDiningHalls();
    
    // State to track which dining hall is currently selected
    const [selectedHall, setSelectedHall] = useState<DiningHall | null>(null);
    const byHall = useAppSelector(selectRatingsByHall)

    if (loading && halls.length === 0) return <div>Loading...</div>;
    if (error && halls.length === 0) return <div>Error: {error}</div>;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.scrollContainer}>
                <div className={styles.reviewsGrid}>
                    {halls.map((hall, index) => {
                        const agg = byHall[hall.slug];
                        const avg = agg?.avg ?? 0;
                    
                        return (
                            <div 
                                key={hall?.id}
                                className={styles.cardWrapper}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <ReviewCard
                                    headerText={hall?.name}
                                    description={hall?.description}
                                    imageUrl={hall?.imageUrl}
                                    rating={avg}
                                    onClick={() => setSelectedHall(hall)} 
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            <ReviewModal
                diningHallSlug={selectedHall?.slug || ''}
                isOpen={!!selectedHall} 
                onClose={() => setSelectedHall(null)} 
                headerText={selectedHall?.name}
                description={selectedHall?.description}
            />
        </div>
    )
}

export default ReviewPage;