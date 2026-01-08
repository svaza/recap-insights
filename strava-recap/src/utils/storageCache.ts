/**
 * Helper functions for localStorage caching with optional base64-encoded data keys
 */

/**
 * Base64 encode a string safely for use in localStorage keys
 */
function encodeData(data: string): string {
    try {
        return btoa(data);
    } catch (e) {
        // Fallback for non-ASCII characters
        return btoa(encodeURIComponent(data));
    }
}

/**
 * Get a value from localStorage with optional data parameter
 * @param key The base key (e.g., "recapcache:profile")
 * @param data Optional data to append to key (will be base64 encoded)
 * @returns Parsed value from localStorage or null
 */
export function getFromStorage<T>(key: string, data?: string): T | null {
    try {
        const fullKey = data ? `${key}:${encodeData(data)}` : key;
        const item = localStorage.getItem(fullKey);
        if (!item) return null;
        return JSON.parse(item) as T;
    } catch (e) {
        return null;
    }
}

/**
 * Set a value in localStorage with optional data parameter
 * @param key The base key (e.g., "recapcache:profile")
 * @param dataOrValue If string and value is provided, this is data (will be base64 encoded). Otherwise this is the value.
 * @param value Optional value if dataOrValue is data
 */
export function setStorage<T>(key: string, dataOrValue: string | T, value?: T): void {
    try {
        let fullKey: string;
        let valueToStore: T;

        if (value !== undefined) {
            // dataOrValue is data parameter
            fullKey = `${key}:${encodeData(dataOrValue as string)}`;
            valueToStore = value;
        } else {
            // dataOrValue is the value
            fullKey = key;
            valueToStore = dataOrValue as T;
        }

        localStorage.setItem(fullKey, JSON.stringify(valueToStore));
    } catch (e) {
        // Silently fail if localStorage is full or unavailable
    }
}

/**
 * Remove a value from localStorage with optional data parameter
 * @param key The base key
 * @param data Optional data to append to key (will be base64 encoded)
 */
export function removeFromStorage(key: string, data?: string): void {
    try {
        const fullKey = data ? `${key}:${encodeData(data)}` : key;
        localStorage.removeItem(fullKey);
    } catch (e) {
        // Silently fail
    }
}

/**
 * Clear all localStorage keys matching a prefix pattern
 * @param prefix The prefix to match (e.g., "recapcache:")
 */
export function clearCacheByPrefix(prefix: string): void {
    try {
        const keysToRemove: string[] = [];
        
        // Collect all keys that match the prefix
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                keysToRemove.push(key);
            }
        }
        
        // Remove all matching keys
        keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (e) {
        // Silently fail
    }
}
