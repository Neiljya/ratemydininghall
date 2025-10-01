import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Review {
    id: string;
    author: string;
    description: string;
    date: number;
    rating: number
}

export type ReviewState = {
    [diningHallId: string]: Review[];
};

/**
 * Store all reviews under dining hall IDs
 * e.g., { bistro: [review1, review2], ... }
 * 
 * This structure allows easy retrieval of reviews for a specific dining hall
 * by accessing state.reviews[diningHallId]
 * 
 * This is more efficient than storing all reviews in a flat array and filtering
 * 
 * Future reviews should follow this format: diningHallId: [ ...reviews ]
 * 
 * This is just a temporary initial state for testing purposes, in the future this state
 * should be fetched from an API/backend
 * 
 * 
 */
const initialState: ReviewState = {
    bistro: [
        {
            id: 'bistro-r1a',
            author: 'John',
            description: 'Great food and atmosphere!',
            date: new Date('2023-10-01T20:25:00').getTime(),
            rating: 4
        }
    ]
}

// /**
//  * Final version with empty initial state
//  * 
//  * after fetching from api, call setReviews() reducer to populate state
//  */
// const initialState: ReviewState = {};

const reviewSlice = createSlice({
    name: 'reviewSlice',
    initialState,
    reducers: {
        setReviews(state, action: PayloadAction<ReviewState>) {
            // replace state in Redux store
            return action.payload; 
        },

        addReview(state, action: PayloadAction<{ diningHallId: string; review: Review }>) {
            const { diningHallId, review } = action.payload;
            if (!!state[diningHallId]) {
                state[diningHallId].push(review);
            }
        },
    }
});

export const { addReview, setReviews } = reviewSlice.actions;
export default reviewSlice.reducer;