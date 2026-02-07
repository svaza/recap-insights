# Strava Recap - GitHub Copilot Instructions

## Project Overview

**Strava Recap** is a full-stack web app that builds privacy-first training recaps from Strava and Intervals.icu.

Recent product capabilities (February 2026):
- Multi-provider OAuth with provider-aware callbacks and disconnect
- Recap windows for rolling and calendar periods, including **last month**
- Activity-type filtering inside recap (`activityType` query param)
- Totals breakdown modal and richer training insights
- Activity heatmap with per-day effort scoring
- Config-driven in-app release notes modal and version migration flow
- Flyer generation with save/share support (including iOS Safari fallback handling)

---

## Technology Stack

### Frontend (`strava-recap/`)
- React 19 + TypeScript 5.9
- Vite 7
- Redux Toolkit + RTK Query
- React Router 7
- Plain CSS + targeted CSS modules
- `html-to-image` for flyer/poster exports
- ESLint 9

### Backend (`strava-recap-api/`)
- .NET 8 / C#
- Azure Functions v4 (isolated worker)
- ASP.NET Core HTTP integration
- Built-in DI (`Microsoft.Extensions.DependencyInjection`)
- Application Insights telemetry

---

## Architecture Patterns

### 1. Provider Pattern (Backend)
- `IProvider` is the contract for provider implementations.
- `ProviderFactory` resolves providers by `ProviderType`.
- `ProviderRegistry` stores provider instances for keyed lookup.
- Each provider supplies:
  - `IAuthService`
  - `ITokenService`
  - `IAthleteProfileService`
  - `IActivityService`

Supported providers:
- `StravaProvider`
- `IntervalsIcuProvider`
- `Mock` services (development-oriented)

### 2. Recap Request/Response Contract
`GET /api/recap` builds `RecapRequest` from cookies + query params:
- `type=rolling&days=...`
- `type=calendar&unit=month|year&offset=...`
- optional `activityType=...`

Response includes:
- `connected`
- `provider`
- `range` (`startUtc`, `endUtc`)
- `total`
- `availableActivityTypes`
- `breakdown`
- `activeDays`
- `activityDays` (per-day heatmap payload)
- `highlights`

### 3. Frontend Data and Cache Flow
- RTK Query endpoints in `src/store/api.ts`:
  - `getProfile`
  - `getRecap`
  - `disconnect`
- Recap/profile cache uses **localStorage** with `recapcache:` prefix.
- Query-specific recap cache key: `recapcache:activities-summary:v5`.
- Additional client storage keys:
  - `recap.units`
  - `recap.activityType`
  - `recap.release.version`
  - `select.periodId` (sessionStorage)

### 4. Release Notes + Version Migration Flow
- Release metadata lives in `src/config/releases.ts`.
- App startup compares `recap.release.version` vs `CURRENT_APP_VERSION`.
- On mismatch, app:
  1. clears recap cache keys,
  2. calls `POST /api/disconnect`,
  3. opens release notes modal.
- `/releases` route opens the modal and redirects to `/select`.

### 5. Recap UI Composition
- `RecapPage` sections: totals, heatmap, insights, wow highlights, breakdown.
- Activity filter and totals breakdown modal are first-class recap controls.
- Heatmap uses `activityDays`; if data is absent it can render mock/fallback behavior for presentation contexts.

---

## Code Style and Conventions

### TypeScript / React
- Functional components + hooks only.
- Keep parsing/normalization near the data boundary (`store/api.ts`, hooks).
- Prefer explicit unions/types over `any`.
- File naming:
  - PascalCase components (`RecapPage.tsx`, `ActivityHeatmap.tsx`)
  - camelCase utilities (`recapQuery.ts`, `storageCache.ts`)

### C# / Azure Functions
- Target `net8.0`, nullable enabled.
- Constructor injection for all service dependencies.
- Async for all network/file I/O.
- Keep HTTP functions thin; push reusable logic into extension/service layers.

### Date and Time Handling
- Backend computes ranges with `DateTimeOffset.UtcNow`.
- Backend returns ISO-8601 UTC strings.
- Day keys are `YYYY-MM-DD` and used by `activeDays`/`activityDays`.

---

## Authentication and Security Notes

- OAuth connect flow:
  - `GET /api/provider/connect?provider=...&returnTo=...`
  - sets `recap_oauth_state` cookie and redirects to provider auth URL
- Callback flow:
  - frontend callback page forwards `code` as `authCode` to backend callback endpoint
  - backend validates state and sets auth cookies
- Cookie names currently used:
  - `recap_access_token`
  - `recap_expires_at`
  - `recap_provider`
  - `recap_oauth_state`
- Tokens are never stored in frontend-accessible JS state.

---

## Key Files and Responsibilities

### Frontend
- `strava-recap/src/App.tsx`: routes + release-version migration + modal wiring
- `strava-recap/src/config/releases.ts`: release timeline config and current version metadata
- `strava-recap/src/context/ReleaseNotesDialogContext.tsx`: global open/close actions for release notes
- `strava-recap/src/ui/ReleaseNotesModal.tsx`: release notes timeline UI
- `strava-recap/src/pages/SelectPage.tsx`: recap window selection including last-month option
- `strava-recap/src/pages/RecapPage.tsx`: recap rendering, filter controls, totals breakdown, heatmap integration
- `strava-recap/src/ui/ActivityHeatmap.tsx`: heatmap grid, tooltip, effort legend/help modal
- `strava-recap/src/store/api.ts`: RTK Query API contracts + response normalization
- `strava-recap/src/hooks/useFetchRecap.ts`: recap query adapter for page usage
- `strava-recap/src/hooks/useFlyerData.ts`: flyer data shaping from recap payload
- `strava-recap/src/ui/FlyerGenerator.tsx`: export/save/share flow with mobile/iOS safeguards
- `strava-recap/src/utils/recapQuery.ts`: recap URL build/parse helpers

### Backend
- `strava-recap-api/Program.cs`: DI/service/provider registration
- `strava-recap-api/RecapFunction.cs`: recap endpoint and response assembly
- `strava-recap-api/ProviderConnectFunction.cs`: OAuth initiation
- `strava-recap-api/ProviderCallbackFunction.cs`: OAuth callback completion
- `strava-recap-api/DisconnectFunction.cs`: revoke + clear auth cookies
- `strava-recap-api/AthleteProfileFunction.cs`: profile endpoint
- `strava-recap-api/Extensions/HttpRequestDataExtensions.cs`: cookie/query/state helpers
- `strava-recap-api/Extensions/RecapExtensions.cs`: totals, breakdown, highlights, heatmap day calculations
- `strava-recap-api/Entities/RecapRequest.cs`: date-range + activity-type request model
- `strava-recap-api/Models/RecapResponseDto.cs`: recap response contract

---

## API Endpoints

| Method | Route | Notes |
| --- | --- | --- |
| GET | `/api/recap` | Returns recap payload (`connected` false if auth missing/expired) |
| GET | `/api/me` | Returns provider + athlete profile if connected |
| GET | `/api/provider/connect` | Starts OAuth flow (`provider`, optional `returnTo`) |
| GET | `/api/provider/callback` | Finalizes OAuth callback (`authCode`, `state`) |
| POST | `/api/disconnect` | Revokes token when possible and clears recap cookies |

Recap query examples:
- `type=rolling&days=7`
- `type=rolling&days=30`
- `type=calendar&unit=month`
- `type=calendar&unit=month&offset=-1`
- `type=calendar&unit=year`
- `type=calendar&unit=year&offset=-1`
- Add `activityType=Run` (or other type) to scope recap results

---

## Development Workflow

Preferred local run path:
1. VS Code task `dev:all` (runs Vite + Functions + SWA emulator)
2. Access app at `http://localhost:4280`

Direct commands:
- Frontend: `npm run dev` (in `strava-recap/`)
- Backend: `func host start --port 7071` (in `strava-recap-api/`)
- SWA proxy: `swa start http://localhost:5173 --api-devserver-url http://localhost:7071 --port 4280`

Build commands:
- Frontend: `npm run build`
- Backend: `dotnet publish`

---

## Configuration

Backend config keys (local.settings / app settings):
- `AuthenticationOptions:RedirectUri`
- `AuthenticationOptions:Providers:Strava:ClientId`
- `AuthenticationOptions:Providers:Strava:ClientSecret`
- `AuthenticationOptions:Providers:IntervalsIcu:ClientId`
- `AuthenticationOptions:Providers:IntervalsIcu:ClientSecret`

Production env var equivalents:
- `AuthenticationOptions__RedirectUri`
- `AuthenticationOptions__Providers__Strava__ClientId`
- `AuthenticationOptions__Providers__Strava__ClientSecret`
- `AuthenticationOptions__Providers__IntervalsIcu__ClientId`
- `AuthenticationOptions__Providers__IntervalsIcu__ClientSecret`

---

## Implementation Guidance for New Changes

### Adding/Changing Recap Metrics
1. Update backend aggregation in `RecapExtensions.cs`.
2. Extend DTOs in `strava-recap-api/Models/`.
3. Normalize in `strava-recap/src/store/api.ts`.
4. Surface in UI (`RecapPage.tsx`, related UI components).
5. Verify activity-filter behavior still works for the new metric.

### Adding New Release Notes
1. Add entry in `strava-recap/src/config/releases.ts`.
2. Bump `CURRENT_APP_VERSION`.
3. Confirm startup migration behavior is still intentional for that release.

### Extending Recap Query Options
1. Update frontend parse/build helpers (`recapQuery.ts`).
2. Update `RecapRequest.ComputeDateRange(...)` and request parsing.
3. Keep frontend labels (`formatRangeLabel`) in sync with backend range semantics.

---

## Common Pitfalls

- Do not reintroduce stale cache semantics (`sessionStorage` for recap cache is incorrect).
- Do not hardcode old cookie names (`access_token`, etc. are outdated here).
- Do not break `returnTo` handling in provider connect/callback flow.
- Do not assume heatmap can rely only on `activeDays`; it now uses `activityDays`.
- Do not forget to validate behavior when `activityType` is absent/invalid.

---

## Last Updated

**February 2026**
