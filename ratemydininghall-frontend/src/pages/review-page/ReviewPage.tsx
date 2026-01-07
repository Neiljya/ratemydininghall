import { useState, useMemo } from 'react'; 
import ReviewCard from '@components/reviews/review-card/ReviewCard';
import ReviewModal from '@components/reviews/review-card/review-modal/ReviewModal'; 
import { useDiningHalls } from '@hooks/useDiningHalls';
import styles from './review-page.module.css';
import type { DiningHall } from '@redux/dining-hall-slice/diningHallSlice'; 
import { useAppSelector } from '@redux/hooks';
import { selectRatingsByHall } from '@redux/ratings-slice/ratingsSelectors';
import CustomSelect from '@components/ui/custom-select/CustomSelect'; 

function ReviewPage() {
    const { halls, loading, error } = useDiningHalls();
    const [selectedHall, setSelectedHall] = useState<DiningHall | null>(null);
    const byHall = useAppSelector(selectRatingsByHall);
    const [sortValue, setSortValue] = useState('rating-desc');

    const sortedHalls = useMemo(() => {
        if (!halls) return [];
        return [...halls].sort((a, b) => {
            const avgA = byHall[a.slug]?.avg ?? 0;
            const avgB = byHall[b.slug]?.avg ?? 0;

            if (sortValue === 'rating-desc') {
                return avgB - avgA; // Highest first
            } else {
                return avgA - avgB; // Lowest first
            }
        });
    }, [halls, byHall, sortValue]);

    if (loading && halls.length === 0) return <div>Loading...</div>;
    if (error && halls.length === 0) return <div>Error: {error}</div>;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.scrollContainer}>
                <div style={{ padding: '0 20px 20px 20px', maxWidth: '300px' }}>
                     <CustomSelect
                        options={[
                            { value: 'rating-desc', label: 'Highest Rated' },
                            { value: 'rating-asc', label: 'Lowest Rated' },
                        ]}
                        value={sortValue}
                        onChange={setSortValue}
                    />
                </div>

                <div className={styles.reviewsGrid}>
                    {sortedHalls.map((hall, index) => {
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