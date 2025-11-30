import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface DiningHall {
    id: string;
    slug: string;
    name: string;
    description: string;
    imageUrl: string;
}

interface DiningHallState {
    halls: DiningHall[];
    loading: boolean;
    error: string | null;
}

const initialState: DiningHallState = {
    // // uncomment for testing purposes
    // halls: [
    //     {
    //         id: 'bistro',
    //         name: 'The Bistro At Seventh',
    //         description: 'Good dining hall',
    //         imageUrl: 'https://images.squarespace-cdn.com/content/v1/57e94430d2b8579f31ebcc38/1528371545872-6211WXGHXMLN7CMLV44J/UCSD+The+Bistro+interior'
    //     },
    //     // future dining halls can be added here
    // ]
    halls: [],
    loading: false,
    error: null
};

const graphQLEndpoint = 
    import.meta.env.DEV ? 'http://localhost:3000/api/graphql' : '/api/graphql';

export const fetchDiningHalls = createAsyncThunk<DiningHall[]>(
    'diningHall/fetchDiningHalls',
    async () => {
        const res = await fetch(graphQLEndpoint, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                query: `
                    query GetDiningHalls {
                        diningHalls {
                            id
                            slug
                            name
                            description
                            imageUrl
                        }
                    }
                `,
            }),
        });

        const json = await res.json();

        if (json.errors) {
            throw new Error(json.errors[0].message ?? 'Failed to fetch dining halls');
        }

        return json.data.diningHalls as DiningHall[];
    }
);

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

    // handles actions defined inside the slice
    reducers: {
        setDiningHalls(state, action: PayloadAction<DiningHall[]>) {
            state.halls = action.payload;
        },
        addDiningHall(state, action: PayloadAction<DiningHall>) {
            state.halls.push(action.payload);
        },
    },

    // handles actions defined outside the slice
    // helps handle the status of the state and loads it (so we dont need redundant code later)
    extraReducers: (builder) => {
        builder
            .addCase(fetchDiningHalls.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchDiningHalls.fulfilled, (state, action) => {
                state.loading = false;
                state.halls = action.payload;
            })
            .addCase(fetchDiningHalls.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message ?? null;
            });
    }
});

export const { setDiningHalls, addDiningHall } = diningHallSlice.actions;
export default diningHallSlice.reducer;