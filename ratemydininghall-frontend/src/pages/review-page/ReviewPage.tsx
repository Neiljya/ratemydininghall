import { useState, useMemo } from 'react'; 
import ReviewCard from '@components/reviews/review-card/ReviewCard';
import ReviewModal from '@components/reviews/review-card/review-modal/ReviewModal'; 
import { useDiningHalls } from '@hooks/useDiningHalls';
import styles from './review-page.module.css';
import type { DiningHall } from '@redux/dining-hall-slice/diningHallSlice'; 
import { useAppSelector } from '@redux/hooks';
import { selectRatingsByHall } from '@redux/ratings-slice/ratingsSelectors';
import CustomSelect from '@components/ui/custom-select/CustomSelect';
import { PARENT_HALL_MAPPING } from 'src/constants/parentHallMapping';

function ReviewPage() {
    const { halls, loading, error } = useDiningHalls();
    const [selectedHall, setSelectedHall] = useState<DiningHall | null>(null);
    const byHall = useAppSelector(selectRatingsByHall);
    const [sortValue, setSortValue] = useState('rating-desc');
    const [selectedParent, setSelectedParent] = useState<string>('all');

    const availableParents = useMemo(() => {
        if (!halls) return [];
        const parents = new Set<string>();
        halls.forEach(hall => {
            if (hall.parentHallSlug) {
                parents.add(hall.parentHallSlug);
            }
        });
        return Array.from(parents);
    }, [halls]);

    const sortedHalls = useMemo(() => {
        if (!halls) return [];

        let filtered = halls;
        if (selectedParent !== 'all') {
            filtered = halls.filter(hall => hall.parentHallSlug === selectedParent);
        }

        return [...filtered].sort((a, b) => {
            const avgA = byHall[a.slug]?.avg ?? 0;
            const avgB = byHall[b.slug]?.avg ?? 0;

            if (sortValue === 'rating-desc') {
                return avgB - avgA;
            } else {
                return avgA - avgB;
            }
        });
    }, [halls, byHall, sortValue, selectedParent]);

    if (loading && halls.length === 0) return <div>Loading...</div>;
    if (error && halls.length === 0) return <div>Error: {error}</div>;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.scrollContainer}>
                <div style={{ padding: '0 20px 20px 20px', maxWidth: '800px' }}>

                <div className={styles.filterRow}>
                        <button
                            className={`${styles.filterPill} ${selectedParent === 'all' ? styles.activePill : ''}`}
                            onClick={() => setSelectedParent('all')}
                        >
                            All
                        </button>
                        {availableParents.map(slug => (
                            <button
                                key={slug}
                                className={`${styles.filterPill} ${selectedParent === slug ? styles.activePill : ''}`}
                                onClick={() => setSelectedParent(slug)}
                            >
                                {PARENT_HALL_MAPPING[slug] || slug} 
                            </button>
                        ))}
                    </div>

                    <div style={{ maxWidth: '300px', marginTop: '16px' }}>
                        <CustomSelect
                            options={[
                                { value: 'rating-desc', label: 'Highest Rated' },
                                { value: 'rating-asc', label: 'Lowest Rated' },
                            ]}
                            value={sortValue}
                            onChange={setSortValue}
                        />
                    </div>
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
                imageUrl={selectedHall?.imageUrl || ''}
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