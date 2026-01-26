# Quickstart Guide - Activity Flyer Feature

**Feature**: Contextual "Top Activity" Shareable Flyer (Phase 1)  
**Estimated Time**: 2-3 hours  
**Prerequisite**: Feature spec and plan reviewed

---

## Implementation Checklist

### Phase A: Setup & Assets (30 minutes)

- [ ] **A1**: Create background images directory
  ```bash
  mkdir -p strava-recap/public/flyer/tn
  ```

- [ ] **A2**: Add 9 themed background images (1080x1920px PNG)
  - [ ] `running.png`
  - [ ] `trail-running.png`
  - [ ] `indoor.png`
  - [ ] `cycling.png`
  - [ ] `ski.png`
  - [ ] `hiking.png`
  - [ ] `walking.png`
  - [ ] `strengthtraining.png`
  - [ ] `workout.png`
  
  **Note**: Images should be optimized (<400KB each). Use tools like TinyPNG or ImageOptim.

- [ ] **A3**: Verify existing dependencies
  ```bash
  cd strava-recap
  npm list html-to-image  # Should already be installed
  ```

---

### Phase B: Core Utilities (45 minutes)

- [ ] **B1**: Create activity group mapping (`src/utils/activityGroups.ts`)
  - [ ] Define `ActivityGroup` type
  - [ ] Create `ACTIVITY_GROUP_REGISTRY` with metadata
  - [ ] Implement `ACTIVITY_TYPE_TO_GROUP_MAP`
  - [ ] Export `getActivityGroup(activityType)` function
  - [ ] Implement `determineTopGroup(breakdown, activities)` with tie-breaking logic

  **Validation**: Test tie-breaking with unit tests
  ```typescript
  // Test: Equal counts → most recent wins
  // Test: Equal counts + dates → total duration wins
  // Test: All equal → priority order wins
  ```

- [ ] **B2**: Create flyer stats utilities (`src/utils/flyerStats.ts`)
  - [ ] Implement `computeAggregates(activities)` function
  - [ ] Implement `selectFlyerStats(aggregates, unitPreference)` function
  - [ ] Reuse existing `formatDistance()` and `formatDuration()` from `utils/format.ts`

  **Validation**: Test with zero/non-zero values, ensure 3-5 stats returned

- [ ] **B3**: Create PNG export utility (`src/utils/flyerExport.ts`)
  - [ ] Import `toPng` from `html-to-image`
  - [ ] Implement `downloadFlyerAsPng(element, filename)` function
  - [ ] Set pixelRatio: 2 for high DPI
  - [ ] Set dimensions: 1080x1920
  - [ ] Handle errors gracefully

  **Validation**: Test with sample element, verify PNG quality and dimensions

---

### Phase C: Data Hook (30 minutes)

- [ ] **C1**: Create flyer data hook (`src/hooks/useFlyerData.ts`)
  - [ ] Accept query params (type, days, unit, offset)
  - [ ] Use existing RTK Query `api.ts` recap endpoint
  - [ ] Transform `RecapResponseDto` → `FlyerData`
  - [ ] Return `{ data, isLoading, error }`

  **Implementation Pattern**:
  ```typescript
  export function useFlyerData(params: RecapQuery) {
    const { data: recapData, isLoading, error } = useFetchRecap(params);
    const { athleteProfile } = useAthleteProfile();
    
    const flyerData = useMemo(() => {
      if (!recapData || !athleteProfile) return null;
      return transformToFlyerData(recapData, athleteProfile);
    }, [recapData, athleteProfile]);
    
    return { data: flyerData, isLoading, error };
  }
  ```

  **Validation**: Test with valid/invalid params, verify transformation

---

### Phase D: UI Components (1 hour)

- [ ] **D1**: Create alignment selector (`src/ui/AlignmentSelector.tsx`)
  - [ ] Render 3 buttons: Left, Right, Bottom
  - [ ] Highlight active selection
  - [ ] Call `onChange` when clicked
  - [ ] Use icons/emojis for visual clarity

  **Styling**: Bootstrap button group or custom CSS

- [ ] **D2**: Create stats overlay (`src/ui/FlyerStats.tsx`)
  - [ ] Accept `stats` and `alignment` props
  - [ ] Render stats in semi-transparent cards
  - [ ] Apply alignment CSS classes: `.stats-left`, `.stats-right`, `.stats-bottom`
  - [ ] Use flexbox: `flex-direction: column` for left/right, `row` for bottom

  **Styling**:
  ```css
  .flyer-stat-card {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 1rem;
    margin: 0.5rem;
  }
  
  .stats-left {
    position: absolute;
    left: 2rem;
    top: 12rem;
    display: flex;
    flex-direction: column;
  }
  
  .stats-right {
    position: absolute;
    right: 2rem;
    top: 12rem;
    display: flex;
    flex-direction: column;
  }
  
  .stats-bottom {
    position: absolute;
    bottom: 2rem;
    left: 2rem;
    right: 2rem;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
  }
  ```

- [ ] **D3**: Create flyer generator (`src/components/FlyerGenerator.tsx`)
  - [ ] Accept `data` and `alignment` props
  - [ ] Forward ref for PNG export
  - [ ] Render background image: `<img src={data.topGroup.backgroundPath} />`
  - [ ] Overlay athlete name: `"[firstName]'s Insights"` in italic font
  - [ ] Overlay date range below name
  - [ ] Render `<FlyerStats />` with alignment
  - [ ] Set container dimensions: 1080x1920px (for export)

  **Layout**:
  ```tsx
  <div ref={exportRef} className="flyer-container" style={{ width: 1080, height: 1920 }}>
    <img src={backgroundPath} alt="Background" className="flyer-background" />
    <div className="flyer-header">
      <h1 className="flyer-title">{firstName}'s Insights</h1>
      <p className="flyer-date-range">{range.label}</p>
    </div>
    <FlyerStats stats={stats} alignment={alignment} />
  </div>
  ```

---

### Phase E: Flyer Page (45 minutes)

- [ ] **E1**: Create flyer page (`src/pages/FlyerPage.tsx`)
  - [ ] Use `useSearchParams()` to read query params
  - [ ] Call `useFlyerData(params)`
  - [ ] Manage alignment state: `useState<FlyerAlignment>('right')`
  - [ ] Create ref: `useRef<HTMLDivElement>(null)` for export
  - [ ] Render loading state while fetching
  - [ ] Render error state if API fails or no activities
  - [ ] Render `<AlignmentSelector />` above flyer
  - [ ] Render `<FlyerGenerator />` with data and ref
  - [ ] Render "Download PNG" button

  **Download Handler**:
  ```typescript
  const handleDownload = async () => {
    if (!exportRef.current || !data) return;
    
    const filename = `${data.athlete.firstName}_${data.topGroup}_${data.range.label.replace(/\s/g, '_')}.png`;
    
    try {
      await downloadFlyerAsPng(exportRef.current, filename);
    } catch (error) {
      setError('EXPORT_ERROR');
    }
  };
  ```

- [ ] **E2**: Add route to `App.tsx`
  ```tsx
  <Route path="/flyer" element={<FlyerPage />} />
  ```

- [ ] **E3**: Wrap page in `<PageShell>` (existing component)
  - Use page title: "Activity Flyer"
  - Include provider badge if connected

---

### Phase F: Recap Page Integration (15 minutes)

- [ ] **F1**: Add "Create Flyer" button to `RecapPage.tsx` header
  - [ ] Import `useSearchParams` and `Link` from react-router-dom
  - [ ] Get current search params: `const [searchParams] = useSearchParams()`
  - [ ] Render button in header section (right side)
  - [ ] Link to: `/flyer?${searchParams.toString()}`
  - [ ] Disable/hide button when `activities.length === 0`

  **Implementation**:
  ```tsx
  const [searchParams] = useSearchParams();
  const hasActivities = data?.activities?.length > 0;
  
  return (
    <PageShell 
      title="Recap"
      headerAction={
        hasActivities ? (
          <Link to={`/flyer?${searchParams.toString()}`} className="btn btn-primary">
            🎨 Create Flyer
          </Link>
        ) : null
      }
    >
      {/* existing recap content */}
    </PageShell>
  );
  ```

- [ ] **F2**: Update `PageShell.tsx` to accept optional `headerAction` prop
  - Add `headerAction?: React.ReactNode` to props
  - Render in header alongside title

---

### Phase G: Testing & Validation (30 minutes)

- [ ] **G1**: Unit tests for utilities
  ```bash
  npm test -- activityGroups.test.ts
  npm test -- flyerStats.test.ts
  ```

- [ ] **G2**: Manual testing scenarios
  - [ ] Test with last 7 days (small dataset)
  - [ ] Test with last 30 days (typical use case)
  - [ ] Test with this year (large dataset)
  - [ ] Test with no activities (error state)
  - [ ] Test all 3 alignment options
  - [ ] Test PNG download (verify filename and image quality)
  - [ ] Test on different backgrounds (all 9 groups if possible)

- [ ] **G3**: Browser compatibility
  - [ ] Chrome (should work)
  - [ ] Firefox (should work)
  - [ ] Safari (verify html-to-image compatibility)
  - [ ] Edge (should work)

- [ ] **G4**: Performance validation
  - [ ] Flyer page loads <2s (SC-001)
  - [ ] PNG download completes <5s (SC-002)
  - [ ] Alignment changes are instant (SC-011)

---

## Development Workflow

### Local Development

1. Start dev servers:
   ```bash
   # Terminal 1: Frontend
   cd strava-recap
   npm run dev
   
   # Terminal 2: Backend
   cd strava-recap-api
   func host start
   
   # Terminal 3: SWA emulator
   swa start http://localhost:5173 --api-devserver-url http://localhost:7071
   ```

2. Navigate to `http://localhost:4280`

3. Generate a recap → Click "Create Flyer" → Verify flyer renders

### Debugging Tips

- **Background image not loading**: Check browser DevTools Network tab, verify path
- **Stats not displaying**: Check browser console for errors in aggregation logic
- **PNG export fails**: Verify `html-to-image` is installed, check element ref
- **Alignment not working**: Inspect CSS classes, verify flexbox layout

---

## Common Pitfalls

### ❌ Pitfall 1: Forgetting to handle empty activities
**Solution**: Always check `activities.length === 0` before determining top group

### ❌ Pitfall 2: Using wrong image dimensions
**Solution**: Ensure background images are exactly 1080x1920px (9:16 ratio)

### ❌ Pitfall 3: Not setting explicit container dimensions
**Solution**: FlyerGenerator must have `style={{ width: 1080, height: 1920 }}` for consistent export

### ❌ Pitfall 4: Forgetting cacheBust in html-to-image
**Solution**: Always set `cacheBust: true` to avoid stale background images

### ❌ Pitfall 5: Not preserving query params in navigation
**Solution**: Use `searchParams.toString()` when linking to /flyer

---

## File Structure Reference

```
strava-recap/
├── public/
│   └── flyer/
│       └── tn/
│           ├── running.png          ← Add
│           ├── trail-running.png    ← Add
│           ├── indoor.png           ← Add
│           ├── cycling.png          ← Add
│           ├── ski.png              ← Add
│           ├── hiking.png           ← Add
│           ├── walking.png          ← Add
│           ├── strengthtraining.png ← Add
│           └── workout.png          ← Add
├── src/
│   ├── utils/
│   │   ├── activityGroups.ts        ← Create
│   │   ├── flyerStats.ts            ← Create
│   │   └── flyerExport.ts           ← Create
│   ├── hooks/
│   │   └── useFlyerData.ts          ← Create
│   ├── components/
│   │   └── FlyerGenerator.tsx       ← Create
│   ├── ui/
│   │   ├── FlyerStats.tsx           ← Create
│   │   ├── AlignmentSelector.tsx    ← Create
│   │   └── PageShell.tsx            ← Modify (add headerAction prop)
│   ├── pages/
│   │   ├── FlyerPage.tsx            ← Create
│   │   └── RecapPage.tsx            ← Modify (add Create Flyer button)
│   └── App.tsx                      ← Modify (add /flyer route)
└── tests/
    └── utils/
        ├── activityGroups.test.ts   ← Create
        └── flyerStats.test.ts       ← Create
```

---

## Definition of Done

✅ All background images added and optimized  
✅ All utility functions implemented and tested  
✅ All UI components render correctly  
✅ Flyer page loads with correct data transformation  
✅ PNG export works in all major browsers  
✅ All 3 alignment options work correctly  
✅ "Create Flyer" button appears in RecapPage header  
✅ Error states handled gracefully  
✅ Performance targets met (SC-001, SC-002, SC-011)  
✅ Manual testing complete across all scenarios  
✅ Code reviewed and merged to `001-activity-flyer` branch

---

## Next Steps After Implementation

1. **User Testing**: Share with beta users, gather feedback on alignment preferences
2. **Analytics**: Track flyer generation rate, download rate, most popular groups
3. **Phase 2 Planning**: Consider additional features:
   - Custom background upload
   - Text editing (athlete name, custom tagline)
   - Multiple flyer formats (square, landscape)
   - Social media integration (direct posting)

---

## Support & Resources

- **Spec**: [spec.md](../spec.md)
- **Data Model**: [data-model.md](../data-model.md)
- **API Contracts**: [contracts/README.md](../contracts/README.md)
- **Research**: [research.md](../research.md)
- **html-to-image Docs**: https://github.com/bubkoo/html-to-image
- **React Router v7 Docs**: https://reactrouter.com/

**Estimated Total Time**: 2-3 hours for experienced React developer

**Questions?** Refer to research.md for technical decisions and rationale.
