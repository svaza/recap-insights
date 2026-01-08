import { useEffect, useState } from "react";
import type { ActivityItem } from "../models/models";
import { getFromStorage, setStorage, clearCacheByPrefix } from "../utils/storageCache";

type RecapRange = {
    startUtc: string;
    endUtc: string;
};

type ActivityTotal = {
    activities: number;
    distanceM: number;
    movingTimeSec: number;
    elevationM: number;
};

type ActivityBreakdown = {
    type: string;
    distanceM: number;
    movingTimeSec: number;
    elevationM: number;
};

type RecapHighlights = {
    longestActivity?: ActivityItem;
    farthestActivity?: ActivityItem;
};

type RecapApiResponseFlat =
    | { connected: false }
    | { connected: true; range: RecapRange; total: ActivityTotal; breakdown: ActivityBreakdown[]; activeDays: string[]; highlights: RecapHighlights }
    | { connected: true; error: string };

type CachedRecapData = {
    range: RecapRange;
    total: ActivityTotal;
    breakdown: ActivityBreakdown[];
    activeDays: string[];
    highlights: RecapHighlights;
};

const CACHE_KEY = "recapcache:activities-summary";

export function useFetchRecap(queryString: string) {
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [highlights, setHighlights] = useState<RecapHighlights | null>(null);
    const [total, setTotal] = useState<ActivityTotal | null>(null);
    const [breakdown, setBreakdown] = useState<ActivityBreakdown[]>([]);
    const [range, setRange] = useState<RecapRange | null>(null);
    const [activeDays, setActiveDays] = useState<string[]>([]);

    useEffect(() => {
        // Try to load from cache first
        const cachedData = getFromStorage<CachedRecapData>(CACHE_KEY, queryString);
        if (cachedData) {
            setRange(cachedData.range);
            setTotal(cachedData.total);
            setBreakdown(cachedData.breakdown);
            setActiveDays(cachedData.activeDays);
            setHighlights(cachedData.highlights);
            setConnected(true);
            // Skip API call if we have cached data
            return;
        }

        let cancelled = false;
        const run = async () => {
            setLoading(true);
            setError(null);

            try {
                const apiUrl = `/api/recap?${queryString}`;
                const res = await fetch(apiUrl);
                const data = (await res.json()) as RecapApiResponseFlat;

                if (cancelled) return;

                if ("connected" in data && data.connected === false) {
                    setConnected(false);
                    setTotal(null);
                    setBreakdown([]);
                    setRange(null);
                    setHighlights(null);
                    setActiveDays([]);
                    // Clear all cache if not connected
                    clearCacheByPrefix("recapcache:");
                    return;
                }

                if ("error" in data) {
                    setConnected(true);
                    setError(data.error);
                    return;
                }

                setConnected(true);
                setRange(data.range);
                setTotal(data.total);
                setBreakdown(data.breakdown ?? []);
                setActiveDays(data.activeDays ?? []);
                setHighlights(data.highlights ?? null);

                // Update cache with successful data
                const cacheData: CachedRecapData = {
                    range: data.range,
                    total: data.total,
                    breakdown: data.breakdown ?? [],
                    activeDays: data.activeDays ?? [],
                    highlights: data.highlights ?? null,
                };
                setStorage(CACHE_KEY, queryString, cacheData);
            } catch (e) {
                if (!cancelled) setError(String(e));
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, [queryString]);

    return {
        loading,
        connected,
        error,
        highlights,
        total,
        breakdown,
        range,
        activeDays,
    };
}
