# Phase 1: Data Model - Activity Flyer Feature

**Feature**: Contextual "Top Activity" Shareable Flyer (Phase 1)  
**Date**: 2026-01-25  
**Status**: Complete

## Overview

This document defines all TypeScript interfaces, types, and data structures for the flyer feature. The feature is **frontend-only** and reuses existing backend APIs without modifications.

---

## Core Entities

### Activity Group

Represents one of 9 thematic activity categories for flyer backgrounds.

```typescript
/**
 * Activity group identifiers matching background image filenames
 */
export type ActivityGroup =
  | 'running'
  | 'trail-running'
  | 'indoor'
  | 'cycling'
  | 'ski'
  | 'hiking'
  | 'walking'
  | 'strengthtraining'
  | 'workout';

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
  
  /** Priority for tie-breaking (lower number = higher priority) */
  priority: number;
}

/**
 * Complete registry of all activity groups
 */
export const ACTIVITY_GROUP_REGISTRY: Record<ActivityGroup, ActivityGroupInfo> = {
  running: {
    id: 'running',
    label: 'Running',
    emoji: '🏃',
    backgroundPath: '/flyer/tn/running.png',
    priority: 1,
  },
  cycling: {
    id: 'cycling',
    label: 'Cycling',
    emoji: '🚴',
    backgroundPath: '/flyer/tn/cycling.png',
    priority: 2,
  },
  ski: {
    id: 'ski',
    label: 'Ski',
    emoji: '⛷️',
    backgroundPath: '/flyer/tn/ski.png',
    priority: 3,
  },
  'trail-running': {
    id: 'trail-running',
    label: 'Trail Running',
    emoji: '🏃⛰️',
    backgroundPath: '/flyer/tn/trail-running.png',
    priority: 4,
  },
  hiking: {
    id: 'hiking',
    label: 'Hiking',
    emoji: '🥾',
    backgroundPath: '/flyer/tn/hiking.png',
    priority: 5,
  },
  walking: {
    id: 'walking',
    label: 'Walking',
    emoji: '🚶',
    backgroundPath: '/flyer/tn/walking.png',
    priority: 6,
  },
  strengthtraining: {
    id: 'strengthtraining',
    label: 'Strength Training',
    emoji: '🏋️',
    backgroundPath: '/flyer/tn/strengthtraining.png',
    priority: 7,
  },
  indoor: {
    id: 'indoor',
    label: 'Indoor',
    emoji: '🏠',
    backgroundPath: '/flyer/tn/indoor.png',
    priority: 8,
  },
  workout: {
    id: 'workout',
    label: 'Workout',
    emoji: '💪',
    backgroundPath: '/flyer/tn/workout.png',
    priority: 9,
  },
};
```

**Validation Rules**:
- Group IDs must match background image filenames (lowercase, hyphenated)
- Priority must be unique and sequential 1-9
- Background paths must be valid public asset paths

**Relationships**:
- One activity group maps to many activity types (see Activity Group Mapping)
- One activity group has one background image

---

### Activity Group Mapping

Maps Strava/Intervals.icu activity types to the 9 flyer groups.

```typescript
/**
 * Maps activity types to their corresponding group
 * Source activity types from existing activityTypes.ts
 */
export const ACTIVITY_TYPE_TO_GROUP_MAP: Record<string, ActivityGroup> = {
  // Running group
  Run: 'running',
  VirtualRun: 'running',
  
  // Trail Running group (distinct from road running)
  TrailRun: 'trail-running',
  
  // Indoor group (non-outdoor cardio equipment)
  Elliptical: 'indoor',
  StairStepper: 'indoor',
  VirtualRide: 'indoor',
  VirtualRow: 'indoor',
  
  // Cycling group (all bike types)
  Ride: 'cycling',
  GravelRide: 'cycling',
  MountainBikeRide: 'cycling',
  EBikeRide: 'cycling',
  EMountainBikeRide: 'cycling',
  Handcycle: 'cycling',
  Velomobile: 'cycling',
  
  // Ski group (winter sports)
  AlpineSki: 'ski',
  BackcountrySki: 'ski',
  NordicSki: 'ski',
  RollerSki: 'ski',
  Snowboard: 'ski',
  Snowshoe: 'ski',
  IceSkate: 'ski',
  
  // Hiking group
  Hike: 'hiking',
  
  // Walking group
  Walk: 'walking',
  
  // Strength Training group
  WeightTraining: 'strengthtraining',
  Crossfit: 'strengthtraining',
  HighIntensityIntervalTraining: 'strengthtraining',
  
  // Workout catchall (everything else)
  Workout: 'workout',
  Yoga: 'workout',
  Pilates: 'workout',
  Swim: 'workout',
  OpenWaterSwim: 'workout',
  Rowing: 'workout',
  Kayaking: 'workout',
  Canoeing: 'workout',
  StandUpPaddling: 'workout',
  Surfing: 'workout',
  Kitesurf: 'workout',
  Windsurf: 'workout',
  WaterSport: 'workout',
  InlineSkate: 'workout',
  Skateboard: 'workout',
  RockClimbing: 'workout',
  Golf: 'workout',
  Tennis: 'workout',
  TableTennis: 'workout',
  Badminton: 'workout',
  Pickleball: 'workout',
  Padel: 'workout',
  Racquetball: 'workout',
  Squash: 'workout',
  Soccer: 'workout',
  Rugby: 'workout',
  Sail: 'workout',
  Wheelchair: 'workout',
  Transition: 'workout',
  Other: 'workout',
};

/**
 * Get the activity group for a given activity type
 * @param activityType - The Strava/Intervals.icu activity type
 * @returns The corresponding activity group (defaults to 'workout' if not found)
 */
export function getActivityGroup(activityType: string): ActivityGroup {
  return ACTIVITY_TYPE_TO_GROUP_MAP[activityType] ?? 'workout';
}
```

**Validation Rules**:
- All activity types from `activityTypes.ts` must be mapped
- Each activity type maps to exactly one group
- Unknown/new types default to 'workout' group

---

### Flyer Data

Computed data for rendering a flyer, derived from recap API response.

```typescript
/**
 * Complete data needed to render a flyer
 * Computed from RecapResponseDto (existing API response)
 */
export interface FlyerData {
  /** Athlete information */
  athlete: {
    firstName: string;
  };
  
  /** Time range metadata */
  range: {
    label: string;        // e.g., "Last 30 days"
    startDate: string;    // ISO 8601
    endDate: string;      // ISO 8601
  };
  
  /** Top activity group determined by count */
  topGroup: ActivityGroup;
  
  /** Aggregated statistics for the top group */
  aggregates: FlyerAggregates;
  
  /** Selected statistics to display (3-5 items) */
  selectedStats: FlyerStatItem[];
}

/**
 * Aggregated statistics for the top activity group
 * Computed by filtering RecapResponseDto breakdown by group
 */
export interface FlyerAggregates {
  /** Total number of activities in group */
  count: number;
  
  /** Sum of distances in meters */
  totalDistanceMeters: number;
  
  /** Sum of moving times in seconds */
  totalMovingTimeSeconds: number;
  
  /** Sum of elevation gains in meters */
  totalElevationGainMeters: number;
  
  /** Maximum single activity distance in meters */
  longestDistanceMeters: number;
  
  /** Maximum single activity duration in seconds */
  longestMovingTimeSeconds: number;
  
  /** Number of unique calendar days with activities */
  activeDays: number;
}

/**
 * A single statistic to display on the flyer
 */
export interface FlyerStatItem {
  /** Display label (e.g., "Total Distance", "Activities") */
  label: string;
  
  /** Raw numeric value */
  value: number;
  
  /** Formatted display value (e.g., "24.5 mi", "3h 45m") */
  formattedValue: string;
}
```

**Computation Logic**:
- `topGroup`: Determined by counting activities per group, tie-breaking by most recent date → total duration → priority
- `aggregates`: Sum/max operations on activities filtered by top group
- `selectedStats`: First 3-5 non-zero stats from priority-ordered list (see research.md #4)

**State Transitions**:
1. Initial: null (before API call)
2. Loading: undefined (API call in progress)
3. Loaded: FlyerData object (API success)
4. Error: Error object (API failure)

---

### Alignment Configuration

Controls where statistics are overlaid on the background image.

```typescript
/**
 * Stats overlay alignment options
 */
export type FlyerAlignment = 'left' | 'right' | 'bottom';

/**
 * Alignment metadata for rendering
 */
export interface FlyerAlignmentConfig {
  /** Alignment identifier */
  id: FlyerAlignment;
  
  /** Human-readable label for UI */
  label: string;
  
  /** Icon or emoji for selector button */
  icon: string;
  
  /** CSS class applied to stats container */
  cssClass: string;
  
  /** Flex direction for stats layout */
  flexDirection: 'column' | 'row';
}

/**
 * Registry of alignment configurations
 */
export const ALIGNMENT_CONFIGS: Record<FlyerAlignment, FlyerAlignmentConfig> = {
  left: {
    id: 'left',
    label: 'Left',
    icon: '⬅️',
    cssClass: 'stats-left',
    flexDirection: 'column',
  },
  right: {
    id: 'right',
    label: 'Right',
    icon: '➡️',
    cssClass: 'stats-right',
    flexDirection: 'column',
  },
  bottom: {
    id: 'bottom',
    label: 'Bottom',
    icon: '⬇️',
    cssClass: 'stats-bottom',
    flexDirection: 'row',
  },
};
```

**Default**: `right` (most visually balanced for typical backgrounds)

---

## Derived Data & Computations

### Top Group Determination

Algorithm to determine the top activity group from breakdown data.

```typescript
/**
 * Candidate group with tie-breaking metadata
 */
interface GroupCandidate {
  group: ActivityGroup;
  count: number;
  mostRecentDate: Date;
  totalDuration: number;
  priority: number;
}

/**
 * Determine the top activity group from recap breakdown
 * @param breakdown - Activity breakdown from RecapResponseDto
 * @param activities - Full activity list for date/duration lookups
 * @returns The top activity group
 */
export function determineTopGroup(
  breakdown: ActivityBreakdownDto[],
  activities: ActivitySummaryDto[]
): ActivityGroup {
  // Step 1: Group activities by activity group
  const groupCounts = new Map<ActivityGroup, GroupCandidate>();
  
  for (const activity of activities) {
    const group = getActivityGroup(activity.type);
    
    if (!groupCounts.has(group)) {
      groupCounts.set(group, {
        group,
        count: 0,
        mostRecentDate: new Date(activity.startDate),
        totalDuration: 0,
        priority: ACTIVITY_GROUP_REGISTRY[group].priority,
      });
    }
    
    const candidate = groupCounts.get(group)!;
    candidate.count++;
    candidate.totalDuration += activity.movingTimeSeconds;
    
    const activityDate = new Date(activity.startDate);
    if (activityDate > candidate.mostRecentDate) {
      candidate.mostRecentDate = activityDate;
    }
  }
  
  // Step 2: Find max count
  const candidates = Array.from(groupCounts.values());
  const maxCount = Math.max(...candidates.map(c => c.count));
  
  // Step 3: Tie-breaking
  const tied = candidates.filter(c => c.count === maxCount);
  
  if (tied.length === 1) {
    return tied[0].group;
  }
  
  // Tier 1: Most recent activity date
  const mostRecent = new Date(Math.max(...tied.map(c => c.mostRecentDate.getTime())));
  const tier1 = tied.filter(c => c.mostRecentDate.getTime() === mostRecent.getTime());
  
  if (tier1.length === 1) {
    return tier1[0].group;
  }
  
  // Tier 2: Highest total duration
  const maxDuration = Math.max(...tier1.map(c => c.totalDuration));
  const tier2 = tier1.filter(c => c.totalDuration === maxDuration);
  
  if (tier2.length === 1) {
    return tier2[0].group;
  }
  
  // Tier 3: Fixed priority order
  tier2.sort((a, b) => a.priority - b.priority);
  return tier2[0].group;
}
```

**Tie-Breaking Rules** (spec FR-003):
1. Count (highest wins)
2. Most recent activity date (latest wins)
3. Total duration (longest wins)
4. Fixed priority order (see ACTIVITY_GROUP_REGISTRY.priority)

---

### Stats Selection

Algorithm to select 3-5 statistics from available aggregates.

```typescript
/**
 * Select 3-5 statistics to display on the flyer
 * @param aggregates - Computed aggregates for top group
 * @param unitPreference - User's distance unit preference
 * @returns Array of 3-5 stat items
 */
export function selectFlyerStats(
  aggregates: FlyerAggregates,
  unitPreference: 'miles' | 'kilometers'
): FlyerStatItem[] {
  // Priority-ordered stat definitions
  const allStats: FlyerStatItem[] = [
    {
      label: 'Activities',
      value: aggregates.count,
      formattedValue: aggregates.count.toString(),
    },
    {
      label: 'Total Distance',
      value: aggregates.totalDistanceMeters,
      formattedValue: formatDistance(aggregates.totalDistanceMeters, unitPreference),
    },
    {
      label: 'Total Time',
      value: aggregates.totalMovingTimeSeconds,
      formattedValue: formatDuration(aggregates.totalMovingTimeSeconds),
    },
    {
      label: 'Elevation Gain',
      value: aggregates.totalElevationGainMeters,
      formattedValue: formatElevation(aggregates.totalElevationGainMeters, unitPreference),
    },
    {
      label: 'Longest Distance',
      value: aggregates.longestDistanceMeters,
      formattedValue: formatDistance(aggregates.longestDistanceMeters, unitPreference),
    },
    {
      label: 'Longest Time',
      value: aggregates.longestMovingTimeSeconds,
      formattedValue: formatDuration(aggregates.longestMovingTimeSeconds),
    },
    {
      label: 'Active Days',
      value: aggregates.activeDays,
      formattedValue: aggregates.activeDays.toString(),
    },
  ];
  
  // Filter to non-zero values
  const nonZero = allStats.filter(s => s.value > 0);
  
  // Take up to 5
  const selected = nonZero.slice(0, 5);
  
  // Pad to minimum 3 with zeros if needed
  while (selected.length < 3 && allStats.length > selected.length) {
    selected.push(allStats[selected.length]);
  }
  
  return selected;
}
```

**Selection Rules** (spec FR-007b):
- Show all non-zero stats up to maximum of 5
- Minimum of 3 stats (pad with zero-value metrics if needed)
- Priority order: count > total distance > total time > elevation > longest distance > longest time > active days

---

## Component Props

### FlyerPage Component

```typescript
/**
 * Props for FlyerPage (route component)
 * No props - reads from URL search params
 */
export interface FlyerPageProps {}
```

### FlyerGenerator Component

```typescript
/**
 * Props for FlyerGenerator (main flyer rendering component)
 */
export interface FlyerGeneratorProps {
  /** Flyer data to render */
  data: FlyerData;
  
  /** Stats overlay alignment */
  alignment: FlyerAlignment;
  
  /** Ref for PNG export (html-to-image target) */
  exportRef?: React.RefObject<HTMLDivElement>;
}
```

### FlyerStats Component

```typescript
/**
 * Props for FlyerStats (stats overlay component)
 */
export interface FlyerStatsProps {
  /** Statistics to display */
  stats: FlyerStatItem[];
  
  /** Alignment configuration */
  alignment: FlyerAlignment;
}
```

### AlignmentSelector Component

```typescript
/**
 * Props for AlignmentSelector (alignment picker UI)
 */
export interface AlignmentSelectorProps {
  /** Current alignment */
  value: FlyerAlignment;
  
  /** Callback when alignment changes */
  onChange: (alignment: FlyerAlignment) => void;
}
```

---

## API Contracts

### Reused Existing Endpoints

**No new API endpoints** - Feature reuses existing recap API:

**GET** `/api/recap?type={type}&days={days}&unit={unit}&offset={offset}`

**Response**: `RecapResponseDto` (existing)
```typescript
interface RecapResponseDto {
  breakdown: ActivityBreakdownDto[];
  activities: ActivitySummaryDto[];
  highlights: RecapHighlightsDto;
  range: {
    label: string;
    start: string;
    end: string;
  };
}
```

**Transformation**: FlyerPage consumes `RecapResponseDto` and transforms to `FlyerData` client-side using:
1. `determineTopGroup(breakdown, activities)` → `topGroup`
2. Filter `activities` by `topGroup` → aggregate metrics → `aggregates`
3. `selectFlyerStats(aggregates, unitPref)` → `selectedStats`

---

## Data Flow Diagram

```
User clicks "Create Flyer" in RecapPage
  ↓
Navigate to /flyer?type=rolling&days=30
  ↓
FlyerPage component mounts
  ↓
useFlyerData() hook reads URL params
  ↓
Fetch /api/recap (existing endpoint)
  ↓
Receive RecapResponseDto
  ↓
Transform to FlyerData:
  - determineTopGroup() → topGroup
  - filterByGroup() + aggregate() → aggregates
  - selectFlyerStats() → selectedStats
  ↓
Render FlyerGenerator with FlyerData
  ↓
Load background image: /flyer/tn/{topGroup}.png
  ↓
Overlay FlyerStats component with alignment
  ↓
User selects alignment (updates local state)
  ↓
User clicks "Download PNG"
  ↓
html-to-image.toPng(exportRef.current)
  ↓
Trigger browser download: {firstName}_{topGroup}_{range}.png
```

---

## Validation & Error Handling

### Client-Side Validations

```typescript
/**
 * Validate flyer data completeness
 */
export function validateFlyerData(data: Partial<FlyerData>): string | null {
  if (!data.athlete?.firstName) {
    return 'Athlete name is required';
  }
  
  if (!data.topGroup) {
    return 'No activities found in the selected time range';
  }
  
  if (!data.aggregates || data.aggregates.count === 0) {
    return 'No activities in the top group';
  }
  
  if (!data.selectedStats || data.selectedStats.length < 3) {
    return 'Insufficient statistics for flyer';
  }
  
  return null; // Valid
}
```

### Error States

```typescript
/**
 * Flyer page error states
 */
export type FlyerError =
  | 'NO_ACTIVITIES'          // No activities in time range
  | 'API_ERROR'              // Recap API failed
  | 'IMAGE_LOAD_ERROR'       // Background image failed to load
  | 'EXPORT_ERROR'           // PNG generation failed
  | 'INVALID_PARAMS';        // Invalid URL parameters

/**
 * Error messages for user display
 */
export const FLYER_ERROR_MESSAGES: Record<FlyerError, string> = {
  NO_ACTIVITIES: 'No activities found in the selected time range. Try a different period.',
  API_ERROR: 'Failed to load activity data. Please try again.',
  IMAGE_LOAD_ERROR: 'Failed to load background image. Please try again.',
  EXPORT_ERROR: 'Failed to generate PNG. Please try again.',
  INVALID_PARAMS: 'Invalid time range parameters. Please start from the recap page.',
};
```

---

## File Organization

```
strava-recap/src/
├── models/
│   └── flyer.ts                 # FlyerData, FlyerAggregates, FlyerStatItem
├── utils/
│   ├── activityGroups.ts        # ActivityGroup, mapping, determineTopGroup()
│   ├── flyerStats.ts            # selectFlyerStats(), stat formatting
│   └── flyerExport.ts           # PNG download utilities
├── hooks/
│   └── useFlyerData.ts          # Hook to fetch and transform recap data
├── pages/
│   └── FlyerPage.tsx            # Main flyer page component
├── components/
│   └── FlyerGenerator.tsx       # Flyer rendering component
└── ui/
    ├── FlyerStats.tsx           # Stats overlay component
    └── AlignmentSelector.tsx    # Alignment picker component
```

---

## Next Steps

✅ **Phase 0**: Research complete  
✅ **Phase 1**: Data model complete  
🔄 **Next**: Create API contracts documentation (contracts/)  
⏭️ **Then**: Create quickstart guide (quickstart.md)  
⏭️ **Finally**: Update agent context (.github/copilot-instructions.md)
