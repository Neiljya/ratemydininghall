/**
 * Reusable method to load any cached object from localStorage
 * 
 * Generic <T> ensures TypeScript keeps the correct type when parsed
 */

export function loadCache<T>(key: string): T | null {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;

        return JSON.parse(raw) as T;
    } catch (err) {
        console.warn(`Failed to load cache for key ${key}:`, err);
        return null;
    }
}

/**
 * Reusable method to cache any value into localStorage under a given key
 */
export function saveCache<T>(key: string, value: T): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
        console.warn(`Failed to save cache for key ${key}:`, err);
    }
}

/**
 * Function to remove value by key
 */
export function clearCacheKey(key: string): void {
    localStorage.removeItem(key);
}

/**
 * Function to clear all localStorage cache
 */
export function clearCache(): void {
    localStorage.clear();
}