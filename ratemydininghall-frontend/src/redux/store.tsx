import { configureStore } from "@reduxjs/toolkit";
import diningHallReducer from "./dining-hall/diningHallSlice";

export const store = configureStore({
    reducer: {
        diningHall: diningHallReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;