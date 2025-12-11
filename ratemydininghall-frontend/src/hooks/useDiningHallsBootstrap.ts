import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import { selectDiningHalls } 
from '@redux/dining-hall-slice/diningHallSelectors';
import { fetchDiningHalls, setDiningHalls } from '@redux/dining-hall-slice/diningHallSlice';
import type { DiningHall } from '@redux/dining-hall-slice/diningHallSlice';
import { loadCache, saveCache } from '@utils/cache';

const CACHE_KEY = 'diningHalls';
/**
 * Method to encapsulate dining hall fetching logic with caching
 * 
 * @returns dining halls, loading state, and error state
 */
export function useDiningHallsBootstrap() {
    const dispatch = useAppDispatch();
    const halls = useAppSelector(selectDiningHalls);

    useEffect(() => {
        if (halls.length === 0) {
            const cached = loadCache<DiningHall[]>(CACHE_KEY);

            if (cached) {
                dispatch(setDiningHalls(cached));
            } else {
                dispatch(fetchDiningHalls());
            }
        }
    }, [dispatch, halls.length]);

    useEffect(() => {
        if (halls.length > 0) {
            saveCache(CACHE_KEY, halls);
        }
    }, [halls]);
}
