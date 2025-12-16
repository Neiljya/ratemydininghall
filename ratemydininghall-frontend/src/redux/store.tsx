import { configureStore } from '@reduxjs/toolkit';
import diningHallReducer from './dining-hall-slice/diningHallSlice';
import reviewSliceReducer from './review-slice/reviewSlice';
import authReducer from './auth-slice/authSlice';
import ratingsReducer from '@redux/ratings-slice/ratingsSlice';

/**
 * The main logic for the redux store, which holds the global state of the application
 * The store is created using configureStore from Redux Toolkit, which simplifies the setup process.
 * 
 * Similar to React components, the store has a single root reducer that combines multiple slices
 * or "components"
 * 
 * To access store, we have: selectors and dispatchers
 * 
 * Selectors - functions that "select" specific pieces of the state (useSelector)
 * Dispatchers - functions that "dispatch" actions to the redux store (useDispatch)
 */
export const store = configureStore({
    reducer: {
        diningHall: diningHallReducer,
        reviewSlice: reviewSliceReducer,
        ratings: ratingsReducer,
        auth: authReducer,
    },
});


// exporting types to appease TypeScript

// RootState - entire redux state tree
export type RootState = ReturnType<typeof store.getState>;

// AppDispatch - subjective name 
export type AppDispatch = typeof store.dispatch;