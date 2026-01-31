/**
 * Hook for fetching and filtering flyer data
 * Reuses existing recap API with client-side filtering by activity group
 */

import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetRecapQuery, type RecapData } from '../store';
import { useAthleteProfile } from './useAthleteProfile';
import type { FlyerData, FlyerError, ActivityGroup, BestEffort } from '../models/flyer';
import type { ActivityItem } from '../models/models';
import { FLYER_ERROR_MESSAGES } from '../models/flyer';
import { getActivityGroup, isValidActivityGroup, getActivityGroupInfo } from '../utils/activityGroups';
import { computeAggregatesFromBreakdown, selectFlyerStats, type BreakdownItem } from '../utils/flyerStats';
import { formatRangeLabel, secondsToHms, num } from '../utils/format';
import { parseRecapQuery } from '../utils/recapQuery';
import type { RecapQuery } from '../models/models';

/**
 * Builds query string from search params (excluding activityGroup)
 */
function buildQueryString(searchParams: URLSearchParams): string {
    const params = new URLSearchParams();

    // Copy recap-relevant params
    const type = searchParams.get('type');
    const days = searchParams.get('days');
    const unit = searchParams.get('unit');
    const offset = searchParams.get('offset');

    if (type) params.set('type', type);
    if (days) params.set('days', days);
    if (unit) params.set('unit', unit);
    if (offset) params.set('offset', offset);

    return params.toString();
}

/**
 * Gets unit preference from localStorage
 */
function getUnitPreference(): 'km' | 'mi' {
    const stored = localStorage.getItem('recap.units');
    return stored === 'mi' ? 'mi' : 'km';
}

/**
 * Compute dynamic tagline based on period and activity
 */
function computeTagline(query: RecapQuery | null, activityLabel: string): string {
    if (!query) return `${activityLabel} Recap`;

    if (query.type === 'rolling') {
        return `${query.days} Day ${activityLabel}`;
    }

    // Calendar-based
    if (query.unit === 'month') {
        const now = new Date();
        const monthName = now.toLocaleString('en-US', { month: 'long' });
        return `${monthName} ${activityLabel}`;
    }

    if (query.unit === 'year') {
        const now = new Date();
        const targetYear = query.offset ? now.getFullYear() + query.offset : now.getFullYear();
        return `${targetYear} ${activityLabel}`;
    }

    return `${activityLabel} Recap`;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Computes the longest streak of consecutive active days
 */
function computeLongestStreak(activeDayKeys: string[]): number {
    if (activeDayKeys.length === 0) return 0;

    const dates = activeDayKeys
        .map((k) => new Date(`${k}T00:00:00`))
        .sort((a, b) => a.getTime() - b.getTime());

    let best = 1;
    let cur = 1;

    for (let i = 1; i < dates.length; i++) {
        const diffDays = Math.round((dates[i].getTime() - dates[i - 1].getTime()) / MS_PER_DAY);
        if (diffDays === 1) {
            cur += 1;
            best = Math.max(best, cur);
        } else if (diffDays > 1) {
            cur = 1;
        }
    }

    return best;
}

/**
 * Format distance based on unit preference
 */
function formatDistance(meters: number, useMetric: boolean): string {
    if (useMetric) {
        const km = meters / 1000;
        return `${num(km, 1)} km`;
    } else {
        const mi = meters / 1609.344;
        return `${num(mi, 1)} mi`;
    }
}

/**
 * Find best effort activity for the given activity group from highlights
 */
function findBestEffort(
    highlights: { longestActivity?: ActivityItem; farthestActivity?: ActivityItem },
    activityGroup: ActivityGroup,
    useMetric: boolean
): BestEffort | undefined {
    // Check if longest activity matches this group
    const longest = highlights.longestActivity;
    if (longest && getActivityGroup(longest.type) === activityGroup) {
        return {
            type: 'longest',
            name: longest.name,
            activityType: longest.type,
            formattedDistance: formatDistance(longest.distanceM, useMetric),
            formattedTime: secondsToHms(longest.movingTimeSec),
            label: 'Longest Effort',
        };
    }

    // Check if farthest activity matches this group
    const farthest = highlights.farthestActivity;
    if (farthest && getActivityGroup(farthest.type) === activityGroup) {
        return {
            type: 'farthest',
            name: farthest.name,
            activityType: farthest.type,
            formattedDistance: formatDistance(farthest.distanceM, useMetric),
            formattedTime: secondsToHms(farthest.movingTimeSec),
            label: 'Farthest Session',
        };
    }

    return undefined;
}

export type UseFlyerDataResult = {
    loading: boolean;
    error: FlyerError | null;
    data: FlyerData | null;
    activityGroup: ActivityGroup | null;
};

/**
 * Hook for fetching and preparing flyer data
 * 
 * @returns Loading state, error, and flyer data
 */
export function useFlyerData(): UseFlyerDataResult {
    const [searchParams] = useSearchParams();
    const queryString = buildQueryString(searchParams);
    const { data: recapResponse, isLoading, error: queryError } = useGetRecapQuery(queryString);
    const { athleteProfile } = useAthleteProfile();

    // Get activity group from URL params
    const activityGroupParam = searchParams.get('activityGroup');

    const result = useMemo((): UseFlyerDataResult => {
        // Validate activity group parameter
        if (!activityGroupParam) {
            return {
                loading: false,
                error: {
                    type: 'invalid-group',
                    message: FLYER_ERROR_MESSAGES['invalid-group'],
                },
                data: null,
                activityGroup: null,
            };
        }

        if (!isValidActivityGroup(activityGroupParam)) {
            return {
                loading: false,
                error: {
                    type: 'invalid-group',
                    message: FLYER_ERROR_MESSAGES['invalid-group'],
                },
                data: null,
                activityGroup: null,
            };
        }

        const activityGroup = activityGroupParam as ActivityGroup;

        // Handle loading state
        if (isLoading) {
            return {
                loading: true,
                error: null,
                data: null,
                activityGroup,
            };
        }

        // Handle query error
        if (queryError) {
            return {
                loading: false,
                error: {
                    type: 'api-error',
                    message: FLYER_ERROR_MESSAGES['api-error'],
                },
                data: null,
                activityGroup,
            };
        }

        // Handle not connected
        if (!recapResponse || ('connected' in recapResponse && !recapResponse.connected)) {
            return {
                loading: false,
                error: {
                    type: 'not-connected',
                    message: FLYER_ERROR_MESSAGES['not-connected'],
                },
                data: null,
                activityGroup,
            };
        }

        // Handle API error response
        if ('error' in recapResponse) {
            return {
                loading: false,
                error: {
                    type: 'api-error',
                    message: recapResponse.error,
                },
                data: null,
                activityGroup,
            };
        }

        const recapData = recapResponse as RecapData;

        // Get group info for background
        const groupInfo = getActivityGroupInfo(activityGroup);
        const useMetric = getUnitPreference() === 'km';

        // Find the breakdown item matching any activity type in this group
        const matchingBreakdown = recapData.breakdown.find((b) => {
            const breakdownGroup = getActivityGroup(b.type);
            return breakdownGroup === activityGroup;
        });

        // No activities found for this group
        if (!matchingBreakdown) {
            return {
                loading: false,
                error: {
                    type: 'no-activities',
                    message: FLYER_ERROR_MESSAGES['no-activities'],
                },
                data: null,
                activityGroup,
            };
        }

        // Compute aggregates from breakdown
        const breakdownItem: BreakdownItem = {
            type: matchingBreakdown.type,
            distanceM: matchingBreakdown.distanceM,
            movingTimeSec: matchingBreakdown.movingTimeSec,
            elevationM: matchingBreakdown.elevationM,
        };
        const aggregates = computeAggregatesFromBreakdown(breakdownItem);
        
        // Select stats for display (contextual based on activity group)
        const stats = selectFlyerStats(aggregates, useMetric, activityGroup);

        // Find best effort for this activity group
        const bestEffort = recapData.highlights 
            ? findBestEffort(recapData.highlights, activityGroup, useMetric) 
            : undefined;

        // Calculate active days and streak
        const activeDaysCount = recapData.activeDays?.length ?? 0;
        const longestStreak = computeLongestStreak(recapData.activeDays ?? []);

        // Parse query for range labels
        const queryParams = new URLSearchParams(queryString);
        const query = parseRecapQuery(queryParams);
        const rangeLabel = query ? formatRangeLabel(query) : 'Recent Activity';
        const tagline = computeTagline(query, groupInfo.label);

        // Build flyer data
        const flyerData: FlyerData = {
            group: activityGroup,
            groupInfo,
            athleteFirstName: athleteProfile?.firstName ?? 'Athlete',
            rangeLabel,
            tagline,
            rangeTitle: rangeLabel,
            aggregates,
            stats,
            bestEffort,
            activeDaysCount,
            longestStreak,
        };

        return {
            loading: false,
            error: null,
            data: flyerData,
            activityGroup,
        };
    }, [recapResponse, isLoading, queryError, activityGroupParam, athleteProfile, queryString]);

    return result;
}
