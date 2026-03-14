import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import { fetchReviews, setReviews } from '@redux/review-slice/reviewSlice';
import { selectReviews } from '@redux/review-slice/reviewSliceSelectors';
import { loadCache, saveCache } from '@utils/cache';
import type { Review } from '@redux/review-slice/reviewSlice';
import { useUser } from '@clerk/react-router'; 

const CACHE_KEY = 'reviews';

export function useReviewsBootstrap() {
    const dispatch = useAppDispatch();
    const reviewsByHall = useAppSelector(selectReviews);
    const { user } = useUser(); 

    const totalReviews = useMemo(
        () => Object.values(reviewsByHall).reduce((sum, list) => sum + (list?.length ?? 0), 0),
        [reviewsByHall]
    );
    useEffect(() => {
        if (totalReviews === 0) {
            const cached = loadCache<Record<string, Review[]>>(CACHE_KEY);

            if (cached) {
                dispatch(setReviews(cached));
            } else {
                dispatch(fetchReviews());
            }
        }
    }, [dispatch, totalReviews]);

    useEffect(() => {
        if (totalReviews > 0) {
            const sanitizedReviewsByHall: Record<string, Review[]> = {};
            
            for (const [hall, reviews] of Object.entries(reviewsByHall)) {
                sanitizedReviewsByHall[hall] = reviews.map(review => {
                    const isOwner = Boolean(user?.id && review.userId === user.id);
                    
                    return {
                        ...review,
                        // If they own it, keep the ID so the Delete button works
                        // If they don't, set it to undefined so JSON.stringify completely removes it from localStorage.
                        userId: isOwner ? review.userId : undefined, 
                    };
                });
            }

            saveCache(CACHE_KEY, sanitizedReviewsByHall);
        }
    }, [reviewsByHall, totalReviews, user?.id]); 
}