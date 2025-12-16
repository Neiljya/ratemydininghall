import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { graphQLRequest } from '@graphQL/graphQLClient';
import { getAllReviewsQuery, getReviewsByHallQuery } from '@graphQL/queries/reviewQueries';

export interface Review {
    id: string;
    diningHallSlug?: string;
    author: string;
    description: string;
    createdAt: string;
    rating: number;
    status?: string | null;
}

export type NewReviewInput = Omit<Review, 'id' | 'createdAt'>;

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
// const initialState: ReviewState = {
//     bistro: [
//         {
//             id: 'bistro-r1a',
//             diningHallSlug: 'bistro',
//             author: 'John',
//             description: 'Great food and atmosphere!',
//             createdAt: String(new Date('2023-10-01T20:25:00').getTime()),
//             rating: 4
//         }
//     ]
// }
const initialState: ReviewState = {};

export const fetchReviews = createAsyncThunk<ReviewState>(
  'review/fetchReviews',
  async () => {
    const data = await graphQLRequest<{ reviews: Review[] }>(getAllReviewsQuery);
    
    const hallsToReviewsArr: ReviewState = {};

    for (const review of data.reviews) {
        if (!review.diningHallSlug) continue;
        
        const key = review.diningHallSlug || '';

        if (!hallsToReviewsArr[key]){
            hallsToReviewsArr[key] = [];
        }

        hallsToReviewsArr[key].push({
            id: review.id,
            diningHallSlug: review.diningHallSlug,
            author: review.author,
            description: review.description,
            rating: review.rating,
            createdAt: String(new Date(review.createdAt).getTime()),
        });
    }

    return hallsToReviewsArr;
  }
);

export const fetchReviewsByHall = createAsyncThunk<
  { diningHallSlug: string; reviews: Review[] },
  string
>(
  'review/fetchReviewsByHall',
  async (diningHallSlug: string) => {
    const data = await graphQLRequest<{ reviewsByHall: Review[] }>(
      getReviewsByHallQuery,
      { diningHallSlug }
    );

    const reviews: Review[] = data.reviewsByHall.map((review) => ({
      id: review.id,
      diningHallSlug: review.diningHallSlug,
      author: review.author,
      description: review.description,
      rating: review.rating,
      createdAt: String(new Date(review.createdAt).getTime()),
    }));

    return { diningHallSlug, reviews };
  }
);

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
        setReviews(_, action: PayloadAction<ReviewState>) {
            // replace state in Redux store
            return action.payload; 
        },

        setReviewsForHall(
            state,
            action: PayloadAction<{ diningHallSlug: string; reviews: Review[] }>
        ) {
            const { diningHallSlug, reviews } = action.payload;
            state[diningHallSlug] = reviews;

        },

        addReview(state, action: PayloadAction<{ diningHallSlug: string; review: Review }>) {
            const { diningHallSlug, review } = action.payload;
            if (!state[diningHallSlug]) {
                state[diningHallSlug] = [];
            }
            state[diningHallSlug].push(review);
        },
    },

    extraReducers: (builder) => {
        builder
        .addCase(fetchReviews.fulfilled, (_, action) => {
            return action.payload;
        })
        .addCase(fetchReviewsByHall.fulfilled, (state, action) => {
            const { diningHallSlug, reviews } = action.payload;
            state[diningHallSlug] = reviews;
        })
    },
});

export const { addReview, setReviews } = reviewSlice.actions;
export default reviewSlice.reducer;