# Implementation Plan: Contextual "Top Activity" Shareable Flyer (Phase 1)

**Branch**: `001-activity-flyer` | **Date**: 2026-01-25 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-activity-flyer/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Create a shareable flyer feature that allows athletes to generate themed, privacy-focused activity summaries for specific activity groups. Small "Generate Flyer" buttons appear within each activity breakdown area on the recap page. Clicking a button navigates to a dedicated `/flyer` page where a themed background image (based on the selected activity group) displays aggregated statistics in customizable overlay positions. The flyer can be downloaded as a PNG with proper filename formatting. Uses existing recap API data with client-side filtering for the selected activity group (9 groups: running, trail-running, indoor, cycling, ski, hiking, walking, strengthtraining, workout) and displays 3-5 relevant statistics in semi-transparent cards. Technical approach: React component on frontend, existing .NET Azure Functions API for data, client-side PNG generation via html-to-image library.

## Technical Context

**Language/Version**: TypeScript 5.x (frontend), .NET 8 (backend)
**Primary Dependencies**: React 19, Vite 7, html-to-image, RTK Query (frontend); Azure Functions v4, ASP.NET Core (backend)
**Storage**: Session storage for caching (client-side), existing Azure Functions backend data
**Testing**: Frontend - Vitest/React Testing Library; Backend - existing .NET test infrastructure
**Target Platform**: Azure Static Web Apps (frontend), Azure Functions (backend)
**Project Type**: Web application (React SPA + .NET API)
**Performance Goals**: Flyer page load <2s, PNG download <5s, alignment changes instant
**Constraints**: Privacy-first (no routes/locations/titles), max 365-day time range, client-side rendering only
**Scale/Scope**: Single-user experience, handles up to ~500 activities per time range, 9 activity groups with themed backgrounds

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Initial Status** (Pre-Phase 0): ✅ PASS

**Final Status** (Post-Phase 1): ✅ PASS

**Constitution v1.0.0 Compliance**:
- ✅ **Principle I (User Privacy First)**: No activity data storage, client-side only processing, no sensitive data in PNG exports
- ✅ **Principle II (Provider Abstraction)**: Feature works with any provider via existing /api/recap endpoint, no provider-specific logic
- ✅ **Principle III (Type Safety Everywhere)**: TypeScript interfaces throughout, no `any` types in design
- ✅ **Principle IV (Performance & Caching)**: <2s page load target, sessionStorage caching reused from existing recap
- ✅ **Principle V (Separation of Concerns)**: 100% frontend feature, clear React component hierarchy, RTK Query for API calls

**Notes**: Feature aligns with all constitutional principles. Zero backend changes required maintains separation of concerns. Client-side filtering respects provider abstraction by reusing existing API without modification.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
strava-recap/                    # Frontend React application
├── src/
│   ├── pages/
│   │   ├── RecapPage.tsx       # Existing - Add "Generate Flyer" buttons in breakdown areas
│   │   └── FlyerPage.tsx       # NEW - Main flyer display page
│   ├── components/
│   │   └── FlyerGenerator.tsx  # NEW - Flyer rendering component
│   ├── ui/
│   │   ├── FlyerStats.tsx      # NEW - Stats overlay component
│   │   └── AlignmentSelector.tsx # NEW - Alignment option controls
│   ├── utils/
│   │   ├── activityGroups.ts   # NEW - Activity group mapping logic
│   │   ├── flyerExport.ts      # NEW - PNG download utilities
│   │   └── activityTypes.ts    # EXISTING - Reference for mapping
│   ├── hooks/
│   │   └── useFlyerData.ts     # NEW - Hook to fetch/compute flyer data
│   └── App.tsx                 # MODIFY - Add /flyer route
├── public/
│   └── flyer/
│       └── tn/                 # NEW - Themed background images
│           ├── running.png
│           ├── trail-running.png
│           ├── indoor.png
│           ├── cycling.png
│           ├── ski.png
│           ├── hiking.png
│           ├── walking.png
│           ├── strengthtraining.png
│           └── workout.png
└── tests/                      # Test files mirror src structure

strava-recap-api/               # Backend .NET Azure Functions
├── Entities/
│   └── (NO CHANGES - reuse existing ActivitySummary, RecapRequest)
├── Services/
│   └── (NO CHANGES - reuse existing activity services)
├── Extensions/
│   └── (NO CHANGES - reuse existing RecapExtensions)
└── RecapFunction.cs            # EXISTING - Already provides needed data
```

**Structure Decision**: This feature leverages the existing web application structure (React frontend + Azure Functions backend). No backend changes are required as the feature reuses the existing recap API endpoint. All new code is frontend-only: a new `/flyer` page, utility functions for activity group mapping, and UI components for stats overlay and alignment selection. Background images are static assets in the public directory.

## Complexity Tracking

> **No violations identified** - This section intentionally left empty as no constitution violations require justification.

---

## Phase 0: Research (Complete)

**Status**: ✅ Complete  
**Deliverable**: [research.md](research.md)

### Key Research Questions Resolved

1. **Activity Group Mapping**: Created explicit mapping from 55+ activity types to 9 groups
2. **PNG Export Approach**: Using html-to-image with 2x pixel ratio for retina displays
3. **Route Integration**: Preserving query params via React Router's useSearchParams
4. **Stats Selection**: Priority-ordered list with dynamic 3-5 display logic
5. **Background Images**: 1080x1920px PNG files (Instagram story format)
6. **Alignment State**: Local component state, no persistence between sessions

### Technology Decisions

- **Client-side transformation**: All data processing happens in browser (zero backend impact)
- **Reuse existing API**: No new endpoints, leverages /api/recap
- **Image optimization**: Target <300KB per background image, ~3MB total
- **Default alignment**: Right (visual balance with typical backgrounds)

---

## Phase 1: Design (Complete)

**Status**: ✅ Complete  
**Deliverables**: 
- [data-model.md](data-model.md) - TypeScript interfaces and entities
- [contracts/README.md](contracts/README.md) - API contract documentation
- [quickstart.md](quickstart.md) - Implementation guide
- Updated agent context: `.github/agents/copilot-instructions.md`

### Data Model Highlights

- **Core Entities**: ActivityGroup, FlyerData, FlyerAggregates, FlyerAlignment
- **Key Functions**: `determineTopGroup()`, `selectFlyerStats()`, `downloadFlyerAsPng()`
- **Component Props**: FlyerPageProps, FlyerGeneratorProps, FlyerStatsProps, AlignmentSelectorProps
- **Validation**: Client-side validation with FlyerError types and user-friendly messages

### Architecture Decisions

- **Zero backend changes**: Feature is 100% frontend-only
- **User-selected groups**: Activity group comes from URL parameter (user clicks breakdown button)
- **Performance targets**: <2s page load, <5s PNG export, instant alignment changes
- **Error handling**: Graceful fallbacks for all failure modes (no activities, API errors, image load failures)

---

## Phase 2: Implementation (Not Started)

**Status**: ⏳ Ready for /speckit.tasks  
**Next Command**: Run `/speckit.tasks` to generate granular task breakdown

### Estimated Effort

- **Total**: 2-3 hours for experienced React developer
- **Setup & Assets**: 30 minutes
- **Core Utilities**: 45 minutes
- **Data Hook**: 30 minutes
- **UI Components**: 1 hour
- **Flyer Page**: 45 minutes
- **Recap Integration**: 15 minutes
- **Testing**: 30 minutes

### Implementation Order

1. Assets (background images)
2. Utilities (activity groups, stats, export)
3. Data hook (useFlyerData)
4. UI components (bottom-up: Stats → AlignmentSelector → FlyerGenerator)
5. Flyer page (composition)
6. Recap page integration (Generate Flyer buttons in breakdown areas)
7. Testing & validation

---

## Risk Assessment

### Low Risk ✅

- **Existing dependencies**: html-to-image already in use
- **No API changes**: Zero backend coordination needed
- **Isolated code**: Feature is self-contained, no impact on existing pages
- **Browser compatibility**: html-to-image well-supported

### Medium Risk ⚠️

- **Background image size**: Mitigated by compression and preloading
- **Activity group mapping edge cases**: Mitigated by explicit mapping and catchall group
- **PNG export performance**: Mitigated by testing and optimization (pixelRatio, dimensions)

### Mitigated ✅

- **No activities scenario**: Handled with error state and no buttons displayed
- **Alignment complexity**: Simplified to 3 CSS classes with flexbox

---

## Success Criteria Validation

All success criteria from spec are addressed in design:

- ✅ **SC-001**: Flyer loads <2s (cached API + background preload)
- ✅ **SC-002**: PNG download <5s (html-to-image optimization)
- ✅ **SC-003**: 100% correct activity group (from URL parameter)
- ✅ **SC-004**: 3-5 stats correctly displayed (dynamic selection)
- ✅ **SC-005**: Correct formatting 95%+ (reuse existing formatters)
- ✅ **SC-006**: 100% valid PNG files (html-to-image proven)
- ✅ **SC-007**: Zero privacy violations (no routes/titles/locations)
- ✅ **SC-008**: Handles 365-day range (existing API constraint)
- ✅ **SC-009**: Full workflow <45s (streamlined UX)
- ✅ **SC-010**: Instant alignment changes (local state update)

---

## Next Steps

**Immediate**: Run `/speckit.tasks` to generate implementation tasks.md

**After Implementation**:
1. User testing with beta users
2. Analytics integration (track generation/download rates)
3. Phase 2 planning (custom backgrounds, text editing, social integration)

---

**Plan Status**: ✅ Complete - Ready for task generation and implementation
