import type { RootState } from '@redux/store';

export const selectRatingsByHall = (state: RootState) => state.ratings.byHall;

export const selectAvgRatingByHallSlug = 
    (hallSlug: string) =>
    (state: RootState): number =>
        state.ratings.byHall[hallSlug]?.avg ?? 0;

export const selectRatingCountByHallSlug = 
    (hallSlug: string) =>
    (state: RootState): number =>
        state.ratings.byHall[hallSlug]?.count ?? 0;
