import type { RootState } from '../store';

// Selector to get all dining halls from the state
export const selectDiningHalls = (state: RootState) => state?.diningHall?.halls;