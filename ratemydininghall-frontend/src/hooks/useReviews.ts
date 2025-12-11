import { useMemo } from 'react';
import { useAppSelector } from '@redux/hooks';
import { selectReviews } from '@redux/review-slice/reviewSliceSelectors';
import type { Review } from '@redux/review-slice/reviewSlice';

export function useReviews() {
    const reviewsByHall = useAppSelector(selectReviews);

    const allReviews: Review[] = useMemo(
        () => Object.values(reviewsByHall).flat(),
        [reviewsByHall]
    );

    return { reviewsByHall, allReviews };
}