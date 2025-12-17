import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { MenuItem } from './menuItemTypes';
import { graphQLRequest } from '@graphQL/graphQLClient'
import { MENU_ITEMS_BY_HALL } from '@graphQL/queries/menuItemsQueries';

type MenuItemState = {
  byHall: Record<string, MenuItem[]>;
  statusByHall: Record<string, 'idle' | 'loading' | 'succeeded' | 'failed'>;
  errorByHall: Record<string, string | null>;
};

const initialState: MenuItemState = {
  byHall: {},
  statusByHall: {},
  errorByHall: {},
};

export const fetchMenuItemsByHall = createAsyncThunk(
  'menuItems/fetchByHall',
  async (diningHallSlug: string) => {
    const data = await graphQLRequest<{ menuItemsByHall: MenuItem[] }>(MENU_ITEMS_BY_HALL, {
      diningHallSlug,
    });
    return { diningHallSlug, items: data.menuItemsByHall };
  }
);

const menuItemSlice = createSlice({
  name: 'menuItems',
  initialState,
  reducers: {
    setMenuItemsForHall(
      state,
      action: PayloadAction<{ diningHallSlug: string; items: MenuItem[] }>
    ) {
      state.byHall[action.payload.diningHallSlug] = action.payload.items;
      state.statusByHall[action.payload.diningHallSlug] = 'succeeded';
      state.errorByHall[action.payload.diningHallSlug] = null;
    },
    clearMenuItemsForHall(state, action: PayloadAction<{ diningHallSlug: string }>) {
      delete state.byHall[action.payload.diningHallSlug];
      delete state.statusByHall[action.payload.diningHallSlug];
      delete state.errorByHall[action.payload.diningHallSlug];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenuItemsByHall.pending, (state, action) => {
        state.statusByHall[action.meta.arg] = 'loading';
        state.errorByHall[action.meta.arg] = null;
      })
      .addCase(fetchMenuItemsByHall.fulfilled, (state, action) => {
        const { diningHallSlug, items } = action.payload;
        state.statusByHall[diningHallSlug] = 'succeeded';
        state.byHall[diningHallSlug] = items;
      })
      .addCase(fetchMenuItemsByHall.rejected, (state, action) => {
        const slug = action.meta.arg;
        state.statusByHall[slug] = 'failed';
        state.errorByHall[slug] = action.error.message ?? 'Failed to fetch menu items';
      });
  },
});

export const { setMenuItemsForHall, clearMenuItemsForHall } = menuItemSlice.actions;
export default menuItemSlice.reducer;
