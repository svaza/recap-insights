/**
 * Flyer statistics computation utilities
 * Computes aggregates and selects display stats for flyers
 */

import type { FlyerAggregates, FlyerStatItem, FlyerAlignment, ActivityGroup } from '../models/flyer';
import { secondsToHms, num } from './format';
import { getDisplayStatsForGroup, type StatType } from './activityStatsConfig';

/**
 * Breakdown item from recap data
 */
export type BreakdownItem = {
    type: string;
    distanceM: number;
    movingTimeSec: number;
    elevationM: number;
};

/**
 * Computes aggregate statistics from breakdown data
 */
export function computeAggregatesFromBreakdown(breakdown: BreakdownItem): FlyerAggregates {
    return {
        count: 1, // We don't have exact count from breakdown
        totalDistanceMeters: breakdown.distanceM,
        totalMovingTimeSeconds: breakdown.movingTimeSec,
        totalElevationGainMeters: breakdown.elevationM,
        longestDistanceMeters: breakdown.distanceM,
        longestMovingTimeSeconds: breakdown.movingTimeSec,
        activeDays: 0, // Not available from breakdown
    };
}

/**
 * Keys available in aggregates for stat selection
 */
type AggregateKey = 'totalDistanceMeters' | 'totalMovingTimeSeconds' | 'totalElevationGainMeters';

/**
 * Maps StatType to AggregateKey
 */
function statTypeToAggregateKey(statType: StatType): AggregateKey {
    switch (statType) {
        case 'distance':
            return 'totalDistanceMeters';
        case 'time':
            return 'totalMovingTimeSeconds';
        case 'elevation':
            return 'totalElevationGainMeters';
    }
}

/**
 * Formats a stat value for display
 */
function formatStatValue(key: AggregateKey, value: number, useMetric: boolean): string {
    switch (key) {
        case 'totalDistanceMeters':
            if (useMetric) {
                const km = value / 1000;
                return num(km, km >= 100 ? 0 : 1);
            } else {
                const mi = value / 1609.344;
                return num(mi, mi >= 100 ? 0 : 1);
            }
        case 'totalMovingTimeSeconds':
            return secondsToHms(value);
        case 'totalElevationGainMeters':
            if (useMetric) {
                return num(value, 0);
            } else {
                const ft = value * 3.28084;
                return num(ft, 0);
            }
        default:
            return num(value, 0);
    }
}

/**
 * Gets the unit label for a stat
 */
function getStatUnit(key: AggregateKey, useMetric: boolean): string {
    switch (key) {
        case 'totalDistanceMeters':
            return useMetric ? 'km' : 'mi';
        case 'totalMovingTimeSeconds':
            return '';
        case 'totalElevationGainMeters':
            return useMetric ? 'm' : 'ft';
        default:
            return '';
    }
}

/**
 * Gets the stat label for display
 */
function getStatLabel(key: AggregateKey): string {
    switch (key) {
        case 'totalDistanceMeters':
            return 'Distance';
        case 'totalMovingTimeSeconds':
            return 'Moving Time';
        case 'totalElevationGainMeters':
            return 'Elevation';
        default:
            return '';
    }
}

/**
 * Gets the emoji for a stat
 */
function getStatEmoji(key: AggregateKey): string {
    switch (key) {
        case 'totalDistanceMeters':
            return '📏';
        case 'totalMovingTimeSeconds':
            return '⏱️';
        case 'totalElevationGainMeters':
            return '⛰️';
        default:
            return '📊';
    }
}

function formatPace(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
    const totalSeconds = Math.round(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes}:${String(secs).padStart(2, '0')}`;
}

function buildDerivedStats(
    aggregates: FlyerAggregates,
    useMetric: boolean,
    group: ActivityGroup
): FlyerStatItem[] {
    const stats: FlyerStatItem[] = [];
    const distanceM = aggregates.totalDistanceMeters;
    const timeSec = aggregates.totalMovingTimeSeconds;
    const elevationM = aggregates.totalElevationGainMeters;

    if (distanceM > 0 && timeSec > 0) {
        const paceGroups = new Set<ActivityGroup>([
            'running',
            'trail-running',
            'walking',
            'hiking',
        ]);
        const speedGroups = new Set<ActivityGroup>([
            'cycling',
            'mountainBikeRide',
            'ski',
        ]);

        if (paceGroups.has(group)) {
            const perUnit = useMetric
                ? timeSec / Math.max(0.001, distanceM / 1000)
                : timeSec / Math.max(0.001, distanceM / 1609.344);
            stats.push({
                id: 'pace',
                label: 'Avg Pace',
                formattedValue: `${formatPace(perUnit)} ${useMetric ? '/km' : '/mi'}`,
                rawValue: perUnit,
                emoji: '⚡',
            });
        } else if (speedGroups.has(group)) {
            const hours = timeSec / 3600;
            const speed = useMetric
                ? (distanceM / 1000) / Math.max(0.01, hours)
                : (distanceM / 1609.344) / Math.max(0.01, hours);
            stats.push({
                id: 'speed',
                label: 'Avg Speed',
                formattedValue: `${num(speed, 1)} ${useMetric ? 'km/h' : 'mph'}`,
                rawValue: speed,
                emoji: '🚀',
            });
        }

        if (elevationM > 0 && distanceM >= 1000) {
            const density = useMetric
                ? elevationM / Math.max(0.001, distanceM / 1000)
                : (elevationM * 3.28084) / Math.max(0.001, distanceM / 1609.344);
            stats.push({
                id: 'climbDensity',
                label: 'Climb Density',
                formattedValue: `${num(density, 0)} ${useMetric ? 'm/km' : 'ft/mi'}`,
                rawValue: density,
                emoji: '⛰️',
            });
        }
    }

    return stats;
}

/**
 * Selects contextual stats for flyer display based on activity group
 * Uses centralized config from activityStatsConfig.ts
 */
export function selectFlyerStats(
    aggregates: FlyerAggregates,
    useMetric: boolean,
    group: ActivityGroup
): FlyerStatItem[] {
    const stats: FlyerStatItem[] = [];

    // Get contextual stats using centralized config
    const displayStats = getDisplayStatsForGroup(group, {
        distanceM: aggregates.totalDistanceMeters,
        movingTimeSec: aggregates.totalMovingTimeSeconds,
        elevationM: aggregates.totalElevationGainMeters,
    });

    // Mapping from AggregateKey to actual value
    const getValue = (key: AggregateKey): number => {
        switch (key) {
            case 'totalDistanceMeters':
                return aggregates.totalDistanceMeters;
            case 'totalMovingTimeSeconds':
                return aggregates.totalMovingTimeSeconds;
            case 'totalElevationGainMeters':
                return aggregates.totalElevationGainMeters;
            default:
                return 0;
        }
    };

    // Build stats from display config
    for (const statType of displayStats) {
        const key = statTypeToAggregateKey(statType);
        const value = getValue(key);
        
        const formattedValue = formatStatValue(key, value, useMetric);
        const unit = getStatUnit(key, useMetric);
        stats.push({
            id: key,
            label: getStatLabel(key),
            formattedValue: unit ? `${formattedValue} ${unit}` : formattedValue,
            rawValue: value,
            emoji: getStatEmoji(key),
        });
    }

    const derived = buildDerivedStats(aggregates, useMetric, group);
    return stats.concat(derived);
}

/**
 * Gets alignment-specific CSS class
 */
export function getAlignmentClass(alignment: FlyerAlignment): string {
    switch (alignment) {
        case 'left':
            return 'flyer-align-left';
        case 'right':
            return 'flyer-align-right';
        case 'bottom':
            return 'flyer-align-bottom';
        default:
            return 'flyer-align-left';
    }
}
