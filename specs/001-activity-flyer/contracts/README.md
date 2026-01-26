# API Contracts - Activity Flyer Feature

**Feature**: Contextual "Top Activity" Shareable Flyer (Phase 1)  
**Date**: 2026-01-25

## Overview

The activity flyer feature **does not introduce new API endpoints**. It reuses the existing recap API endpoint without modifications. This document describes how the existing API contract is consumed and transformed for flyer generation.

---

## Existing API Contract (Reused)

### GET `/api/recap`

**Purpose**: Fetch activity data for a specified time range

**Query Parameters**:
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `type` | string | No | Period type: `rolling` or `calendar` | `rolling` |
| `days` | integer | Conditional | Number of days (required if `type=rolling`) | `30` |
| `unit` | string | Conditional | Calendar unit: `month` or `year` (required if `type=calendar`) | `month` |
| `offset` | integer | No | Calendar offset (e.g., -1 for last year) | `-1` |

**Authentication**: HTTP-only cookies (access_token, provider)

**Response**: `RecapResponseDto`

```typescript
interface RecapResponseDto {
  /** Activity breakdown by type */
  breakdown: ActivityBreakdownDto[];
  
  /** Full list of activities in time range */
  activities: ActivitySummaryDto[];
  
  /** Highlights/achievements */
  highlights: RecapHighlightsDto;
  
  /** Time range metadata */
  range: {
    label: string;        // e.g., "Last 30 days"
    start: string;        // ISO 8601 UTC
    end: string;          // ISO 8601 UTC
  };
}

interface ActivityBreakdownDto {
  type: string;                    // Activity type (e.g., "Run", "Ride")
  count: number;                   // Number of activities
  totalDistanceMeters: number;     // Sum of distances
  totalMovingTimeSeconds: number;  // Sum of moving times
  totalElevationGainMeters: number;// Sum of elevation
}

interface ActivitySummaryDto {
  id: string;
  type: string;                    // Activity type
  startDate: string;               // ISO 8601 UTC
  distanceMeters: number;
  movingTimeSeconds: number;
  elevationGainMeters: number;
  // ... other fields (not used by flyer feature)
}

interface RecapHighlightsDto {
  // Not used by flyer feature
}
```

**HTTP Status Codes**:
- `200 OK`: Success
- `400 Bad Request`: Invalid time range (> 365 days)
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error

---

## Client-Side Transformation

The flyer feature transforms `RecapResponseDto` → `FlyerData` using the following steps:

### Step 1: Group Activities by Activity Group

```typescript
import { getActivityGroup } from '../utils/activityGroups';

// Group activities by flyer activity group
const groupedActivities = new Map<ActivityGroup, ActivitySummaryDto[]>();

for (const activity of recapResponse.activities) {
  const group = getActivityGroup(activity.type);
  
  if (!groupedActivities.has(group)) {
    groupedActivities.set(group, []);
  }
  
  groupedActivities.get(group)!.push(activity);
}
```

### Step 2: Determine Top Group

```typescript
import { determineTopGroup } from '../utils/activityGroups';

const topGroup = determineTopGroup(
  recapResponse.breakdown,
  recapResponse.activities
);
```

### Step 3: Compute Aggregates for Top Group

```typescript
const topGroupActivities = groupedActivities.get(topGroup) || [];

const aggregates: FlyerAggregates = {
  count: topGroupActivities.length,
  totalDistanceMeters: topGroupActivities.reduce((sum, a) => sum + a.distanceMeters, 0),
  totalMovingTimeSeconds: topGroupActivities.reduce((sum, a) => sum + a.movingTimeSeconds, 0),
  totalElevationGainMeters: topGroupActivities.reduce((sum, a) => sum + a.elevationGainMeters, 0),
  longestDistanceMeters: Math.max(...topGroupActivities.map(a => a.distanceMeters), 0),
  longestMovingTimeSeconds: Math.max(...topGroupActivities.map(a => a.movingTimeSeconds), 0),
  activeDays: new Set(topGroupActivities.map(a => a.startDate.split('T')[0])).size,
};
```

### Step 4: Select Statistics

```typescript
import { selectFlyerStats } from '../utils/flyerStats';

const selectedStats = selectFlyerStats(aggregates, unitPreference);
```

### Step 5: Construct FlyerData

```typescript
import { useAthleteProfile } from '../hooks/useAthleteProfile';

const { athleteProfile } = useAthleteProfile();

const flyerData: FlyerData = {
  athlete: {
    firstName: athleteProfile.firstName,
  },
  range: {
    label: recapResponse.range.label,
    startDate: recapResponse.range.start,
    endDate: recapResponse.range.end,
  },
  topGroup,
  aggregates,
  selectedStats,
};
```

---

## Data Contract Examples

### Example 1: Last 30 Days - Running Dominant

**Request**:
```
GET /api/recap?type=rolling&days=30
```

**Response** (simplified):
```json
{
  "breakdown": [
    { "type": "Run", "count": 12, "totalDistanceMeters": 96560, "totalMovingTimeSeconds": 21600, "totalElevationGainMeters": 450 },
    { "type": "Ride", "count": 5, "totalDistanceMeters": 120000, "totalMovingTimeSeconds": 18000, "totalElevationGainMeters": 800 },
    { "type": "Walk", "count": 3, "totalDistanceMeters": 8000, "totalMovingTimeSeconds": 5400, "totalElevationGainMeters": 50 }
  ],
  "activities": [ /* 20 activities total */ ],
  "highlights": { /* ... */ },
  "range": {
    "label": "Last 30 days",
    "start": "2025-12-26T00:00:00Z",
    "end": "2026-01-25T00:00:00Z"
  }
}
```

**Transformed FlyerData**:
```json
{
  "athlete": { "firstName": "John" },
  "range": {
    "label": "Last 30 days",
    "startDate": "2025-12-26T00:00:00Z",
    "endDate": "2026-01-25T00:00:00Z"
  },
  "topGroup": "running",
  "aggregates": {
    "count": 12,
    "totalDistanceMeters": 96560,
    "totalMovingTimeSeconds": 21600,
    "totalElevationGainMeters": 450,
    "longestDistanceMeters": 16000,
    "longestMovingTimeSeconds": 3600,
    "activeDays": 12
  },
  "selectedStats": [
    { "label": "Activities", "value": 12, "formattedValue": "12" },
    { "label": "Total Distance", "value": 96560, "formattedValue": "60.0 mi" },
    { "label": "Total Time", "value": 21600, "formattedValue": "6h 00m" },
    { "label": "Elevation Gain", "value": 450, "formattedValue": "1,476 ft" },
    { "label": "Longest Distance", "value": 16000, "formattedValue": "9.9 mi" }
  ]
}
```

**Flyer Rendering**:
- Background: `/flyer/tn/running.png`
- Header: "John's Insights" + "Last 30 days"
- Stats: 5 stats in semi-transparent cards
- Alignment: User-selected (default: right)

---

### Example 2: Tie-Breaking Scenario

**Request**:
```
GET /api/recap?type=calendar&unit=month
```

**Response** (simplified):
```json
{
  "breakdown": [
    { "type": "Run", "count": 8, "totalDistanceMeters": 64000, "totalMovingTimeSeconds": 14400, "totalElevationGainMeters": 300 },
    { "type": "Ride", "count": 8, "totalDistanceMeters": 96000, "totalMovingTimeSeconds": 12000, "totalElevationGainMeters": 600 }
  ],
  "activities": [
    { "id": "1", "type": "Run", "startDate": "2026-01-24T10:00:00Z", /* ... */ },
    { "id": "2", "type": "Ride", "startDate": "2026-01-20T10:00:00Z", /* ... */ },
    /* ... */
  ],
  "range": {
    "label": "This month",
    "start": "2026-01-01T00:00:00Z",
    "end": "2026-01-25T00:00:00Z"
  }
}
```

**Tie-Breaking Logic**:
1. Count: Both Running and Cycling have 8 activities → TIE
2. Most recent: Run has activity on 2026-01-24, Ride on 2026-01-20 → **Running wins**

**Transformed FlyerData**:
```json
{
  "topGroup": "running",
  "aggregates": { /* running stats */ },
  /* ... */
}
```

---

### Example 3: No Activities (Error Case)

**Request**:
```
GET /api/recap?type=rolling&days=7
```

**Response**:
```json
{
  "breakdown": [],
  "activities": [],
  "highlights": { /* empty */ },
  "range": {
    "label": "Last 7 days",
    "start": "2026-01-18T00:00:00Z",
    "end": "2026-01-25T00:00:00Z"
  }
}
```

**Client-Side Handling**:
```typescript
if (recapResponse.activities.length === 0) {
  throw new Error('NO_ACTIVITIES');
}
```

**UI State**: Show error message: "No activities found in the selected time range. Try a different period."

**"Create Flyer" Button**: Hidden or disabled on RecapPage when `activities.length === 0`

---

## Contract Guarantees

### Server-Side (Existing API)

✅ **Always returns** valid `RecapResponseDto` structure (200 OK)  
✅ **Validates** time range ≤ 365 days (400 if exceeded)  
✅ **Authenticates** via cookies (401 if missing/invalid)  
✅ **Provides** breakdown and activities for valid requests  
✅ **Accepts** empty activity lists (valid case)

### Client-Side (Flyer Feature)

✅ **Handles** empty activity lists gracefully (error state)  
✅ **Computes** top group deterministically (tie-breaking rules)  
✅ **Aggregates** statistics correctly (sum/max operations)  
✅ **Selects** 3-5 stats (dynamic based on non-zero values)  
✅ **Validates** flyer data before rendering  
✅ **Displays** user-friendly error messages for all failure modes

---

## Error Contracts

### Client-Side Error Handling

```typescript
try {
  const recapResponse = await fetch('/api/recap?' + params);
  
  if (!recapResponse.ok) {
    if (recapResponse.status === 400) {
      throw new Error('INVALID_PARAMS');
    }
    if (recapResponse.status === 401) {
      // Redirect to provider connect
      window.location.href = '/';
    }
    throw new Error('API_ERROR');
  }
  
  const data = await recapResponse.json();
  
  if (data.activities.length === 0) {
    throw new Error('NO_ACTIVITIES');
  }
  
  const flyerData = transformToFlyerData(data);
  const validationError = validateFlyerData(flyerData);
  
  if (validationError) {
    throw new Error(validationError);
  }
  
  return flyerData;
  
} catch (error) {
  // Map to FlyerError type and display appropriate message
}
```

---

## Performance Contracts

### Expected Response Times

| Metric | Target | Notes |
|--------|--------|-------|
| API response | < 1s | Recap API already optimized |
| Client transformation | < 100ms | Simple aggregation logic |
| Total flyer load time | < 2s | Includes API + render + background image |

### Data Size Limits

| Item | Limit | Reason |
|------|-------|--------|
| Activities per request | ~500 | Spec assumption (Phase 1) |
| Breakdown types | ~20 | Typical athlete variety |
| Response payload | ~500KB | JSON with activity summaries |

---

## Backward Compatibility

### API Changes (None)

✅ No breaking changes to recap API  
✅ Flyer feature is purely additive  
✅ Existing RecapPage functionality unchanged  
✅ Backend remains unaware of flyer feature

### Frontend Changes (Additive Only)

✅ New route `/flyer` (does not affect existing routes)  
✅ New "Create Flyer" button in RecapPage header (optional UI enhancement)  
✅ New utility functions (isolated, no impact on existing code)  
✅ New static assets (9 background images)

---

## Testing Contract

### API Contract Tests (Existing)

No new tests required - feature relies on existing recap API tests

### Client Transformation Tests (New)

```typescript
describe('Flyer Data Transformation', () => {
  it('should determine top group correctly', () => {
    const recapResponse = mockRecapResponse({ runCount: 10, rideCount: 5 });
    const topGroup = determineTopGroup(recapResponse.breakdown, recapResponse.activities);
    expect(topGroup).toBe('running');
  });
  
  it('should handle tie-breaking by most recent date', () => {
    const recapResponse = mockRecapResponse({
      runCount: 5,
      runMostRecent: '2026-01-24',
      rideCount: 5,
      rideMostRecent: '2026-01-20',
    });
    const topGroup = determineTopGroup(recapResponse.breakdown, recapResponse.activities);
    expect(topGroup).toBe('running');
  });
  
  it('should aggregate statistics correctly', () => {
    const activities = [
      { type: 'Run', distanceMeters: 5000, movingTimeSeconds: 1800, elevationGainMeters: 50 },
      { type: 'Run', distanceMeters: 10000, movingTimeSeconds: 3600, elevationGainMeters: 100 },
    ];
    const aggregates = computeAggregates(activities);
    expect(aggregates.totalDistanceMeters).toBe(15000);
    expect(aggregates.longestDistanceMeters).toBe(10000);
  });
  
  it('should select 3-5 stats dynamically', () => {
    const aggregates = { count: 5, totalDistanceMeters: 10000, totalMovingTimeSeconds: 3600, /* ... */ };
    const stats = selectFlyerStats(aggregates, 'miles');
    expect(stats.length).toBeGreaterThanOrEqual(3);
    expect(stats.length).toBeLessThanOrEqual(5);
  });
  
  it('should handle no activities gracefully', () => {
    const recapResponse = mockRecapResponse({ activities: [] });
    expect(() => transformToFlyerData(recapResponse)).toThrow('NO_ACTIVITIES');
  });
});
```

---

## Future Considerations

### Potential API Enhancements (Out of Scope Phase 1)

- Dedicated `/api/flyer` endpoint (pre-aggregated data)
- Server-side top group determination
- Caching layer for frequently requested time ranges
- Activity group metadata in API response

### Versioning Strategy

If API contract changes in future:
- Feature will continue to work with existing `/api/recap` structure
- New fields can be added without breaking changes
- Deprecated fields should be maintained for backward compatibility

---

## Summary

The flyer feature demonstrates **zero-backend-impact architecture** by:
1. Reusing existing recap API without modifications
2. Performing all transformations client-side
3. Maintaining full backward compatibility
4. Isolating new code to frontend-only components

This approach minimizes risk, accelerates development, and leverages existing infrastructure.

**Contract Status**: ✅ Complete - No new API contracts required
