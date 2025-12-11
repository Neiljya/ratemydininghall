import { useAppSelector } from '@redux/hooks';
import { selectDiningHalls, selectDiningHallsLoading, selectDiningHallsError } 
from '@redux/dining-hall-slice/diningHallSelectors';

export function useDiningHalls() {
  const halls = useAppSelector(selectDiningHalls);
  const loading = useAppSelector(selectDiningHallsLoading);
  const error = useAppSelector(selectDiningHallsError);

  return { halls, loading, error };
}