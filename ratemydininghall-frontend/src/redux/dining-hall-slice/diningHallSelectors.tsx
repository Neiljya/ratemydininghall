import type { RootState } from '../store';
import { createSelector } from '@reduxjs/toolkit';

export const selectDiningHallSlice = (state: RootState) => state.diningHall;

// Selector to get all dining halls from the state
export const selectDiningHalls = createSelector(
    [selectDiningHallSlice],
    (diningHallState) => diningHallState.halls
)

export const selectDiningHallById = (id: string) =>
    createSelector([selectDiningHalls], (halls) =>
        halls.find((hall) => hall.id === id)
);

export const selectDiningHallsLoading = createSelector(
    [selectDiningHallSlice],
    (diningHall) => diningHall.loading
)

export const selectDiningHallsError = createSelector(
    [selectDiningHallSlice],
    (diningHall) => diningHall.error
);

export const selectDiningHallCount = createSelector(
    [selectDiningHalls],
    (halls) => halls.length
);