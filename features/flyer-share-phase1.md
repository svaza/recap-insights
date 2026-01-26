# Feature Spec: Contextual “Top Activity” Shareable Flyer (Phase 1)

## Summary
Generate exactly one shareable flyer for an athlete, themed to the athlete’s **Top Activity category** (by activity count) within the selected time range (max 1 year). The server returns **pre-aggregated JSON** and the UI renders the flyer **client-side only** using prebuilt templates + overlays the values.

Output: a **rendered flyer preview in the UI** + a **downloadable PNG** suitable for social media sharing.

---

## Goals
1. Produce **one** flyer per athlete per selected time range, for the **Top Activity** category by count.
2. Flyer theme (background + styling) is based on the chosen category.
3. Show a **flyer preview in the UI** and provide a **Download PNG** action.
4. Overlay **minimal, contextual stats** (3–5 max) derived from server aggregates.
5. Export flyer as **PNG** on the client.
6. Keep Phase 1 simple: no telemetry, no heavy perf work for extreme datasets.

## Non-Goals
- No server-side image rendering.
- No telemetry/analytics collection in Phase 1.
- No generating flyers for non-top categories in Phase 1.
- No deep customization (fonts/layout knobs, user-editable text, etc.).
- No location/route maps or activity titles.
- Not optimizing for extremely high activity counts in Phase 1.

---

## Core Categories (V1)
Each activity is mapped into one category:

1. Road Running (simple outdoor running)
2. Trail Running
3. Running Indoors (treadmill / virtual / indoor run types)
4. Swimming
5. Hiking
6. General Walking
7. Biking
8. Strength Training
9. Yoga
10. Catch-all / General

---

## Primary Rule: Choosing the Flyer Theme
### Theme selection algorithm (server-side)
1. Map each activity → one category.
2. Count activities per category.
3. Select the category with **maximum count**.

### Tie-breakers (deterministic, server-side)
If multiple categories share the same max count:
1. Pick the category with the **most recent activity date** among tied categories.
2. If still tied, pick the category with **highest total duration (seconds)** among tied categories.
3. If still tied, pick by fixed priority:
   Road Running > Trail Running > Running Indoors > Biking > Walking > Hiking > Swimming > Strength > Yoga > Catch-all

---

## Time Range Rules
- Time range is **max 1 year** (≤ 365 days).
- System already enforces the “max 1 year” constraint.
- There is no default, the system will need the time range

---

## Privacy Rules
Must NOT include:
- precise locations, city names, route maps, coordinates
- activity titles/descriptions
- any personally identifying text beyond the athlete name/handle (optional)

Only aggregated numbers.

---

## Data Contract: Server → UI (Aggregates JSON)
The server computes:
- top category (theme)
- category-level aggregates for that top category
- minimal shared metadata (time range)

Server returns raw units:
- distance in **meters**
- duration in **seconds**
UI converts:
- meters → mi/km using existing preference/locale logic
- seconds → hh:mm formatting

### Response shape (example)
```json
{
  "athleteId": "abc",
  "range": {
    "label": "Last 365 days",
    "startDate": "2025-01-25",
    "endDate": "2026-01-25",
    "maxDays": 365
  },
  "topCategory": "RoadRunning",
  "dataVersion": "hash-or-timestamp",
  "aggregates": {
    "count": 82,
    "totalDistanceMeters": 410234,
    "totalMovingTimeSeconds": 132400,
    "totalElevationGainMeters": 3200,
    "longestDistanceMeters": 24140,
    "longestMovingTimeSeconds": 9100,
    "activeDays": 64
  }
}
