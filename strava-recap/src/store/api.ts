import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ActivityItem } from "../models/models";
import { getFromStorage, setStorage, clearCacheByPrefix } from "../utils/storageCache";
import { parseProviderType, type ProviderType } from "../utils/provider";

// ============ Types ============

export type AthleteProfile = {
    firstName: string;
    lastName: string;
    fullName: string;
};

type AthleteApiResponse =
    | { connected: false }
    | { connected: true; provider?: string; profile: AthleteProfile };

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
    activities: number;
    distanceM: number;
    movingTimeSec: number;
    elevationM: number;
};

type ActivityBreakdownApi = {
    type: string;
    activities?: number;
    distanceM: number;
    movingTimeSec: number;
    elevationM: number;
};

type RecapActivityDay = {
    date: string;
    activities: number;
    distanceM: number;
    movingTimeSec: number;
    effortScore: number;
    effortMetric: "distance" | "time" | "none";
    effortValue: number;
    effortType: string | null;
    types: string[];
};

type RecapActivityDayApi = {
    date: string;
    activities?: number;
    distanceM?: number;
    movingTimeSec?: number;
    effortScore?: number;
    effortMetric?: string;
    effortValue?: number;
    effortType?: string | null;
    types?: string[];
};

type RecapDaySummary = {
    date: string;
    activities: number;
    distanceM: number;
    movingTimeSec: number;
    elevationM: number;
};

type RecapWeekSummary = {
    startDate: string;
    endDate: string;
    activities: number;
    distanceM: number;
    movingTimeSec: number;
    elevationM: number;
};

type RecapTimeOfDay = {
    persona: string;
    bucket: string;
    activities: number;
    totalActivities: number;
    percent: number;
};

type RecapHighlights = {
    longestActivity?: ActivityItem;
    farthestActivity?: ActivityItem;
    biggestClimbActivity?: ActivityItem;
    fastestPaceActivity?: ActivityItem;
    best5kActivity?: ActivityItem;
    best10kActivity?: ActivityItem;
    mostActiveDay?: RecapDaySummary;
    longestWeeklyDistance?: RecapWeekSummary;
    timeOfDayPersona?: RecapTimeOfDay;
    highestAvgHeartrateActivity?: ActivityItem;
    highestMaxHeartrateActivity?: ActivityItem;
};

type RecapApiResponseFlat =
    | { connected: false }
    | { connected: true; provider?: string; range: RecapRange; total: ActivityTotal; availableActivityTypes?: string[]; breakdown: ActivityBreakdownApi[]; activeDays: string[]; activityDays?: RecapActivityDayApi[]; highlights: RecapHighlights }
    | { connected: true; error: string };

export type RecapData = {
    connected: true;
    provider: ProviderType;
    range: RecapRange;
    total: ActivityTotal;
    availableActivityTypes: string[];
    breakdown: ActivityBreakdown[];
    activeDays: string[];
    activityDays: RecapActivityDay[];
    highlights: RecapHighlights;
};

export type ProfileData = {
    connected: boolean;
    provider: ProviderType;
    profile: AthleteProfile | null;
};

// ============ Cache Keys ============

const PROFILE_CACHE_KEY = "recapcache:profile";
const PROVIDER_CACHE_KEY = "recapcache:provider";
const RECAP_CACHE_KEY = "recapcache:activities-summary:v5";

function normalizeBreakdown(items: Array<ActivityBreakdownApi | ActivityBreakdown>): ActivityBreakdown[] {
    return items.map((item) => ({
        type: item.type,
        activities: typeof item.activities === "number" ? item.activities : 0,
        distanceM: item.distanceM,
        movingTimeSec: item.movingTimeSec,
        elevationM: item.elevationM,
    }));
}

function normalizeAvailableActivityTypes(items: string[] | undefined, fallbackBreakdown: ActivityBreakdown[]): string[] {
    const source = items ?? fallbackBreakdown.map((item) => item.type);
    const seen = new Set<string>();
    const output: string[] = [];

    for (const value of source) {
        const normalized = String(value ?? "").trim();
        if (!normalized || seen.has(normalized)) continue;
        seen.add(normalized);
        output.push(normalized);
    }

    return output;
}

function normalizeActivityDays(
    items: Array<RecapActivityDayApi | RecapActivityDay> | undefined,
    fallbackActiveDays: string[]
): RecapActivityDay[] {
    if (!Array.isArray(items) || items.length === 0) {
        return [...new Set(fallbackActiveDays.map((day) => String(day ?? "").trim()).filter(Boolean))]
            .sort()
            .map((date) => ({
                date,
                activities: 1,
                distanceM: 0,
                movingTimeSec: 0,
                effortScore: 0,
                effortMetric: "none" as const,
                effortValue: 0,
                effortType: null,
                types: [],
            }));
    }

    return items
        .map((item) => {
            const date = String(item.date ?? "").trim();
            if (!date) return null;

            const types = Array.isArray(item.types)
                ? [...new Set(item.types.map((type) => String(type ?? "").trim()).filter(Boolean))]
                : [];

            return {
                date,
                activities: typeof item.activities === "number" ? Math.max(0, item.activities) : 0,
                distanceM: typeof item.distanceM === "number" ? Math.max(0, item.distanceM) : 0,
                movingTimeSec: typeof item.movingTimeSec === "number" ? Math.max(0, item.movingTimeSec) : 0,
                effortScore: typeof item.effortScore === "number" ? Math.max(0, Math.min(100, Math.round(item.effortScore))) : 0,
                effortMetric: item.effortMetric === "distance" || item.effortMetric === "time" ? item.effortMetric : "none",
                effortValue: typeof item.effortValue === "number" ? Math.max(0, item.effortValue) : 0,
                effortType: typeof item.effortType === "string" && item.effortType.trim().length > 0 ? item.effortType.trim() : null,
                types,
            } satisfies RecapActivityDay;
        })
        .filter((item): item is RecapActivityDay => item !== null)
        .sort((a, b) => a.date.localeCompare(b.date));
}

// ============ API Slice ============

export const api = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
    tagTypes: ["Profile", "Recap"],
    endpoints: (builder) => ({
        // Get athlete profile
        getProfile: builder.query<ProfileData, void>({
            queryFn: async (_arg, _queryApi, _extraOptions, baseQuery) => {
                // Check localStorage cache first
                const cachedProfile = getFromStorage<AthleteProfile>(PROFILE_CACHE_KEY);
                const cachedProvider = getFromStorage<ProviderType>(PROVIDER_CACHE_KEY);
                
                if (cachedProfile && cachedProvider) {
                    return {
                        data: {
                            connected: true,
                            provider: cachedProvider,
                            profile: cachedProfile,
                        },
                    };
                }

                // Fetch from API
                const result = await baseQuery("/me");
                
                if (result.error) {
                    return { error: result.error };
                }

                const data = result.data as AthleteApiResponse;

                if (data.connected) {
                    const providerType = parseProviderType(data.provider);
                    // Cache the data
                    setStorage(PROFILE_CACHE_KEY, data.profile);
                    setStorage(PROVIDER_CACHE_KEY, providerType);
                    
                    return {
                        data: {
                            connected: true,
                            provider: providerType,
                            profile: data.profile,
                        },
                    };
                } else {
                    // Clear cache if not connected
                    clearCacheByPrefix("recapcache:");
                    return {
                        data: {
                            connected: false,
                            provider: null as unknown as ProviderType,
                            profile: null,
                        },
                    };
                }
            },
            providesTags: ["Profile"],
        }),

        // Get recap data
        getRecap: builder.query<RecapData | { connected: false } | { connected: true; error: string }, string>({
            queryFn: async (queryString, _queryApi, _extraOptions, baseQuery) => {
                // Check localStorage cache first
                const cachedData = getFromStorage<RecapData>(RECAP_CACHE_KEY, queryString);
                
                if (cachedData) {
                    const normalizedBreakdown = normalizeBreakdown(cachedData.breakdown);
                    const normalizedActivityDays = normalizeActivityDays(cachedData.activityDays, cachedData.activeDays ?? []);
                    return {
                        data: {
                            ...cachedData,
                            breakdown: normalizedBreakdown,
                            availableActivityTypes: normalizeAvailableActivityTypes(cachedData.availableActivityTypes, normalizedBreakdown),
                            activityDays: normalizedActivityDays,
                        },
                    };
                }

                // Fetch from API
                const result = await baseQuery(`/recap?${queryString}`);
                
                if (result.error) {
                    return { error: result.error };
                }

                const data = result.data as RecapApiResponseFlat;

                if ("connected" in data && data.connected === false) {
                    clearCacheByPrefix("recapcache:");
                    return { data: { connected: false } };
                }

                if ("error" in data) {
                    return { data: { connected: true, error: data.error } };
                }

                const normalizedBreakdown = normalizeBreakdown(data.breakdown);
                const normalizedActivityDays = normalizeActivityDays(data.activityDays, data.activeDays ?? []);
                const recapData: RecapData = {
                    connected: true,
                    provider: parseProviderType(data.provider),
                    range: data.range,
                    total: data.total,
                    availableActivityTypes: normalizeAvailableActivityTypes(data.availableActivityTypes, normalizedBreakdown),
                    breakdown: normalizedBreakdown,
                    activeDays: data.activeDays,
                    activityDays: normalizedActivityDays,
                    highlights: data.highlights,
                };

                // Cache the data
                setStorage(RECAP_CACHE_KEY, queryString, recapData);

                return { data: recapData };
            },
            providesTags: (_result, _error, queryString) => [{ type: "Recap", id: queryString }],
        }),

        // Disconnect (clear cookies via API and invalidate cache)
        disconnect: builder.mutation<void, void>({
            queryFn: async (_arg, _queryApi, _extraOptions, baseQuery) => {
                // Call backend to clear cookies
                await baseQuery({ url: "/disconnect", method: "POST" });
                
                // Clear localStorage cache
                clearCacheByPrefix("recapcache:");
                
                return { data: undefined };
            },
            invalidatesTags: ["Profile", "Recap"],
        }),
    }),
});

export const { 
    useGetProfileQuery, 
    useGetRecapQuery, 
    useDisconnectMutation 
} = api;
