# Phase 0: Research - Activity Flyer Feature

**Feature**: Contextual "Top Activity" Shareable Flyer (Phase 1)  
**Date**: 2026-01-25  
**Status**: Complete

## Research Questions & Findings

### 1. Activity Group Mapping Strategy

**Question**: How should the 9 activity groups map to the existing `activityTypes.ts` entries (55+ types)?

**Decision**: Create explicit mapping groups based on activity characteristics and user mental models

**Rationale**:
- Users think in broad categories (running, cycling) not granular types (VirtualRun vs TrailRun vs Run)
- Grouping enables themed backgrounds that resonate with athlete identity
- Mapping should be deterministic and comprehensive (all types covered)

**Mapping Design**:
```typescript
export const ACTIVITY_GROUPS = {
  running: ['Run', 'VirtualRun'],
  'trail-running': ['TrailRun'],
  indoor: ['Elliptical', 'StairStepper', 'VirtualRide', 'VirtualRow'],
  cycling: ['Ride', 'VirtualRide', 'GravelRide', 'MountainBikeRide', 'EBikeRide', 'EMountainBikeRide', 'Handcycle', 'Velomobile'],
  ski: ['AlpineSki', 'BackcountrySki', 'NordicSki', 'RollerSki', 'Snowboard', 'Snowshoe'],
  hiking: ['Hike'],
  walking: ['Walk'],
  strengthtraining: ['WeightTraining', 'Crossfit', 'HighIntensityIntervalTraining'],
  workout: ['Workout', 'Yoga', 'Pilates', 'Swim', 'OpenWaterSwim', 'Rowing', 'Other', ...] // catchall
};
```

**Alternatives considered**:
- Server-side grouping: Rejected because adds backend complexity for UI-only feature
- Dynamic user-defined groups: Out of scope for Phase 1 (spec explicitly excludes customization)
- Fewer groups (5-6): Rejected because loses thematic richness (trail running is distinct from road running)

---

### 2. Client-Side PNG Export Approach

**Question**: What's the best approach for exporting the flyer as a PNG using `html-to-image` library?

**Decision**: Use `html-to-image.toPng()` with high-DPI scaling for social media optimization

**Rationale**:
- Library already in use for existing recap poster feature ([RecapPoster.tsx](../../strava-recap/src/ui/RecapPoster.tsx))
- Proven to work with React components and background images
- Client-side export avoids server infrastructure and scaling concerns
- High DPI (2x or 3x) ensures crisp images on mobile devices

**Implementation Pattern**:
```typescript
import { toPng } from 'html-to-image';

async function downloadFlyer(elementRef: HTMLElement, filename: string) {
  const dataUrl = await toPng(elementRef, {
    cacheBust: true,
    pixelRatio: 2, // 2x for retina displays
    width: 1080,   // Instagram-optimized dimensions
    height: 1920
  });
  // Trigger download...
}
```

**Alternatives considered**:
- Canvas API directly: More control but significantly more complex, requires manual layout rendering
- Server-side rendering (Puppeteer/Playwright): Adds infrastructure cost, latency, and complexity
- SVG export: Not suitable for photos/backgrounds with gradients

**Best Practices**:
- Use ref to target specific DOM element (not entire page)
- Include `cacheBust: true` to ensure fresh background images
- Set explicit dimensions for consistent output
- Handle promise rejections (network failures, browser limits)

---

### 3. React Router v7 Route Integration

**Question**: How should the `/flyer` route preserve query parameters from the recap page and specify activity group?

**Decision**: Use React Router's `useSearchParams` to preserve all recap params plus add `activityGroup` parameter

**Rationale**:
- Existing app uses React Router v7 ([App.tsx](../../strava-recap/src/App.tsx))
- Query params already defined for recap: `type`, `days`, `unit`, `offset`
- Adding `activityGroup` param specifies which breakdown's flyer to generate
- Preserving params enables direct linking and browser back/forward navigation

**Implementation Pattern**:
```typescript
// In RecapPage.tsx breakdown area - "Generate Flyer" button
import { useSearchParams, Link } from 'react-router-dom';

function BreakdownCard({ activityGroup }: { activityGroup: string }) {
  const [searchParams] = useSearchParams();
  const flyerParams = new URLSearchParams(searchParams);
  flyerParams.set('activityGroup', activityGroup);
  
  return (
    <Link to={`/flyer?${flyerParams.toString()}`}>
      Generate Flyer
    </Link>
  );
}

// In FlyerPage.tsx - consume params
function FlyerPage() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const days = searchParams.get('days');
  const activityGroup = searchParams.get('activityGroup') ?? 'workout';
  // ... use same recapQuery logic + filter by activityGroup
}
```

**Alternatives considered**:
- State-based navigation (React Router state): Works but breaks direct linking and refresh
- LocalStorage: Persists too long, creates stale data issues
- Global Redux store: Over-engineered for simple param passing
- Path param `/flyer/:activityGroup`: Less flexible, harder to preserve other query params

---

### 4. Stats Selection and Formatting Logic

**Question**: Which 3-5 stats should be displayed, and how should dynamic selection work?

**Decision**: Define priority-ordered stat list, show first 3-5 non-zero values, pad to minimum of 3

**Rationale**:
- Spec requires 3-5 stats (FR-007b) with dynamic display based on available data
- Some groups have sparse metrics (e.g., walking rarely has elevation gain)
- Priority order ensures most meaningful stats appear first

**Stat Priority Order**:
1. Activity count (always non-zero if any activities exist)
2. Total distance (non-zero for distance-based activities)
3. Total moving time (non-zero for all activities)
4. Total elevation gain (non-zero for outdoor activities)
5. Longest distance (non-zero for distance-based activities)
6. Longest moving time (fallback/padding)
7. Active days (fallback/padding)

**Formatting Requirements**:
- Distance: Use existing `formatDistance()` utility from `utils/format.ts`, respects user's unit preference
- Duration: Use existing `formatDuration()` utility, outputs `hh:mm` format
- Elevation: Meters or feet based on unit preference
- Count: Integer with "activities" label

**Implementation Pattern**:
```typescript
function selectStats(aggregates: Aggregates): StatItem[] {
  const allStats = [
    { label: 'Activities', value: aggregates.count, format: (v) => v.toString() },
    { label: 'Distance', value: aggregates.totalDistanceMeters, format: formatDistance },
    { label: 'Time', value: aggregates.totalMovingTimeSeconds, format: formatDuration },
    { label: 'Elevation', value: aggregates.totalElevationGainMeters, format: formatElevation },
    { label: 'Longest Ride', value: aggregates.longestDistanceMeters, format: formatDistance },
  ];
  
  const nonZero = allStats.filter(s => s.value > 0);
  const selected = nonZero.slice(0, 5);
  
  // Pad to minimum 3 if needed
  while (selected.length < 3 && allStats.length > selected.length) {
    selected.push(allStats[selected.length]);
  }
  
  return selected;
}
```

**Alternatives considered**:
- Always show exactly 5 stats: Creates visual clutter with zero values ("0 mi elevation")
- Always show exactly 3 stats: Loses valuable info when more meaningful stats available
- Category-specific stat selection: Over-engineered for Phase 1, deferred to future phase

---

### 5. Background Image Dimensions and Format

**Question**: What dimensions and format should the themed background images use?

**Decision**: 1080x1920px PNG files (9:16 vertical Instagram story ratio), optimized for web

**Rationale**:
- Instagram stories are the primary social sharing destination
- 9:16 ratio is universal for mobile-first social platforms (TikTok, Snapchat, etc.)
- 1080x1920 is Instagram's recommended resolution
- PNG supports transparency if needed for future design iterations

**File Naming Convention**: `{groupName}.png` (lowercase, hyphenated)
- `running.png`
- `trail-running.png`
- `cycling.png`
- etc.

**Storage Location**: `/public/flyer/tn/` (tn = "thumbnail" from user's original description)

**Optimization**:
- Use WebP format with PNG fallback if browser compatibility is a concern
- Compress images to ~200-400KB each (9 images = ~3MB total)
- Consider lazy loading if many background options added in future

**Alternatives considered**:
- Square 1080x1080: Doesn't utilize mobile screen space effectively
- Landscape 1920x1080: Poor fit for mobile sharing
- SVG backgrounds: Limits design flexibility for photo-realistic themes
- Dynamic background generation: Over-engineered, increases complexity

---

### 6. Alignment State Management

**Question**: Should alignment preference be persisted, and where should state live?

**Decision**: Use local component state (useState), no persistence between sessions

**Rationale**:
- Alignment is a per-flyer customization choice, not a user preference
- Persisting could confuse users (why is my next flyer already aligned right?)
- Keeps implementation simple (no localStorage, no Redux, no API)
- Default to "right" alignment for visual balance with typical background designs

**Implementation Pattern**:
```typescript
type Alignment = 'left' | 'right' | 'bottom';

function FlyerPage() {
  const [alignment, setAlignment] = useState<Alignment>('right');
  
  return (
    <>
      <AlignmentSelector value={alignment} onChange={setAlignment} />
      <FlyerGenerator alignment={alignment} />
    </>
  );
}
```

**CSS Strategy**:
- Use CSS Grid or Flexbox for positioning
- Separate classes for `.stats-left`, `.stats-right`, `.stats-bottom`
- Vertical layouts (left/right): `flex-direction: column`
- Horizontal layout (bottom): `flex-direction: row`

**Alternatives considered**:
- LocalStorage persistence: Creates unexpected behavior across sessions
- URL param (`?align=right`): Clutters URL, not semantically meaningful
- User profile setting: Over-engineered for Phase 1 customization

---

## Technology Stack Summary

### Frontend Dependencies (Already Installed)
- ✅ `html-to-image` - Already in use for RecapPoster
- ✅ `react-router-dom@7` - Already configured
- ✅ `@reduxjs/toolkit` with RTK Query - Already configured for API calls

### New Frontend Utilities (To Be Created)
- `utils/activityGroups.ts` - Activity type → group mapping
- `utils/flyerExport.ts` - PNG download logic
- `hooks/useFlyerData.ts` - Data fetching and aggregation hook

### Backend Changes
- ⚠️ **NONE** - Feature reuses existing `/api/recap` endpoint without modifications

### Static Assets (To Be Added)
- 9 PNG background images (1080x1920px, ~200-400KB each)
- Total asset size: ~3MB

---

## Implementation Risks & Mitigations

### Risk 1: Large Background Images Impacting Load Time
**Likelihood**: Medium  
**Impact**: High (violates SC-001: 2-second load time)  
**Mitigation**: 
- Preload background images on recap page (predictive loading)
- Use WebP format with PNG fallback
- Implement image compression (target <300KB per image)
- Consider CDN caching for static assets

### Risk 2: html-to-image Browser Compatibility
**Likelihood**: Low  
**Impact**: High (breaks download functionality)  
**Mitigation**:
- Library is well-maintained and widely used
- Already proven in RecapPoster component
- Test on Safari, Chrome, Firefox, Edge before release
- Provide clear error message if export fails

### Risk 3: Activity Group Mapping Disagreements
**Likelihood**: Medium  
**Impact**: Low (user expectations mismatch)  
**Mitigation**:
- Map common edge cases explicitly (e.g., e-bikes → cycling, not workout)
- Document mapping in code comments
- Use deterministic priority order for ties (spec FR-003)
- Gather user feedback in Phase 2 for refinements

### Risk 4: Complex Layout with Alignment Options
**Likelihood**: Low  
**Impact**: Medium (CSS complexity, testing burden)  
**Mitigation**:
- Use CSS Grid for predictable positioning
- Build reusable `<StatsOverlay>` component with alignment prop
- Test all 3 alignments × 9 backgrounds = 27 combinations visually
- Ensure semi-transparency works on all backgrounds

---

## Open Questions (To Be Resolved in Phase 1 Design)

1. ~~Which activity types map to which groups?~~ → RESOLVED (see Finding #1)
2. ~~How to preserve query params?~~ → RESOLVED (see Finding #3)
3. ~~How to handle sparse statistics?~~ → RESOLVED (see Finding #4)
4. **TODO**: Exact semi-transparent card styling (opacity %, border radius, padding)
5. **TODO**: Exact font for athlete name overlay (italic, which family/size?)
6. **TODO**: Error state when no activities exist (button disabled vs hidden vs error message)
7. **TODO**: Loading state during PNG generation (spinner vs progress bar vs disabled button)

**Next Phase**: Phase 1 (Data Model & Contracts) will define TypeScript interfaces, component props, and API contracts based on these research findings.
