# Feature Specification: Contextual "Top Activity" Shareable Flyer (Phase 1)

**Feature Branch**: `001-activity-flyer`  
**Created**: January 25, 2026  
**Status**: Draft  
**Input**: User description: "Contextual 'Top Activity' Shareable Flyer (Phase 1)"

---

## Clarifications

### Session 2026-01-25

- Q: The spec mentions "3-5 contextual statistics" but doesn't specify which exact stats to prioritize when category-specific data is sparse or when exactly 3 vs 5 should be shown. → A: Dynamic display based on available data: show all non-zero stats up to 5, with minimum of 3 (pad with zeros if needed)
- Q: The spec mentions athlete name is "optional" on the flyer (FR-012 and Assumptions), but doesn't specify when to show it vs hide it, or whether this is a user preference. → A: Always include athlete first name on flyer
- Q: The spec requires converting distances to "user's locale preference (miles or kilometers)" but doesn't specify how this preference is determined or stored. → A: Preference already stored in UI (accessed via existing formatDistance/formatDuration utilities in src/utils/format.ts which read user's unit preference)
- Q: The spec mentions maximum time range of 365 days in multiple places, but doesn't specify the error behavior when a user attempts to exceed this limit. → A: Return error before processing (HTTP 400 with message "Time range cannot exceed 365 days")
- Q: Should the flyer be embedded in recap page or a separate page? → A: Separate `/flyer` page with "Create Flyer" button in recap header, preserving all query params from recap
- Q: What are the exact activity groups and their mapping? → A: 9 groups (running, trail-running, indoor, cycling, ski, hiking, walking, strengthtraining, workout) mapped from existing activityTypes.ts
- Q: Should users be able to customize stats positioning? → A: Yes, provide alignment options (left, right, bottom) to optimize visibility with background images

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navigate to Flyer Page (Priority: P1)

An athlete generates a recap and sees small "Generate Flyer" buttons within each activity breakdown area. Clicking a button navigates to a dedicated `/flyer` page that displays a shareable flyer themed to that specific activity group.

**Why this priority**: This is the core feature - navigation to the flyer experience is essential for users to access the shareable content.

**Independent Test**: Can be fully tested by: (1) generating a recap, (2) clicking "Generate Flyer" button in a breakdown area, (3) navigating to /flyer page with preserved query params + activity group, and (4) verifying the flyer renders with correct theme.

**Acceptance Scenarios**:

1. **Given** an athlete is on the Recap page, **When** the recap loads successfully with activity breakdowns, **Then** a small "Generate Flyer" button is displayed within each breakdown area that has activities
2. **Given** a "Generate Flyer" button is visible in a breakdown area, **When** the athlete clicks it, **Then** they navigate to `/flyer` route with all recap params preserved (type, days, unit, offset) plus the activity group parameter
3. **Given** the athlete navigates to /flyer page, **When** the page loads, **Then** the flyer displays with a themed background image matching the activity group from the URL parameter
4. **Given** multiple breakdown areas exist, **When** different "Generate Flyer" buttons are clicked, **Then** each generates a flyer for its respective activity group

---

### User Story 2 - Download Flyer as PNG (Priority: P1)

An athlete can download the flyer displayed on `/flyer` page as a PNG file suitable for social media sharing. The filename includes the athlete's name and time period for easy organization. The downloaded image reflects the current alignment selection.

**Why this priority**: P1 - Downloading is essential for the "shareable" value proposition. Without download, the flyer is just a preview.

**Independent Test**: Can be fully tested by: (1) viewing a flyer on /flyer page, (2) clicking download, (3) verifying a PNG file is created, and (4) confirming the file is valid and has the correct naming convention.

**Acceptance Scenarios**:

1. **Given** a flyer is displayed on /flyer page, **When** the athlete clicks "Download PNG", **Then** a PNG file is generated and downloaded
2. **Given** a download is initiated, **When** the file is saved, **Then** the filename follows the pattern: `[AthleteFirstName]_[Group]_[TimeRange].png`
3. **Given** an athlete downloads multiple flyers, **When** multiple downloads occur, **Then** each file is distinct and properly named to avoid overwrites
4. **Given** an alignment is selected, **When** the PNG is downloaded, **Then** the stats positioning matches the selected alignment

---

### User Story 3 - Theme Flyer Based on Top Activity Group (Priority: P1)

The system determines the athlete's top activity group based on activity count and displays a themed background image. Groups include Running, Trail Running, Indoor, Cycling, Ski, Hiking, Walking, Strength Training, and Workout.

**Why this priority**: P1 - The thematic consistency is core to the feature's purpose. A generic flyer defeats the "contextual" value.

**Independent Test**: Can be fully tested by: (1) providing activity data with clear group distribution, (2) verifying group determination logic, (3) confirming the flyer background image matches the top group.

**Acceptance Scenarios**:

1. **Given** an athlete has activities across multiple groups, **When** the flyer is generated, **Then** the background image corresponds to the group with the highest activity count
2. **Given** multiple groups are tied for maximum count, **When** tie-breaking rules are applied, **Then** the system selects the group with the most recent activity date (and subsequent tiers by total duration and fixed priority order: Running, Cycling, Ski, TrailRunning, Hiking, Walking, StrengthTraining, Indoor, Workout)
3. **Given** an athlete with only one group, **When** the flyer is generated, **Then** the appropriate group background image is loaded from `/flyer/tn/{groupName}.png`

---

### User Story 4 - Display Aggregated Statistics (Priority: P2)

The flyer displays 3-5 aggregated statistics derived from the top activity category, such as total distance, total time, elevation gain, and activity count. These statistics are calculated server-side and rendered on the client.

**Why this priority**: P2 - While important for context, the core feature works with just the themed flyer. Statistics enhance value but aren't blocking.

**Independent Test**: Can be fully tested by: (1) generating a flyer, (2) verifying 3-5 stats are displayed, (3) confirming values match server calculations, (4) checking formatting (distance in mi/km, time as hh:mm).

**Acceptance Scenarios**:

1. **Given** a flyer for a category with multiple activities, **When** statistics are rendered, **Then** at least 3 and no more than 5 stats are displayed (showing all non-zero stats up to 5, padding with zeros if fewer than 3 exist)
2. **Given** distance statistics in meters, **When** rendered in the UI, **Then** they are converted to the user's preferred unit (miles or kilometers)
3. **Given** duration statistics in seconds, **When** rendered in the UI, **Then** they are formatted as human-readable time (hh:mm)
4. **Given** a category with sparse data (e.g., only 2 non-zero stats), **When** the flyer renders, **Then** the system pads to exactly 3 stats by including zero-value metrics

---

### User Story 5 - Privacy Protection (Priority: P1)

The flyer protects athlete privacy by excluding precise locations, route maps, activity titles, and other identifying information. Only aggregated numbers and category type are shown.

**Why this priority**: P1 - Privacy is a core value of the product and non-negotiable before release.

**Independent Test**: Can be fully tested by: (1) generating a flyer, (2) inspecting the PNG and rendered content, (3) verifying no locations, titles, or identifying details are present.

**Acceptance Scenarios**:

1. **Given** a flyer is generated, **When** it is rendered, **Then** no specific city names, coordinates, or route maps are displayed
2. **Given** an athlete's activities contain titles/descriptions, **When** the flyer is created, **Then** no activity titles or descriptions are included
3. **Given** a shareable PNG is downloaded, **When** it is inspected, **Then** only aggregated stats and category type are visible

---

### User Story 6 - Customize Stats Alignment (Priority: P2)

An athlete can choose how statistics are positioned on the flyer: left (vertical), right (vertical), or bottom (horizontal). This allows them to optimize visibility based on the background image.

**Why this priority**: P2 - While customization enhances the experience, the core feature works with a default alignment. This provides value but isn't blocking for MVP.

**Independent Test**: Can be fully tested by: (1) viewing a flyer, (2) selecting different alignment options, (3) verifying stats reposition correctly, (4) confirming layout changes (vertical vs horizontal).

**Acceptance Scenarios**:

1. **Given** a flyer is displayed, **When** the athlete selects "Left" alignment, **Then** stats are overlaid vertically on the left side of the image
2. **Given** a flyer is displayed, **When** the athlete selects "Right" alignment, **Then** stats are overlaid vertically on the right side of the image
3. **Given** a flyer is displayed, **When** the athlete selects "Bottom" alignment, **Then** stats are overlaid horizontally at the bottom of the image
4. **Given** an alignment is selected, **When** the athlete downloads the PNG, **Then** the downloaded image reflects the chosen alignment

---

### Edge Cases

- What happens when an athlete has no activities in the selected time range? (No breakdown areas render, therefore no "Generate Flyer" buttons appear)
- What happens when all activities are in the "Workout" group (generic catchall)? (Flyer uses generic background image for that group)
- What happens when the time range spans multiple years? (System validates range and returns HTTP 400 error with message "Time range cannot exceed 365 days" if > 365 days)
- How does the system handle very high activity counts (e.g., 500+ activities)? (Phase 1 doesn't optimize for this, but should not crash or timeout)
- What happens if a background image fails to load? (Display fallback generic background with appropriate error handling)

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept a time range (max 365 days) and return activity data for the athlete; if time range exceeds 365 days, system MUST return HTTP 400 error with message "Time range cannot exceed 365 days" before processing
- **FR-002**: System MUST map each activity to exactly one group from the 9 core activity groups (Running, Trail Running, Indoor, Cycling, Ski, Hiking, Walking, Strength Training, Workout)
- **FR-002a**: UI MUST provide small "Generate Flyer" buttons within each activity breakdown area on the recap page that navigate to `/flyer` route with preserved query parameters (type, days, unit, offset) plus an `activityGroup` parameter; buttons MUST be displayed only for breakdown areas that contain at least one activity
- **FR-003**: Flyer page MUST use the activity group specified in the `activityGroup` URL parameter to determine which themed background and statistics to display; if parameter is missing or invalid, default to "workout" group
- **FR-004**: System MUST return aggregated data in raw units (distance in meters, duration in seconds) for client-side conversion
- **FR-005**: System MUST include these aggregates in the response: activity count, total distance (meters), total moving time (seconds), total elevation gain (meters), longest distance (meters), longest moving time (seconds), and active days
- **FR-006**: System MUST return the time range label and start/end dates in the response
- **FR-007**: UI MUST render the flyer on /flyer page using themed background images located at `/flyer/tn/{groupName}.png` based on the top activity group
- **FR-007a**: UI MUST overlay athlete name and date range at the top of the image in italic font format: "[Athlete Name]'s Insights" with date range below (font: system sans-serif, size: 24-28px, color: white with 40% black text shadow for readability on varied backgrounds)
- **FR-007b**: UI MUST display statistics dynamically: show all non-zero stats up to a maximum of 5, padding with zero-value metrics if fewer than 3 non-zero stats exist
- **FR-007c**: UI MUST render stats in semi-transparent cards overlaid on the background image
- **FR-007d**: UI MUST provide alignment options: left (vertical stats), right (vertical stats), and bottom (horizontal stats)
- **FR-008**: UI MUST convert server-provided distances (meters) to the user's existing UI-stored locale preference (miles or kilometers)
- **FR-009**: UI MUST convert server-provided durations (seconds) to human-readable format (hh:mm or equivalent)
- **FR-010**: UI MUST provide a "Download PNG" button that exports the rendered flyer as a PNG file
- **FR-011**: Downloaded PNG filenames MUST follow the format: `[AthleteFirstName]_[Group]_[TimeRange].png`
- **FR-012**: Flyer MUST always display the athlete's first name
- **FR-013**: System MUST NOT include in the flyer: precise locations, city names, route maps, coordinates, activity titles, activity descriptions, or other personally identifying information beyond athlete first name
- **FR-014**: /flyer page MUST fetch activity data using the same API endpoint as recap page (/api/recap), using time range params from the route (type, days, unit, offset); client-side filtering MUST extract activities matching the activityGroup parameter

### Key Entities

- **Flyer Data**: Uses existing activity breakdown from recap API to determine top group
  - `athleteId`: Unique athlete identifier (from athlete profile)
  - `topGroup`: Derived from activity breakdown by counting activities per group
  - `range`: Object containing `label`, `startDate`, `endDate` (from recap query params)
  - `aggregates`: Computed from top group's activities (count, distances, durations, elevation, active days)
  
- **Activity Group**: Represents one of 9 activity groups with themed background images
  - Group name (running, trail-running, indoor, cycling, ski, hiking, walking, strengthtraining, workout)
  - Background image path: `/flyer/tn/{groupName}.png`
  - Display label and emoji (from activityTypes.ts)
  - Priority order for tie-breaking (Running=1, Cycling=2, Ski=3, TrailRunning=4, Hiking=5, Walking=6, StrengthTraining=7, Indoor=8, Workout=9)
  
- **Alignment Option**: Controls stats overlay positioning
  - `left`: Stats displayed vertically on left side of image
  - `right`: Stats displayed vertically on right side of image
  - `bottom`: Stats displayed horizontally at bottom of image

- **Aggregates**: Time-windowed statistics computed from top group's activities
  - `count`: Total number of activities in group
  - `totalDistanceMeters`: Sum of all distances
  - `totalMovingTimeSeconds`: Sum of all moving times
  - `totalElevationGainMeters`: Sum of elevation gains
  - `longestDistanceMeters`: Maximum single activity distance
  - `longestMovingTimeSeconds`: Maximum single activity duration
  - `activeDays`: Number of distinct calendar days with activities

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Flyer page loads within 2 seconds of navigation from recap page
- **SC-002**: Flyer PNG download completes within 5 seconds and produces a valid image file
- **SC-003**: 100% of flyers display the correct activity group background image based on the activityGroup URL parameter
- **SC-004**: Flyer displays 3-5 contextual statistics with correct values in semi-transparent cards, showing all non-zero stats up to 5 (padding to 3 minimum when needed)
- **SC-005**: Distance and duration statistics are correctly formatted (miles/km, hh:mm) in 95% of cases across different locale settings
- **SC-006**: 100% of downloaded PNG files can be opened and viewed in standard image viewers
- **SC-007**: Zero privacy violations: no precise locations, routes, titles, or personal details beyond athlete first name are exposed in generated flyers
- **SC-008**: System handles time ranges up to 365 days without timeout or memory issues
- **SC-009**: Athletes can complete the full workflow (select breakdown → click Generate Flyer → view flyer → select alignment → download PNG) in under 45 seconds
- **SC-010**: Alignment changes (left, right, bottom) apply instantly and are reflected in downloaded PNG

---

## Assumptions

- **Time range is validated**: The system validates the time range server-side and returns HTTP 400 if it exceeds 365 days. The UI enforces this constraint client-side, but server validation is the authoritative check.
- **Activity groups are predefined**: The 9 core activity groups are fixed in Phase 1 and mapped from existing activityTypes.ts. No dynamic configuration needed.
- **Athlete name is available**: The athlete's first name is available from the athlete profile for use in download filenames and display on the flyer.
- **Client-side image generation available**: The `html-to-image` library (already used in the codebase) is available and functional for PNG export.
- **No heavy optimization needed in Phase 1**: The system assumes activity counts are reasonable (under 500 in Phase 1). Heavy optimization can be deferred to Phase 2.
- **Server aggregation is fast**: Pre-aggregated JSON from the server is available quickly (no on-demand real-time aggregation needed).
- **Locale/unit preferences are available**: The UI's existing locale/unit preference system (already stored) is used for distance and duration formatting.
- **Themed background images are provided**: Pre-designed background images for each of the 9 activity groups are available at `/flyer/tn/{groupName}.png` in the public directory.

---

## Out of Scope (Phase 1)

- Telemetry and analytics tracking
- Deep customization (custom fonts, colors, text editing beyond alignment)
- Generating multiple flyers for non-top groups
- Location data, route maps, or activity titles
- Server-side image rendering
- Optimization for extreme activity counts (500+)
- Mobile app integration
- Deep social media integration (direct posting, metadata)
- Custom background image upload
