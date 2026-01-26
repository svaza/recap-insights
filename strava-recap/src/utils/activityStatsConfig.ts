/**
 * Centralized configuration for activity stats display
 * Used by both RecapPage breakdown and Flyer generator
 */

import type { ActivityGroup } from '../models/flyer';

/**
 * Stats that can be displayed for an activity
 */
export type StatType = 'distance' | 'time' | 'elevation';

/**
 * Configuration for which stats to show for an activity group
 */
export interface ActivityStatsConfig {
    /** Stats to display in order of priority */
    stats: StatType[];
    /** Minimum elevation (meters) to show elevation stat */
    elevationThreshold?: number;
}

/**
 * Configuration mapping activity groups to their display stats
 * This is the single source of truth for what stats to show
 */
export const ACTIVITY_GROUP_STATS_CONFIG: Record<ActivityGroup, ActivityStatsConfig> = {
    // Distance-based with elevation
    'running': { stats: ['distance', 'time', 'elevation'], elevationThreshold: 50 },
    'trail-running': { stats: ['distance', 'time', 'elevation'], elevationThreshold: 50 },
    'cycling': { stats: ['distance', 'time', 'elevation'], elevationThreshold: 50 },
    'mountainBikeRide': { stats: ['distance', 'time', 'elevation'], elevationThreshold: 50 },
    'hiking': { stats: ['distance', 'time', 'elevation'], elevationThreshold: 50 },

    // Distance-based without elevation
    'walking': { stats: ['distance', 'time'] },
    'swim': { stats: ['distance', 'time'] },
    'openWaterSwim': { stats: ['distance', 'time'] },
    'ski': { stats: ['distance', 'time'] },
    'indoor': { stats: ['distance', 'time'] },
    'elliptical': { stats: ['distance', 'time'] },
    'stairstepper': { stats: ['distance', 'time'] },

    // Time-only activities
    'workout': { stats: ['time'] },
    'strengthtraining': { stats: ['time'] },
    'highIntensityIntervalTraining': { stats: ['time'] },
    'yoga': { stats: ['time'] },
};

/**
 * Activity type patterns for detecting activity categories
 * Used when we have raw activity type strings (e.g., "Run", "TrailRun")
 */
const DISTANCE_TYPE_PATTERNS = [
    'run', 'ride', 'walk', 'hike', 'swim', 'row', 'ski', 'snowboard'
];

const TIME_ONLY_TYPE_PATTERNS = [
    'workout', 'strength', 'weight', 'hiit', 'yoga', 'pilates'
];

const ELEVATION_TYPE_PATTERNS = [
    'hike', 'trail', 'run', 'ride'
];

/**
 * Checks if an activity type is distance-based (by raw type string)
 */
export function isDistanceType(typeRaw: string): boolean {
    const t = (typeRaw || '').toLowerCase();
    return DISTANCE_TYPE_PATTERNS.some(pattern => t.includes(pattern));
}

/**
 * Checks if an activity type is time-only (by raw type string)
 */
export function isTimeOnlyType(typeRaw: string): boolean {
    const t = (typeRaw || '').toLowerCase();
    return TIME_ONLY_TYPE_PATTERNS.some(pattern => t.includes(pattern));
}

/**
 * Checks if elevation should be shown for an activity type
 */
export function shouldShowElevation(typeRaw: string, elevationM: number): boolean {
    const t = (typeRaw || '').toLowerCase();
    const meaningful = elevationM >= 50;
    return meaningful && ELEVATION_TYPE_PATTERNS.some(pattern => t.includes(pattern));
}

/**
 * Gets the stats config for an activity group
 */
export function getStatsConfigForGroup(group: ActivityGroup): ActivityStatsConfig {
    return ACTIVITY_GROUP_STATS_CONFIG[group] || { stats: ['time'] };
}

/**
 * Gets the list of stats to display for a group, considering actual values
 */
export function getDisplayStatsForGroup(
    group: ActivityGroup,
    data: { distanceM: number; movingTimeSec: number; elevationM: number }
): StatType[] {
    const config = getStatsConfigForGroup(group);
    const result: StatType[] = [];

    for (const stat of config.stats) {
        if (stat === 'distance' && data.distanceM > 0) {
            result.push('distance');
        } else if (stat === 'time' && data.movingTimeSec > 0) {
            result.push('time');
        } else if (stat === 'elevation') {
            const threshold = config.elevationThreshold ?? 0;
            if (data.elevationM >= threshold) {
                result.push('elevation');
            }
        }
    }

    // Always show at least time if we have it
    if (result.length === 0 && data.movingTimeSec > 0) {
        result.push('time');
    }

    return result;
}

/**
 * Gets the list of stats to display for a raw activity type string
 * Used when we don't have the activity group resolved
 */
export function getDisplayStatsForType(
    typeRaw: string,
    data: { distanceM: number; movingTimeSec: number; elevationM: number }
): StatType[] {
    // Time-only activities
    if (isTimeOnlyType(typeRaw)) {
        return data.movingTimeSec > 0 ? ['time'] : [];
    }

    // Distance-based activities
    if (isDistanceType(typeRaw) && data.distanceM > 0) {
        const stats: StatType[] = ['distance', 'time'];
        if (shouldShowElevation(typeRaw, data.elevationM)) {
            stats.push('elevation');
        }
        return stats;
    }

    // Fallback: show distance if available, otherwise time
    if (data.distanceM > 0) {
        return ['distance'];
    }
    return data.movingTimeSec > 0 ? ['time'] : [];
}
