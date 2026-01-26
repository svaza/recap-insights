/**
 * Activity group mapping utilities
 * Maps 55+ activity types to 9 flyer groups for themed backgrounds
 */

import type { ActivityGroup, ActivityGroupInfo } from '../models/flyer';

/**
 * Complete registry of all activity groups with metadata
 */
export const ACTIVITY_GROUP_REGISTRY: Record<ActivityGroup, ActivityGroupInfo> = {
    running: {
        id: 'running',
        label: 'Running',
        emoji: '🏃',
        backgroundPath: '/flyer/tn/running.png',
    },
    elliptical: {
        id: 'elliptical',
        label: 'Elliptical',
        emoji: '🏃‍♂️',
        backgroundPath: '/flyer/tn/elliptical.png',
    },
    'trail-running': {
        id: 'trail-running',
        label: 'Trail Running',
        emoji: '🏃‍♂️⛰️',
        backgroundPath: '/flyer/tn/trail-running.png',
    },
    indoor: {
        id: 'indoor',
        label: 'Indoor',
        emoji: '🏠',
        backgroundPath: '/flyer/tn/indoor.png',
    },
    cycling: {
        id: 'cycling',
        label: 'Cycling',
        emoji: '🚴',
        backgroundPath: '/flyer/tn/cycling.png',
    },
    ski: {
        id: 'ski',
        label: 'Ski',
        emoji: '⛷️',
        backgroundPath: '/flyer/tn/ski.png',
    },
    hiking: {
        id: 'hiking',
        label: 'Hiking',
        emoji: '🥾',
        backgroundPath: '/flyer/tn/hiking.png',
    },
    walking: {
        id: 'walking',
        label: 'Walking',
        emoji: '🚶',
        backgroundPath: '/flyer/tn/walking.png',
    },
    strengthtraining: {
        id: 'strengthtraining',
        label: 'Strength Training',
        emoji: '🏋️',
        backgroundPath: '/flyer/tn/strengthtraining.png',
    },
    highIntensityIntervalTraining: {
        id: 'highIntensityIntervalTraining',
        label: 'HIIT',
        emoji: '🔥',
        backgroundPath: '/flyer/tn/highIntensityIntervalTraining.png',
    },
    yoga: {
        id: 'yoga',
        label: 'Yoga',
        emoji: '🧘',
        backgroundPath: '/flyer/tn/yoga.png',
    },
    mountainBikeRide: {
        id: 'mountainBikeRide',
        label: 'Mountain Biking',
        emoji: '🚵',
        backgroundPath: '/flyer/tn/mountainBikeRide.png',
    },
    swim: {
        id: 'swim',
        label: 'Swimming',
        emoji: '🏊',
        backgroundPath: '/flyer/tn/swim.png',
    },
    openWaterSwim: {
        id: 'openWaterSwim',
        label: 'Open Water Swim',
        emoji: '🌊',
        backgroundPath: '/flyer/tn/openWaterSwim.png',
    },
    stairstepper: {
        id: 'stairstepper',
        label: 'Stair Stepper',
        emoji: '🪜',
        backgroundPath: '/flyer/tn/stairstepper.png',
    },
    workout: {
        id: 'workout',
        label: 'Workout',
        emoji: '💪',
        backgroundPath: '/flyer/tn/workout.png',
    },
};

/**
 * Maps activity types to their corresponding flyer group
 * Source activity types from existing activityTypes.ts
 */
export const ACTIVITY_TYPE_TO_GROUP_MAP: Record<string, ActivityGroup> = {
    // Running group (road/treadmill running)
    Run: 'running',
    VirtualRun: 'running',

    // Trail Running group (distinct from road running)
    TrailRun: 'trail-running',

    // Elliptical
    Elliptical: 'elliptical',

    // Stair Stepper
    StairStepper: 'stairstepper',

    // Indoor group (virtual activities)
    VirtualRide: 'indoor',
    VirtualRow: 'indoor',

    // Cycling group (road bikes)
    Ride: 'cycling',
    EBikeRide: 'cycling',
    Handcycle: 'cycling',
    Velomobile: 'cycling',

    // Mountain Biking (separate from road cycling)
    MountainBikeRide: 'mountainBikeRide',
    EMountainBikeRide: 'mountainBikeRide',
    GravelRide: 'mountainBikeRide',

    // Ski group (winter snow sports)
    AlpineSki: 'ski',
    BackcountrySki: 'ski',
    NordicSki: 'ski',
    RollerSki: 'ski',
    Snowboard: 'ski',
    Snowshoe: 'ski',

    // Hiking group
    Hike: 'hiking',

    // Walking group
    Walk: 'walking',

    // Strength Training group
    WeightTraining: 'strengthtraining',
    StrengthTraining: 'strengthtraining',
    Crossfit: 'strengthtraining',

    // HIIT
    HighIntensityIntervalTraining: 'highIntensityIntervalTraining',

    // Yoga
    Yoga: 'yoga',

    // Swimming
    Swim: 'swim',
    OpenWaterSwim: 'openWaterSwim',

    // Workout group (catchall for everything else)
    Workout: 'workout',
    Pilates: 'workout',
    Rowing: 'workout',
    Canoeing: 'workout',
    Kayaking: 'workout',
    StandUpPaddling: 'workout',
    Surfing: 'workout',
    Kitesurf: 'workout',
    Windsurf: 'workout',
    Sail: 'workout',
    IceSkate: 'workout',
    InlineSkate: 'workout',
    Skateboard: 'workout',
    RockClimbing: 'workout',
    Golf: 'workout',
    Soccer: 'workout',
    Rugby: 'workout',
    Tennis: 'workout',
    Badminton: 'workout',
    Squash: 'workout',
    Racquetball: 'workout',
    Pickleball: 'workout',
    Padel: 'workout',
    TableTennis: 'workout',
    Wheelchair: 'workout',
    WaterSport: 'workout',
    Transition: 'workout',
    Other: 'workout',
};

/**
 * Gets the activity group for a given activity type
 * Returns 'workout' as fallback for unknown types
 */
export function getActivityGroup(activityType: string): ActivityGroup {
    return ACTIVITY_TYPE_TO_GROUP_MAP[activityType] ?? 'workout';
}

/**
 * Gets the activity group info (metadata) for a given group ID
 * Returns workout group info as fallback for invalid IDs
 */
export function getActivityGroupInfo(groupId: string): ActivityGroupInfo {
    if (isValidActivityGroup(groupId)) {
        return ACTIVITY_GROUP_REGISTRY[groupId];
    }
    return ACTIVITY_GROUP_REGISTRY.workout;
}

/**
 * Type guard to check if a string is a valid ActivityGroup
 */
export function isValidActivityGroup(value: string): value is ActivityGroup {
    return value in ACTIVITY_GROUP_REGISTRY;
}

/**
 * Gets all activity group IDs
 */
export function getAllActivityGroups(): ActivityGroup[] {
    return Object.keys(ACTIVITY_GROUP_REGISTRY) as ActivityGroup[];
}

/**
 * Gets the background image URL for a given activity group
 */
export function getGroupBackgroundUrl(groupId: ActivityGroup): string {
    return ACTIVITY_GROUP_REGISTRY[groupId]?.backgroundPath ?? ACTIVITY_GROUP_REGISTRY.workout.backgroundPath;
}
