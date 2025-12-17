import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import {
  fetchMenuItemsByHall,
  setMenuItemsForHall,
} from '@redux/menu-item-slice/menuItemSlice';
import {
  selectMenuItemsByHall,
  selectMenuItemsStatusByHall,
} from '@redux/menu-item-slice/menuItemSelectors';
import { loadCache, saveCache } from '@utils/cache';
import type { MenuItem } from '@redux/menu-item-slice/menuItemTypes';

const cacheKey = (slug: string) => `menuItems:${slug}`;

export function useMenuItemsBootstrap(diningHallSlug: string) {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectMenuItemsByHall(diningHallSlug));
  const status = useAppSelector(selectMenuItemsStatusByHall(diningHallSlug));

  // load once (cache -> network)
  useEffect(() => {
    if (!diningHallSlug) return;
    if (status !== 'idle') return;

    const cached = loadCache<MenuItem[]>(cacheKey(diningHallSlug));
    if (cached?.length) {
      dispatch(setMenuItemsForHall({ diningHallSlug, items: cached }));
    } else {
      dispatch(fetchMenuItemsByHall(diningHallSlug));
    }
  }, [dispatch, diningHallSlug, status]);

  // save when we have data
  useEffect(() => {
    if (!diningHallSlug) return;
    if (!items?.length) return;
    saveCache(cacheKey(diningHallSlug), items);
  }, [diningHallSlug, items]);
}
