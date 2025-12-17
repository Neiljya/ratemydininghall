import type { MenuItem } from './menuItemTypes';

export const selectMenuItemsByHall =
  (slug: string) =>
  (state: any): MenuItem[] =>
    state.menuItems.byHall[slug] ?? [];

export const selectMenuItemsStatusByHall =
  (slug: string) =>
  (state: any) =>
    state.menuItems.statusByHall[slug] ?? 'idle';

export const selectMenuItemsErrorByHall =
  (slug: string) =>
  (state: any) =>
    state.menuItems.errorByHall[slug] ?? null;
