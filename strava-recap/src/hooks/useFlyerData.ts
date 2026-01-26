/**
 * Hook for fetching and filtering flyer data
 * Reuses existing recap API with client-side filtering by activity group
 */

import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetRecapQuery, type RecapData } from '../store';
import { useAthleteProfile } from './useAthleteProfile';
import type { FlyerData, FlyerError, ActivityGroup } from '../models/flyer';
import { FLYER_ERROR_MESSAGES } from '../models/flyer';
import { getActivityGroup, isValidActivityGroup, getActivityGroupInfo } from '../utils/activityGroups';
import { computeAggregatesFromBreakdown, selectFlyerStats, type BreakdownItem } from '../utils/flyerStats';
import { formatRangeLabel } from '../utils/format';
import { parseRecapQuery } from '../utils/recapQuery';

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

        // Parse query for range labels
        const queryParams = new URLSearchParams(queryString);
        const query = parseRecapQuery(queryParams);
        const rangeLabel = query ? formatRangeLabel(query) : 'Recent Activity';

        // Build flyer data
        const flyerData: FlyerData = {
            group: activityGroup,
            groupInfo,
            athleteFirstName: athleteProfile?.firstName ?? 'Athlete',
            rangeLabel,
            rangeTitle: rangeLabel,
            aggregates,
            stats,
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
