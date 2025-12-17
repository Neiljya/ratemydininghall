import { useAppSelector } from '@redux/hooks';
import {
  selectMenuItemsByHall,
  selectMenuItemsStatusByHall,
  selectMenuItemsErrorByHall,
} from '@redux/menu-item-slice/menuItemSelectors';

export function useMenuItems(diningHallSlug: string) {
  const items = useAppSelector(selectMenuItemsByHall(diningHallSlug));
  const status = useAppSelector(selectMenuItemsStatusByHall(diningHallSlug));
  const error = useAppSelector(selectMenuItemsErrorByHall(diningHallSlug));

  return { items, status, error };
}
