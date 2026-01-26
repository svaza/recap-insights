# Strava Recap - GitHub Copilot Instructions

## Project Overview

**Strava Recap** is a full-stack web application that generates personalized activity recaps from Strava and Intervals.icu data. The application follows a modern architecture with a React TypeScript frontend hosted on Azure Static Web Apps and a .NET 8 Azure Functions backend API.

### Key Features
- Multi-provider OAuth integration (Strava and Intervals.icu)
- Activity analytics with flexible time windows (rolling days, monthly, yearly)
- Visual recap generation with downloadable posters and flyers
- "Wow" moments highlighting biggest achievements
- Responsive design for desktop and mobile

---

## Technology Stack

### Frontend (strava-recap/)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **State Management**: Redux Toolkit with RTK Query
- **Routing**: React Router v7
- **Styling**: CSS Modules and plain CSS
- **Image Generation**: html-to-image for downloadable recaps
- **Linting**: ESLint 9

### Backend (strava-recap-api/)
- **Runtime**: .NET 8 (C#)
- **Framework**: Azure Functions v4 (isolated worker process)
- **HTTP**: ASP.NET Core integration for Azure Functions
- **DI**: Built-in Microsoft.Extensions.DependencyInjection
- **Logging**: Application Insights
- **Hosting**: Azure Static Web Apps with Functions backend

---

## Architecture Patterns

### Provider Pattern (Backend)
The API uses a **provider pattern** to support multiple activity data sources:
- `IProvider` interface defines contract for all providers
- `ProviderFactory` resolves providers based on type
- `ProviderRegistry` manages provider instances
- Each provider bundles its own `IAuthService`, `ITokenService`, `IActivityService`, and `IAthleteProfileService`

**Supported Providers**:
- `StravaProvider` (default)
- `IntervalsIcuProvider`
- `MockProvider` (development/testing)

### Service Layer Architecture
Services are organized by provider and responsibility:
```
Services/
├── IActivityService.cs
├── IAthleteProfileService.cs
├── IAuthService.cs
├── ITokenService.cs
├── Strava/
│   ├── StravaActivityService.cs
│   ├── StravaAthleteProfileService.cs
│   ├── StravaAuthService.cs
│   └── StravaTokenService.cs
├── IntervalsIcu/
│   └── [similar structure]
└── Mock/
    └── [similar structure]
```

### Frontend State Management
- **RTK Query** (`src/store/api.ts`) for all API communication
- **Redux Store** (`src/store/store.ts`) configured with RTK Query middleware
- Custom hooks (`useAthleteProfile`, `useFetchRecap`) abstract API interactions
- Session storage caching for API responses

---

## Code Style & Conventions

### TypeScript/React
- **Functional components** with hooks (no class components)
- **Named exports** for pages and utilities, **default exports** for App.tsx
- **Type safety**: Prefer explicit types over `any`
- **File naming**: 
  - PascalCase for components (`SelectPage.tsx`, `WowCarousel.tsx`)
  - camelCase for utilities (`recapQuery.ts`, `format.ts`)
- **Component structure**:
  ```tsx
  // Imports
  import { useState } from "react";
  
  // Types
  type Props = { ... };
  
  // Component
  export default function ComponentName({ props }: Props) {
    // Hooks
    // Event handlers
    // Render
  }
  ```

### C# Backend
- **Target Framework**: net8.0
- **Naming Conventions**:
  - PascalCase for classes, methods, properties
  - camelCase for private fields with underscore prefix (`_logger`)
  - Interfaces prefixed with `I` (`IProvider`, `IActivityService`)
- **Null Safety**: Nullable reference types enabled (`<Nullable>enable</Nullable>`)
- **Async/Await**: All I/O operations are async
- **Dependency Injection**: Constructor injection for all services
- **Function Structure**:
  ```csharp
  [Function("FunctionName")]
  public async Task<HttpResponseData> Run(
      [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "route")] HttpRequestData req)
  {
      // Implementation
  }
  ```

### Error Handling
- Backend: Return structured error responses, log errors with context
- Frontend: RTK Query handles errors; display user-friendly messages
- Use `ActivityResult` for service-layer responses with `Success` flag

### Authentication
- OAuth flow handled via provider-specific auth services
- Tokens stored in HTTP-only cookies
- Access token and refresh token with expiration tracking
- Cookie naming: `access_token`, `refresh_token`, `expires_in`, `provider`

---

## Key Files & Their Purposes

### Frontend Critical Files
- **`src/App.tsx`**: Main routing configuration
- **`src/store/api.ts`**: RTK Query API definitions and endpoints
- **`src/pages/SelectPage.tsx`**: Time window selection UI
- **`src/pages/RecapPage.tsx`**: Main recap display with stats and visualizations
- **`src/pages/ProviderCallbackPage.tsx`**: OAuth callback handler
- **`src/ui/RecapPoster.tsx`**: Shareable poster component
- **`src/ui/WowCarousel.tsx`**: Highlights carousel
- **`vite.config.ts`**: Vite build configuration
- **`public/staticwebapp.config.json`**: Azure SWA routing rules

### Backend Critical Files
- **`Program.cs`**: DI container setup and function app configuration
- **`RecapFunction.cs`**: Main recap endpoint `/api/recap`
- **`ProviderConnectFunction.cs`**: OAuth initiation `/api/provider/connect`
- **`ProviderCallbackFunction.cs`**: OAuth callback `/api/provider/callback`
- **`AthleteProfileFunction.cs`**: User profile endpoint `/api/me`
- **`DisconnectFunction.cs`**: Logout endpoint `/api/disconnect`
- **`Providers/IProvider.cs`**: Provider contract
- **`Providers/ProviderFactory.cs`**: Provider resolution
- **`Extensions/RecapExtensions.cs`**: Activity aggregation helpers

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/recap` | Fetch activities and recap data |
| GET | `/api/me` | Get authenticated athlete profile |
| GET | `/api/provider/connect` | Initiate OAuth flow |
| GET | `/api/provider/callback` | Handle OAuth callback |
| POST | `/api/disconnect` | Clear auth cookies |

### Query Parameters
- **Recap**: `type=rolling&days=30` or `unit=month` or `unit=year&offset=-1`
- **Provider Connect**: `provider=strava` or `provider=intervalsicu`

---

## Development Workflow

### Running Locally
Use VS Code tasks (preferred):
1. **`dev:all`**: Runs frontend, backend, and SWA CLI together
   - Vite dev server → `http://localhost:5173`
   - Azure Functions → `http://localhost:7071`
   - SWA emulator → `http://localhost:4280` (unified access)

Or run individually:
- Frontend: `npm run dev` in `strava-recap/`
- Backend: `func host start --port 7071` in `strava-recap-api/`
- SWA: `swa start http://localhost:5173 --api-devserver-url http://localhost:7071 --port 4280`

### Configuration
- **Backend**: `local.settings.json` contains auth secrets (gitignored)
  ```json
  {
    "AuthenticationOptions": {
      "StravaClientId": "...",
      "StravaClientSecret": "...",
      "IntervalsIcuClientId": "...",
      "IntervalsIcuClientSecret": "..."
    }
  }
  ```
- **Frontend**: No environment variables needed for local dev

### Building
- Frontend: `npm run build` → outputs to `dist/`
- Backend: `dotnet publish` → outputs to `bin/Release/net8.0/publish/`

---

## Common Tasks & Guidelines

### Adding a New Provider
1. Create `Providers/NewProvider.cs` implementing `IProvider`
2. Add to `ProviderType` enum and extensions
3. Implement four services: Auth, Token, AthleteProfile, Activity
4. Register in `Program.cs` DI container
5. Add provider to `ProviderRegistry`
6. Update frontend `utils/provider.ts` and add connect button

### Adding New Azure Function
1. Create `[FunctionName]Function.cs` class
2. Use `[Function("Name")]` and `[HttpTrigger]` attributes
3. Inject dependencies via constructor
4. Return `HttpResponseData` with appropriate status codes
5. Use extension methods from `HttpRequestDataExtensions.cs`

### Adding New UI Component
1. Create in `src/ui/[ComponentName].tsx`
2. Use TypeScript for props interface
3. Follow existing styling patterns (CSS Modules for complex styles)
4. Export as named or default based on usage pattern

### Modifying Recap Logic
- Activity aggregation: `Extensions/RecapExtensions.cs`
- Breakdown by type: `ToBreakdown()` extension method
- Highlights: `ToHighlights()` extension method
- Date range calculation: `RecapRequest.ComputeDateRange()`

### Working with Activities
- Backend entity: `ActivitySummary` (internal model)
- API DTO: `ActivitySummaryDto` (external contract)
- Frontend type: `ActivityItem` (from API response)
- Conversion: Use `.ToDto()` extension methods

---

## Testing & Debugging

### Frontend Debugging
- Use browser DevTools
- Redux DevTools Extension for state inspection
- Check Network tab for API calls
- Storage caching in sessionStorage

### Backend Debugging
- Attach VS Code debugger to Azure Functions host
- Check logs in terminal output
- Use Application Insights for production
- Test endpoints via REST client or Postman

### Common Issues
- **CORS**: SWA CLI proxies API calls; ensure running through port 4280
- **Auth failures**: Check `local.settings.json` credentials
- **Provider errors**: Verify provider type in cookies matches registered provider
- **Refresh token expired**: Reconnect via OAuth flow

---

## Important Rules

### DO
✅ Use the provider pattern for multi-provider support  
✅ Follow existing naming conventions strictly  
✅ Keep services focused and single-responsibility  
✅ Use extension methods for reusable logic  
✅ Maintain type safety across TypeScript and C#  
✅ Cache API responses appropriately on frontend  
✅ Log meaningful context in backend functions  
✅ Handle rate limiting from external APIs  
✅ Use RTK Query for all API communication  

### DON'T
❌ Mix provider logic between different providers  
❌ Store sensitive data in frontend local storage  
❌ Use `any` type in TypeScript  
❌ Hardcode OAuth credentials  
❌ Skip null checks in C# (nullable types enabled)  
❌ Make synchronous I/O calls in backend  
❌ Bypass the provider factory pattern  
❌ Use class components in React  
❌ Store auth tokens in frontend JavaScript accessible storage  

---

## Performance Considerations

- **Activity Pagination**: Backend fetches max 200 activities per page, up to 30 pages
- **Caching**: Frontend caches recap responses in sessionStorage with timestamps
- **Rate Limiting**: Track API rate limits via `RateLimitInfo` entity
- **Image Generation**: Use `html-to-image` with appropriate scaling for performance
- **Bundle Size**: Code split routes with React Router lazy loading (if needed)

---

## Deployment

### Azure Static Web Apps
- Build frontend: `npm run build` in `strava-recap/`
- Build backend: `dotnet publish --configuration Release` in `strava-recap-api/`
- Deploy via GitHub Actions or Azure CLI
- Configure app settings in Azure portal for auth secrets

### Environment Variables (Production)
Set in Azure SWA configuration:
- `AuthenticationOptions__StravaClientId`
- `AuthenticationOptions__StravaClientSecret`
- `AuthenticationOptions__IntervalsIcuClientId`
- `AuthenticationOptions__IntervalsIcuClientSecret`

---

## Additional Context

### Date Handling
- Always use `DateTimeOffset` with UTC in backend
- Frontend receives ISO 8601 strings, parse with `new Date()`
- Time zones: Store and process in UTC, display in user's local time

### Activity Types
- Mapping defined in `utils/activityTypes.ts`
- Supports Runs, Rides, Swims, Workouts, etc.
- Each type has emoji and description for UI

### Recap Windows

The application supports multiple time window options for generating recaps. Period selection is handled in [SelectPage.tsx](../strava-recap/src/pages/SelectPage.tsx), and date range computation is in [RecapRequest.cs](../strava-recap-api/Entities/RecapRequest.cs).

#### Supported Period Options

1. **Last 7 Days** (Rolling)
   - Query: `type=rolling&days=7`
   - Logic: From `now - 7 days` to `now`
   - Use case: Quick weekly check-in

2. **Last 30 Days** (Rolling)
   - Query: `type=rolling&days=30`
   - Logic: From `now - 30 days` to `now`
   - Use case: Monthly progress tracking

3. **This Month** (Calendar)
   - Query: `type=calendar&unit=month`
   - Logic: From `first day of current month` to `now`
   - Use case: Current month-to-date stats

4. **This Year** (Calendar)
   - Query: `type=calendar&unit=year`
   - Logic: From `January 1 of current year` to `now`
   - Use case: Year-to-date achievements

5. **Last Year** (Calendar with Offset)
   - Query: `type=calendar&unit=year&offset=-1`
   - Logic: From `January 1 of previous year` to `December 31 of previous year`
   - Use case: Full previous calendar year recap

#### Date Range Computation Rules

- **Rolling Windows**: 
  - Accepts `days` parameter (clamped to 1-365)
  - Always ends at current UTC time
  - Starts at `now - days`

- **Calendar Month**:
  - Starts at 00:00:00 UTC on the 1st of the month
  - Ends at current UTC time
  - Default when no type specified

- **Calendar Year (Current)**:
  - Starts at 00:00:00 UTC on January 1 of current year
  - Ends at current UTC time
  - Used when `unit=year` without offset

- **Calendar Year (Offset)**:
  - Calculates target year as `current year + offset`
  - Starts at 00:00:00 UTC on January 1 of target year
  - Ends at 23:59:59 UTC on December 31 of target year
  - Used for complete historical years (e.g., offset=-1 for last year)

All date calculations use `DateTimeOffset.UtcNow` and store times in UTC.

### Visual Recaps
- Generated using `html-to-image` library
- Two formats: Poster (tall) and Flyer (wide)
- Download as PNG with athlete name in filename

---

## Questions? Need Help?

When assisting with this project:
1. Check existing patterns in similar files first
2. Maintain consistency with established conventions
3. Consider multi-provider support for new features
4. Keep frontend and backend types in sync
5. Test OAuth flows end-to-end when modifying auth

**Last Updated**: January 2026
