import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import { fetchReviews } from '@redux/review-slice/reviewSlice';
import { selectReviews } from '@redux/review-slice/reviewSliceSelectors';

export function useReviewsBootstrap() {
    const dispatch = useAppDispatch();
    const reviewsByHall = useAppSelector(selectReviews);

    const totalReviews = useMemo(
        () => Object.values(reviewsByHall).reduce((sum, list) => sum + (list?.length ?? 0), 0),
        [reviewsByHall]
    );

    useEffect(() => {
        if (totalReviews === 0) {
            dispatch(fetchReviews());
        }
    }, [dispatch, totalReviews]);
}