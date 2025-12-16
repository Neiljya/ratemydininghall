import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ReviewState } from '@redux/review-slice/reviewSlice';
import { fetchReviews, setReviews } from '@redux/review-slice/reviewSlice';

type RatingAgg = { count: number; sum: number; avg: number };

export type RatingsState = {
    byHall: Record<string, RatingAgg>;
    globalVersion: number;
};

const initialState: RatingsState = {
    byHall: {},
    globalVersion: 0,
};

function clampRating(n: number) {
    return Math.max(1, Math.min(5, n));
}

function recomputeAvg(agg: RatingAgg) {
    agg.avg = agg.count > 0 ? agg.sum / agg.count : 0;
}

function ensureAgg(state: RatingsState, hallSlug: string): RatingAgg {
    if (!state.byHall[hallSlug]) {
        state.byHall[hallSlug] = { count: 0, sum: 0, avg: 0};
    }

    return state.byHall[hallSlug];
}

function buildAggsFromReviewState(reviewsByHall: ReviewState): Record<string, RatingAgg> {
    const byHall: Record<string, RatingAgg> = {};

    for (const [hallSlug, reviews] of Object.entries(reviewsByHall)) {
        let sum = 0;
        let count = 0;

        for (const review of reviews) {
            if (typeof review.rating !== 'number') continue;
            sum += clampRating(review.rating);
            count += 1;
        }

        byHall[hallSlug] = {
            sum,
            count,
            avg: count > 0 ? sum / count : 0,
        };
    }

    return byHall;
}

const ratingsSlice = createSlice({
    name: 'ratings',
    initialState,
    reducers: {
        // in case of review calculation errors, recompute the review
        recomputeFromReviews(_state, action: PayloadAction<ReviewState>) {
            return {
                byHall: buildAggsFromReviewState(action.payload),
                globalVersion: Date.now(),
            };
        },
        // called whenever a review is accepted (O(1) adding)
        applyReviewAdded(state, action: PayloadAction<{ hallSlug: string; rating: number }>) {
            const { hallSlug, rating } = action.payload;
            const agg = ensureAgg(state, hallSlug);
            agg.count += 1;
            agg.sum += clampRating(rating);
            recomputeAvg(agg);
            state.globalVersion += 1;
        },
        // called whenever accepted review is deleted O(1) removal
        applyReviewRemoved(state, action: PayloadAction<{ hallSlug: string; rating: number }>) {
            const { hallSlug, rating } = action.payload;
            const agg = ensureAgg(state, hallSlug);

            if (agg.count <= 0) return;

            agg.count -= 1;
            agg.sum -= clampRating(rating);

            if (agg.count <= 0) {
                agg.count = 0;
                agg.sum = 0;
                agg.avg = 0;
            } else {
                recomputeAvg(agg);
            }

            state.globalVersion += 1;
        },
    },

    extraReducers: (builder) => {
        // after we fetch all accepted reviews => compute all the reviews in one pass
        builder.addCase(fetchReviews.fulfilled, (state, action) => {
            state.byHall = buildAggsFromReviewState(action.payload);
            state.globalVersion += 1;
        })
        .addCase(setReviews, (state, action: PayloadAction<ReviewState>) => {
            state.byHall = buildAggsFromReviewState(action.payload);
            state.globalVersion += 1;
        });
    },
});

export const {
    recomputeFromReviews,
    applyReviewAdded,
    applyReviewRemoved
} = ratingsSlice.actions;

export default ratingsSlice.reducer;