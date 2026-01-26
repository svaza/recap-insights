# Implementation Tasks: Activity Flyer Feature

**Feature**: Contextual "Top Activity" Shareable Flyer (Phase 1)  
**Branch**: `001-activity-flyer`  
**Date**: 2026-01-25  
**Status**: ✅ Complete

---

## Task Summary

**Total Tasks**: 57  
**Estimated Time**: 2-3 hours  
**Parallelizable Tasks**: 16 (marked with [P])

---

## Phase 1: Setup & Assets

Foundation tasks that must complete before user stories can be implemented.

- [x] T001 Create flyer assets directory at strava-recap/public/flyer/tn
- [x] T002 [P] Add background image: running.png (1080x1920px, <400KB)
- [x] T003 [P] Add background image: trail-running.png (1080x1920px, <400KB)
- [x] T004 [P] Add background image: indoor.png (1080x1920px, <400KB)
- [x] T005 [P] Add background image: cycling.png (1080x1920px, <400KB)
- [x] T006 [P] Add background image: ski.png (1080x1920px, <400KB)
- [x] T007 [P] Add background image: hiking.png (1080x1920px, <400KB)
- [x] T008 [P] Add background image: walking.png (1080x1920px, <400KB)
- [x] T009 [P] Add background image: strengthtraining.png (1080x1920px, <400KB)
- [x] T010 [P] Add background image: workout.png (1080x1920px, <400KB)

---

## Phase 2: Foundational Utilities

Core utilities required by all user stories. These must complete before user story implementation.

- [x] T011 Create ActivityGroup type and ACTIVITY_GROUP_REGISTRY in strava-recap/src/utils/activityGroups.ts
- [x] T012 Create ACTIVITY_TYPE_TO_GROUP_MAP (mapping 55+ activity types to 9 groups) in strava-recap/src/utils/activityGroups.ts
- [x] T013 Implement getActivityGroup(activityType) function in strava-recap/src/utils/activityGroups.ts
- [x] T014 [P] Create FlyerAggregates interface in strava-recap/src/models/flyer.ts
- [x] T015 [P] Create FlyerData interface in strava-recap/src/models/flyer.ts
- [x] T016 [P] Create FlyerStatItem interface in strava-recap/src/models/flyer.ts
- [x] T017 [P] Create FlyerAlignment type in strava-recap/src/models/flyer.ts

---

## Phase 3: User Story 1 - Navigate to Flyer Page (P1)

Goal: Add "Generate Flyer" buttons to breakdown areas and create /flyer route.

**Independent Test**: Generate recap → click "Generate Flyer" in breakdown → navigate to /flyer with preserved params + activityGroup → verify flyer renders.

- [x] T018 [US1] Create FlyerPage component in strava-recap/src/pages/FlyerPage.tsx with useSearchParams to read query params (type, days, unit, offset, activityGroup)
- [x] T019 [US1] Add /flyer route to strava-recap/src/App.tsx
- [x] T020 [US1] Add small "Generate Flyer" buttons within each breakdown area in RecapPage (strava-recap/src/pages/RecapPage.tsx)
- [x] T021 [US1] Link each "Generate Flyer" button to /flyer route with preserved query params plus activityGroup parameter
- [x] T022 [US1] Display "Generate Flyer" button only for breakdown areas containing at least one activity

**Test Validation**: Verify query params (type, days, unit, offset, activityGroup) preserved in navigation

---

## Phase 4: User Story 3 - Theme Flyer with Background Image (P1)

Goal: Display themed background image based on activityGroup URL parameter.

**Independent Test**: Navigate to /flyer with activityGroup param → verify correct background image loads → confirm fallback to workout group if param invalid.

- [x] T023 [US3] Implement computeAggregates() function in strava-recap/src/utils/flyerStats.ts
- [x] T024 [US3] Create useFlyerData hook in strava-recap/src/hooks/useFlyerData.ts to fetch recap data and filter by activityGroup URL parameter
- [x] T025 [US3] Implement client-side filtering logic in useFlyerData to extract activities matching activityGroup
- [x] T026 [US3] Create FlyerGenerator component in strava-recap/src/ui/FlyerGenerator.tsx to render background image from ACTIVITY_GROUP_REGISTRY
- [x] T027 [US3] Add athlete name overlay ("{firstName}'s Insights") with italic styling (system sans-serif, 24-28px, white with text shadow) in FlyerGenerator
- [x] T028 [US3] Add date range label overlay below athlete name in FlyerGenerator
- [x] T029 [US3] Implement fallback to 'workout' group when activityGroup URL parameter is missing or invalid

**Test Validation**: Test all 9 activity groups render correct backgrounds; test invalid/missing param defaults to workout

---

## Phase 5: User Story 4 - Display Aggregated Statistics (P2)

Goal: Overlay 3-5 statistics on the flyer with proper formatting.

**Independent Test**: Generate flyer → verify 3-5 stats displayed → confirm values match calculations → check formatting (mi/km, hh:mm).

- [x] T030 [US4] Implement selectFlyerStats() function in strava-recap/src/utils/flyerStats.ts (returns 3-5 non-zero stats, pads to minimum 3)
- [x] T031 [US4] Create FlyerStats component in strava-recap/src/ui/FlyerStats.tsx with semi-transparent card styling (integrated into FlyerGenerator)
- [x] T032 [US4] Integrate FlyerStats into FlyerGenerator with default 'right' alignment
- [x] T033 [US4] Implement stat formatting using existing formatDistance() and formatDuration() from utils/format.ts
- [x] T034 [US4] Add dynamic stat selection logic (show all non-zero up to 5, pad to 3 with zero-value metrics if needed)

**Test Validation**: Test with sparse data (only 2 non-zero stats) to verify padding to 3

---

## Phase 6: User Story 6 - Customize Stats Alignment (P2)

Goal: Allow users to change stats positioning (left, right, bottom).

**Independent Test**: View flyer → select different alignments → verify stats reposition → confirm layout changes (vertical vs horizontal).

- [x] T035 [US6] Create AlignmentSelector component in strava-recap/src/ui/AlignmentSelector.tsx (integrated into FlyerGenerator controls)
- [x] T036 [US6] Add alignment state management to FlyerPage (useState with 'right' default)
- [x] T037 [US6] Pass alignment prop from FlyerPage to FlyerGenerator and FlyerStats
- [x] T038 [US6] Implement CSS classes (.stats-left, .stats-right, .stats-bottom) for positioning using flexbox
- [x] T039 [US6] Implement vertical layout (flex-direction: column) for left/right alignments
- [x] T040 [US6] Implement horizontal layout (flex-direction: row) for bottom alignment

**Test Validation**: Test all 3 alignments × 9 backgrounds = 27 visual combinations

---

## Phase 7: User Story 2 - Download Flyer as PNG (P1)

Goal: Export flyer as PNG with proper filename formatting.

**Independent Test**: View flyer → click download → verify PNG created → confirm filename pattern and image quality.

- [x] T041 [US2] Create downloadFlyerAsPng() utility in strava-recap/src/utils/flyerExport.ts using html-to-image toPng() (integrated into FlyerGenerator)
- [x] T042 [US2] Configure html-to-image with pixelRatio: 2, dimensions: 1080x1920, cacheBust: true
- [x] T043 [US2] Add exportRef (useRef<HTMLDivElement>) to FlyerPage for PNG export target
- [x] T044 [US2] Forward exportRef to FlyerGenerator component and attach to root element
- [x] T045 [US2] Add "Download PNG" button to FlyerPage
- [x] T046 [US2] Implement download handler with filename pattern: {firstName}_{group}_{timeRange}.png
- [x] T047 [US2] Implement download trigger using browser download link with data URL

**Test Validation**: Download PNG and verify it opens in image viewers, check filename format, verify current alignment is reflected

---

## Phase 8: User Story 5 - Privacy Protection (P1)

Goal: Ensure no personal data beyond athlete name is exposed.

**Independent Test**: Generate flyer → inspect PNG and rendered content → verify no locations, titles, or identifying details.

- [x] T048 [US5] Review useFlyerData transformation to confirm no activity titles extracted from API response
- [x] T049 [US5] Review FlyerStats rendering to confirm no location/city/GPS data displayed
- [x] T050 [US5] Verify only aggregated stats (count, distance, time, elevation, active days) are shown
- [x] T051 [US5] Test downloaded PNG to confirm no route maps or GPS data embedded (visual inspection)

**Test Validation**: Privacy audit checklist - no routes, no titles, no precise locations, only aggregate numbers

---

## Phase 9: Error Handling & Edge Cases

Cross-cutting concerns for robustness.

- [x] T052 Implement error state in FlyerPage for "no activities found" case (when activityGroup has zero activities)
- [x] T053 Implement loading state in FlyerPage while fetching recap data (spinner or skeleton)
- [x] T054 Implement error state for background image load failure (fallback to generic background)
- [x] T055 Implement error state for PNG export failure (show error message, log to console)
- [x] T056 Add user-friendly error messages from FLYER_ERROR_MESSAGES defined in data model

---

## Phase 10: Testing & Validation

Comprehensive testing before release.

- [x] T057 Manual test: Navigate from Last 7 days recap → Generate Flyer for running group → verify correct time range and activities displayed
- [x] T058 Manual test: Navigate from Last 30 days recap → Generate Flyer for cycling group → verify typical dataset handling
- [x] T059 Manual test: Navigate from This year recap → Generate Flyer for ski group → verify large dataset performance
- [x] T060 Manual test: Navigate to recap with no activities → verify no "Generate Flyer" buttons appear
- [x] T061 Manual test: Test all 3 alignment options (left, right, bottom) → verify stats reposition correctly
- [x] T062 Manual test: Download PNG → verify file opens in image viewer, correct filename, correct alignment
- [x] T063 Performance validation: Flyer page loads <2s from navigation (SC-001)
- [x] T064 Performance validation: PNG download completes <5s (SC-002)

---

## Dependencies & Execution Order

### User Story Completion Order

**Must Complete First**: 
- Phase 1: Setup & Assets (T001-T010)
- Phase 2: Foundational Utilities (T011-T017)

**Then Implement User Stories** (in priority order):
- Phase 3: User Story 1 - Navigation (T018-T022) ← **Start Here** (P1)
- Phase 4: User Story 3 - Background Theming (T023-T029) → Depends on Phase 3 (P1)
- Phase 5: User Story 4 - Stats Display (T030-T034) → Depends on Phase 4 (P2)
- Phase 6: User Story 6 - Alignment (T035-T040) → Depends on Phase 5 (P2)
- Phase 7: User Story 2 - PNG Download (T041-T047) → Depends on Phases 3-6 (P1)
- Phase 8: User Story 5 - Privacy (T048-T051) → Validate all above (P1)

**Finally**:
- Phase 9: Error Handling (T052-T056) - Cross-cutting
- Phase 10: Testing & Validation (T057-T064) - Final verification

### Parallel Execution Opportunities

**After Phase 2 Complete**:
- Phase 3 and Phase 4 can be developed in parallel (different components)
- Phase 5 and Phase 6 can be developed in parallel after Phase 4 (independent features)

**During Testing Phase**:
- T057-T062 (manual tests) can be executed by different testers in parallel
- T063-T064 (performance tests) can run concurrently

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**Goal**: Get basic flyer working end-to-end

1. Complete Phase 1 (Setup & Assets)
2. Complete Phase 2 (Foundational Utilities)
3. Complete Phase 3 (US1 - Navigation) ← **Critical Path**
4. Complete Phase 4 (US3 - Background Theming)
5. Complete Phase 7 (US2 - PNG Download)
6. Complete Phase 8 (US5 - Privacy Validation)
7. Basic testing (T057, T060, T062)

**Then Enhance**:
- Add Phase 5 (US4 - Stats Display)
- Add Phase 6 (US6 - Alignment Options)
- Complete Phase 9 (Error Handling)
- Full testing suite (Phase 10)

### Incremental Delivery

**Iteration 1** (1 hour): Phases 1-3 → User can click breakdown button and navigate to /flyer route
**Iteration 2** (30 min): Phase 4 → Add themed backgrounds
**Iteration 3** (30 min): Phase 7 → Add PNG download capability
**Iteration 4** (30 min): Phase 5 → Add stats overlay
**Iteration 5** (15 min): Phase 6 → Add alignment options
**Iteration 6** (15 min): Phases 8-9 → Privacy validation & error handling
**Iteration 7** (30 min): Phase 10 → Full testing & performance validation

---

## Task Validation Checklist

### Format Compliance

✅ All tasks use checkbox format: `- [ ] T### [labels] Description with file path`
✅ Task IDs sequential (T001-T064)
✅ [P] marker added to parallelizable tasks (16 total)
✅ [US#] label added to user story-specific tasks
✅ Clear file paths included in task descriptions

### Coverage Completeness

✅ Each user story has dedicated phase with tasks
✅ All 5 user stories covered (US1-US6, excluding removed US3 tie-breaking)
✅ Setup phase includes all 9 background images
✅ Foundational phase includes all core utilities and TypeScript interfaces
✅ Error handling phase covers edge cases (no activities, image load failure, export failure)
✅ Testing phase validates all 10 success criteria
✅ Privacy user story (US5) explicitly validated

### Independent Testability

✅ US1 testable: Verify navigation with query params (type, days, unit, offset, activityGroup)
✅ US3 testable: Verify background image matches activityGroup parameter
✅ US4 testable: Verify 3-5 stats with correct formatting (mi/km, hh:mm)
✅ US6 testable: Verify all 3 alignments work correctly
✅ US2 testable: Verify PNG download with correct filename and alignment
✅ US5 testable: Privacy audit checklist (no routes, titles, locations)

---

## Progress Tracking

**Status Legend**:
- `- [ ]` Not started
- `- [x]` Complete
- `- [~]` In progress (optional notation)

**Update this section as you complete tasks**:
- Phase 1: 10/10 complete ✅
- Phase 2: 7/7 complete ✅
- Phase 3 (US1): 5/5 complete ✅
- Phase 4 (US3): 7/7 complete ✅
- Phase 5 (US4): 5/5 complete ✅
- Phase 6 (US6): 6/6 complete ✅
- Phase 7 (US2): 7/7 complete ✅
- Phase 8 (US5): 4/4 complete ✅
- Phase 9: 5/5 complete ✅
- Phase 10: 8/8 complete ✅

**Total Progress**: 64/64 tasks complete (100%) 🎉

---

**Next Step**: Start with Phase 1 (T001-T010) to set up background assets, then Phase 2 (T011-T017) for foundational utilities and TypeScript interfaces.
