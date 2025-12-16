import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import { fetchReviews, setReviews } from '@redux/review-slice/reviewSlice';
import { selectReviews } from '@redux/review-slice/reviewSliceSelectors';
import { loadCache, saveCache } from '@utils/cache';
import type { Review } from '@redux/review-slice/reviewSlice';

const CACHE_KEY = 'reviews';

export function useReviewsBootstrap() {
    const dispatch = useAppDispatch();
    const reviewsByHall = useAppSelector(selectReviews);

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
            saveCache(CACHE_KEY, reviewsByHall);
        }
    }, [reviewsByHall, totalReviews]);
}