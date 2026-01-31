/**
 * Flyer feature type definitions
 * Used for generating themed activity flyers from recap data
 */

/**
 * Activity group identifiers matching background image filenames
 */
export type ActivityGroup =
    | 'running'
    | 'elliptical'
    | 'trail-running'
    | 'indoor'
    | 'cycling'
    | 'ski'
    | 'hiking'
    | 'walking'
    | 'strengthtraining'
    | 'highIntensityIntervalTraining'
    | 'yoga'
    | 'mountainBikeRide'
    | 'swim'
    | 'openWaterSwim'
    | 'stairstepper'
    | 'workout';

/**
 * Stats alignment options for flyer layout
 */
export type FlyerAlignment = 'left' | 'right' | 'bottom';

/**
 * Metadata for each activity group
 */
export interface ActivityGroupInfo {
    /** Group identifier (used in image paths and filenames) */
    id: ActivityGroup;

    /** Human-readable display name */
    label: string;

    /** Emoji representation */
    emoji: string;

    /** Background image path relative to public/ */
    backgroundPath: string;
}

/**
 * Aggregated statistics for a flyer
 */
export interface FlyerAggregates {
    /** Total number of activities */
    count: number;

    /** Total distance in meters */
    totalDistanceMeters: number;

    /** Total moving time in seconds */
    totalMovingTimeSeconds: number;

    /** Total elevation gain in meters */
    totalElevationGainMeters: number;

    /** Longest single activity distance in meters */
    longestDistanceMeters: number;

    /** Longest single activity moving time in seconds */
    longestMovingTimeSeconds: number;

    /** Number of distinct calendar days with activities */
    activeDays: number;
}

/**
 * Best effort activity highlight
 */
export interface BestEffort {
    /** Type of best effort: 'longest' (by time) or 'farthest' (by distance) */
    type: 'longest' | 'farthest';

    /** Activity name */
    name: string;

    /** Activity type (e.g., 'Run', 'Ride') */
    activityType: string;

    /** Formatted distance value */
    formattedDistance: string;

    /** Formatted time value */
    formattedTime: string;

    /** Label describing the best effort */
    label: string;
}

/**
 * Single statistic item to display on flyer
 */
export interface FlyerStatItem {
    /** Unique identifier for the stat */
    id: string;

    /** Display label (e.g., "Distance", "Time") */
    label: string;

    /** Formatted value with units (e.g., "42.1 km", "3h 15m") */
    formattedValue: string;

    /** Raw numeric value for sorting/comparison */
    rawValue: number;

    /** Emoji icon for the stat */
    emoji: string;
}

/**
 * Complete data needed to render a flyer
 */
export interface FlyerData {
    /** The activity group for theming */
    group: ActivityGroup;

    /** Group metadata (label, emoji, background path) */
    groupInfo: ActivityGroupInfo;

    /** Athlete's first name */
    athleteFirstName: string;

    /** Date range label (e.g., "Jan 01, 2026 – Jan 25, 2026") */
    rangeLabel: string;

    /** Dynamic tagline based on period (e.g., "30 Day Running Recap") */
    tagline: string;

    /** Time range description (e.g., "Last 30 days") */
    rangeTitle: string;

    /** Aggregated statistics */
    aggregates: FlyerAggregates;

    /** Selected stats to display (3-5 items) */
    stats: FlyerStatItem[];

    /** Optional best effort highlight for this activity group */
    bestEffort?: BestEffort;

    /** Total number of active days in the period */
    activeDaysCount: number;

    /** Longest consecutive streak of active days */
    longestStreak: number;
}

/**
 * Error types for flyer generation
 */
export type FlyerErrorType =
    | 'no-activities'
    | 'invalid-group'
    | 'not-connected'
    | 'api-error'
    | 'export-error'
    | 'image-load-error';

/**
 * Flyer error with type and message
 */
export interface FlyerError {
    type: FlyerErrorType;
    message: string;
}

/**
 * User-friendly error messages
 */
export const FLYER_ERROR_MESSAGES: Record<FlyerErrorType, string> = {
    'no-activities': 'No activities found for this group in the selected time range.',
    'invalid-group': 'Invalid activity group. Using default theme.',
    'not-connected': 'Connect a provider to generate your flyer.',
    'api-error': 'Failed to load activity data. Please try again.',
    'export-error': 'Failed to generate PNG. Please try again.',
    'image-load-error': 'Failed to load background image. Using fallback.',
};
