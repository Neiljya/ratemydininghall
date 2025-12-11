import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import { fetchReviewsByHall, type Review } from '@redux/review-slice/reviewSlice';
import { selectReviewsByDiningHallSlug } from '@redux/review-slice/reviewSliceSelectors';

export function useReviewsForDiningHallBootstrap(diningHallSlug: string) {
    const dispatch = useAppDispatch();

    const reviews = useAppSelector(
        diningHallSlug 
            ? selectReviewsByDiningHallSlug(diningHallSlug) 
            : () => []
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!diningHallSlug) return;

        if (reviews.length === 0) {
            setLoading(true);
            dispatch(fetchReviewsByHall(diningHallSlug))
                .unwrap()
                .catch((err) => setError(err.message ?? 'Failed to load reviews'))
                .finally(() => setLoading(false));
        }
    }, [dispatch, diningHallSlug, reviews.length]);

    return { reviews, loading, error };
}
