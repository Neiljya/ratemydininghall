import type { RootState } from '../store';
import type { Review, ReviewState } from './reviewSlice';

export const selectReviews = (state: RootState): ReviewState => state?.reviewSlice;

export const selectReviewsByDiningHallSlug = (diningHallSlug: string) => (state: RootState): Review[] => {
    const reviews = selectReviews(state);
    return reviews ? reviews[diningHallSlug] || [] : [];
};
