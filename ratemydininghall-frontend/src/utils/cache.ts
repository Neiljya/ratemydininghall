type CacheInfo<T> = {
    v: number;
    savedAt: number;
    data: T;
}

export type CachePolicy = {
    v: number;
    ttlMs?: number;
}

const DEFAULT_POLICY: CachePolicy = {
    v: 1,
    ttlMs: 5 * 60 * 1000, // refresh cache every 5 mins
};

const policies: Record<string, CachePolicy> = {};

export function setCachePolicies(map: Record<string, Partial<CachePolicy>>) {
    for (const [key, partial] of Object.entries(map)) {
      policies[key] = { ...DEFAULT_POLICY, ...(policies[key] ?? {}), ...partial, v: partial.v ?? (policies[key]?.v ?? DEFAULT_POLICY.v) };
    }
}

function getPolicy(key: string): CachePolicy {
    return policies[key] ?? DEFAULT_POLICY;
}

function isWrapped<T>(x: any): x is CacheInfo<T> {
    return x && typeof x === 'object' && 'data' in x && 'savedAt' in x && 'v' in x;
}

function now() {
    return Date.now();
}


/**
 * Reusable method to load any cached object from localStorage
 * 
 * Generic <T> ensures TypeScript keeps the correct type when parsed
 */

export function loadCache<T>(key: string): T | null {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;

        const parsed = JSON.parse(raw);
        const policy = getPolicy(key);

        if (isWrapped<T>(parsed)) {
            if (parsed.v !== policy.v) return null;

            // ttl check
            if (policy.ttlMs != null) {
                const age = now() - parsed.savedAt;
                if (age > policy.ttlMs) return null;
            }
            return parsed.data as T;
        }

        return parsed as T;
    } catch (err) {
        console.warn(`Failed to load cache for key ${key}:`, err);
        return null;
    }
}

/**
 * Reusable method to cache any value into localStorage under a given key
 * stored as wrapped info
 */
export function saveCache<T>(key: string, value: T): void {
    try {
        const policy = getPolicy(key);
        const payload: CacheInfo<T> = {
            v: policy.v,
            savedAt: Date.now(),
            data: value,
        }
        localStorage.setItem(key, JSON.stringify(payload));
    } catch (err) {
        console.warn(`Failed to save cache for key ${key}:`, err);
    }
}

export function checkCacheState(key: string): boolean {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return true;

        const parsed = JSON.parse(raw);
        const policy = getPolicy(key);

        if (isWrapped(parsed)) {
            if (parsed.v !== policy.v) return true;
            if (policy.ttlMs != null && now() - parsed.savedAt > policy.ttlMs) return true;
            return false;
        }

        return false;
    } catch {
        return true;
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