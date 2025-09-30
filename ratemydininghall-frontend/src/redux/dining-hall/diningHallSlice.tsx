import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface DiningHall {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
}

interface DiningHallState {
    halls: DiningHall[];
}

const initialState: DiningHallState = {
    halls: [
        {
            id: 'bistro',
            name: 'The Bistro At Seventh',
            description: 'Good dining hall',
            imageUrl: 'https://images.squarespace-cdn.com/content/v1/57e94430d2b8579f31ebcc38/1528371545872-6211WXGHXMLN7CMLV44J/UCSD+The+Bistro+interior'
        },
        // future dining halls can be added here
    ]
};

/**
 * Creates a slice for holding the dining hall information, with the reducers
 * we can easily add dining halls via calling the reducers with dispatch()
 * 
 * Reducer - functions that modify the state (takes current and returns new) in response
 * to actions (objects that describe what happened)
 * 
 * Actions - payloads of information that send data from the application to the store
 * 
 * A combined state can look like this:
 * {
 *  diningHall: { halls: [...] },
 *  review: { ...},
 *  user: { ... }
 * }
 * 
 * Each value is "bundled" by a slice which contains the reducer logic, data, and actions
 */
const diningHallSlice = createSlice({
    name: 'diningHall',
    initialState,
    reducers: {
        setDiningHalls(state, action: PayloadAction<DiningHall[]>) {
            state.halls = action.payload;
        },
        addDiningHall(state, action: PayloadAction<DiningHall>) {
            state.halls.push(action.payload);
        },
    },
});

export const { setDiningHalls, addDiningHall } = diningHallSlice.actions;
export default diningHallSlice.reducer;