# Strava Recap - Project Constitution

## Mission Statement

**Strava Recap** empowers athletes to visualize and celebrate their achievements by transforming raw activity data into meaningful, shareable insights. We believe that every workout, ride, and run tells a story worth celebrating.

---

## Core Values

### 1. **User Privacy First**
- **Never persist activity history server-side**: Recap generation is on-demand, and activity history is not stored on backend infrastructure
- **Scoped browser caching only**: Recap summaries may be cached in browser storage for performance and can be cleared by the user
- **Secure authentication**: OAuth tokens stored in HTTP-only cookies, never exposed to frontend JavaScript
- **Transparent data usage**: Users understand exactly what data is accessed and how it's used
- **Right to disconnect**: Users can revoke access at any time with complete data cleanup

### 2. **Developer Experience**
- **Clear separation of concerns**: Frontend, backend, and providers are distinctly separated
- **Type safety everywhere**: Strong typing in both TypeScript and C# reduces runtime errors
- **Self-documenting code**: Meaningful names, clear interfaces, and comprehensive XML docs
- **Easy local development**: One-command setup to run the full stack locally

### 3. **Performance & Reliability**
- **Fast feedback loops**: Recaps generate in seconds, not minutes
- **Graceful degradation**: Handle API rate limits and failures without breaking the experience
- **Efficient pagination**: Fetch only what's needed, respect external API limits
- **Client-side caching**: Smart caching reduces unnecessary API calls

### 4. **Extensibility**
- **Provider pattern**: Adding new activity data sources should be straightforward
- **Pluggable services**: Each provider brings its own auth, token, and activity services
- **Open for extension**: New features can be added without breaking existing functionality
- **Consistent interfaces**: All providers implement the same contract

### 5. **Insight Explainability & Product Clarity**
- **Explain derived metrics**: New visualizations (for example heatmap effort levels) must include plain-language explanations
- **Communicate product changes**: User-visible releases should be documented in-app via versioned release notes
- **Safe migrations**: Version changes that alter recap semantics should trigger cache reset and re-auth safeguards

---

## Architectural Principles

### Backend Architecture

#### **1. Provider Abstraction**
All activity data sources must implement the `IProvider` interface:
```csharp
public interface IProvider
{
    ProviderType ProviderType { get; }
    IAuthService AuthService { get; }
    ITokenService TokenService { get; }
    IAthleteProfileService AthleteProfileService { get; }
    IActivityService ActivityService { get; }
}
```

**Rationale**: This ensures consistent behavior across all data sources and makes adding new providers predictable.

#### **2. Azure Functions Isolated Worker Process**
- Functions run in isolated process, not in-proc
- Uses ASP.NET Core integration for HTTP handling
- Enables dependency injection and middleware

**Rationale**: Isolated worker process provides better performance, isolation, and aligns with Azure's recommended approach.

#### **3. Dependency Injection for Everything**
- All services registered in `Program.cs`
- Constructor injection for testability
- Scoped lifetime for per-request services

**Rationale**: DI makes code testable, maintainable, and follows .NET best practices.

#### **4. Extension Methods for Common Operations**
- `HttpRequestDataExtensions` for request parsing
- `RecapExtensions` for activity aggregation
- `ActivityResultExtensions` for response transformation

**Rationale**: Keeps function code clean and promotes reusability.

### Frontend Architecture

#### **1. RTK Query for All API Communication**
- Single source of truth for API state
- Automatic caching and refetching
- Built-in loading and error states

**Rationale**: Eliminates manual state management for API calls and provides consistent patterns.

#### **2. Functional Components with Hooks**
- No class components
- Use custom hooks for complex logic
- Keep components focused on presentation

**Rationale**: Modern React best practices; hooks provide better composition and reusability.

#### **3. Client-Side Routing with React Router**
- All routes defined in `App.tsx`
- SPA experience with deep linking support
- OAuth callback handling via routes

**Rationale**: Provides seamless navigation without full page reloads.

#### **4. Browser Storage Strategy**
- Use `localStorage` for recap/profile cache and stable user preferences (`recap.units`, `recap.activityType`, `recap.release.version`)
- Use `sessionStorage` only for short-lived UI state (`select.periodId`)
- Invalidate recap cache on disconnect and release migrations
- Never cache sensitive tokens

**Rationale**: Blends persistent UX improvements with explicit invalidation controls while preserving token security boundaries.

#### **5. Config-Driven Release Communication**
- Maintain release metadata in a single configuration source
- Render release notes from config to avoid hardcoded UI content
- Gate startup behavior by app version to force safe recap cache/auth refresh when needed

**Rationale**: Keeps user communication, migration behavior, and implementation history consistent across releases.

---

## Code Quality Standards

### TypeScript Standards

#### **Type Safety**
```typescript
// ✅ DO: Explicit types
type RecapQuery = 
  | { type: "rolling"; days: number; }
  | { type: "calendar"; unit: CalendarUnit; offset?: number; };

// ❌ DON'T: Using any
function processData(data: any) { ... }
```

#### **Component Structure**
```typescript
// ✅ DO: Clear structure
import { useState } from "react";

type Props = {
  title: string;
  onSubmit: (value: string) => void;
};

export default function MyComponent({ title, onSubmit }: Props) {
  const [value, setValue] = useState("");
  
  const handleSubmit = () => {
    onSubmit(value);
  };
  
  return <div>{/* JSX */}</div>;
}
```

#### **Error Handling**
```typescript
// ✅ DO: Handle RTK Query states
const { data, isLoading, isError, error } = useFetchRecap(query);

if (isLoading) return <Loading />;
if (isError) return <Error message={error.message} />;
```

### C# Standards

#### **Null Safety**
```csharp
// ✅ DO: Use nullable reference types
public string? OptionalValue { get; set; }

// ✅ DO: Check for null before using
if (request.AccessToken is null)
{
    return await req.BadRequest("Missing access token");
}
```

#### **Async/Await**
```csharp
// ✅ DO: Always async for I/O
public async Task<ActivityResult> GetActivitiesAsync(RecapRequest request)
{
    var response = await _http.GetAsync(url);
    return await ProcessResponse(response);
}

// ❌ DON'T: Blocking calls
var result = GetActivitiesAsync(request).Result; // NO!
```

#### **Logging with Context**
```csharp
// ✅ DO: Include relevant context
_logger.LogInformation(
    "Fetching activities for {Provider} from {Start} to {End}",
    providerType, startUtc, endUtc
);

// ❌ DON'T: Generic messages
_logger.LogInformation("Getting data");
```

---

## Security Principles

### **1. Token Management**
- **Storage**: HTTP-only, `SameSite=Lax` recap cookies (`recap_access_token`, `recap_expires_at`, `recap_provider`, `recap_oauth_state`)
- **Lifetime**: Track expiration in `recap_expires_at`; refresh tokens are provider-side artifacts and are not exposed to frontend JavaScript
- **Scope**: Request minimum required permissions
- **Cleanup**: Clear all tokens on disconnect

### **2. API Security**
- **Authorization**: Validate tokens on every request
- **CORS**: Properly configured via Azure SWA
- **Rate Limiting**: Respect external API limits
- **Error Messages**: Never leak sensitive data in errors

### **3. Frontend Security**
- **No token exposure**: Never store tokens in localStorage or accessible cookies
- **XSS Prevention**: Sanitize user-generated content
- **HTTPS Only**: Enforce HTTPS in production
- **Content Security Policy**: Set via SWA config

---

## User Experience Principles

### **1. Progressive Disclosure**
- Start simple: Select time window first
- Show summary, then details
- Highlights at the top, deep stats below

### **2. Instant Feedback**
- Loading states for all async operations
- Optimistic updates where appropriate
- Clear error messages with actionable advice

### **3. Mobile-First Responsive**
- Touch-friendly UI elements
- Readable text sizes on small screens
- Efficient use of screen space

### **4. Shareable Moments**
- Downloadable recap posters
- Clean, branded visuals
- Easy social media sharing

### **5. Data Transparency**
- Show what data is being accessed
- Clear provider indicators
- Explain calculation methods

### **6. Explainable Insights**
- Advanced visualizations must include "how this works" guidance in-product
- Drill-down controls (activity filter, breakdown modal, heatmap) should preserve context and avoid ambiguous state

---

## Testing Philosophy

### **What to Test**

#### Backend
- ✅ Service layer business logic
- ✅ Date range calculations
- ✅ Activity aggregation algorithms
- ✅ Activity-type filtering behavior in recap request/response
- ✅ Heatmap day scoring (`ToActivityDays`) and effort metric selection
- ✅ Provider factory resolution
- ✅ Extension methods

#### Frontend
- ✅ Complex UI logic
- ✅ Custom hooks
- ✅ Data transformations
- ✅ Release version migration flow and release-notes modal behavior
- ✅ Activity filter persistence and URL/query synchronization
- ✅ Heatmap interaction states (tooltip, keyboard, help modal)
- ✅ Edge cases in formatting

### **What NOT to Test**
- ❌ External API integrations (use mocks)
- ❌ Simple presentational components
- ❌ Third-party library behavior
- ❌ Azure Functions runtime

---

## Contribution Guidelines

### **Before Adding a Feature**

1. **Does it align with the mission?** Will it help athletes understand their data better?
2. **Is it provider-agnostic?** Can it work with any activity data source?
3. **Does it respect privacy?** Does it avoid storing or sharing user data?
4. **Is it maintainable?** Will future contributors understand it?

### **Adding a New Provider**

Requirements:
- Implement all four service interfaces
- Support OAuth 2.0 flow
- Handle rate limiting gracefully
- Provide clear error messages
- Document provider-specific quirks

### **Code Review Checklist**

- [ ] Type safety maintained (no `any`, no unchecked nulls)
- [ ] Error handling in place
- [ ] Logging with context
- [ ] Follows naming conventions
- [ ] Comments explain "why", not "what"
- [ ] No hardcoded secrets or tokens
- [ ] Responsive UI tested on mobile
- [ ] Provider pattern respected

---

## Technical Debt Policy

### **Acceptable Debt**
- Quick prototypes for user testing
- Feature flags for gradual rollouts
- TODO comments with GitHub issue links

### **Unacceptable Debt**
- Security vulnerabilities
- Data privacy violations
- Broken core functionality
- Unused code accumulation

### **Debt Repayment**
- Address security issues immediately
- Fix bugs before adding features
- Refactor when patterns emerge
- Document workarounds clearly

---

## Decision Records

### **Why Azure Functions + Azure Static Web Apps?**
- **Rationale**: Tight integration, simple deployment, cost-effective for sporadic usage patterns
- **Alternatives Considered**: Next.js API routes, standalone Express backend
- **Trade-offs**: Azure lock-in vs. ease of deployment

### **Why RTK Query over React Query?**
- **Rationale**: Already using Redux Toolkit, consistent patterns, smaller bundle size
- **Alternatives Considered**: React Query, SWR, fetch with useState
- **Trade-offs**: Redux boilerplate vs. consistency

### **Why Provider Pattern?**
- **Rationale**: Need to support multiple OAuth providers with different APIs
- **Alternatives Considered**: Single service with if/else logic, separate endpoints per provider
- **Trade-offs**: More upfront complexity vs. long-term maintainability

### **Why Local Storage + Session Storage Hybrid?**
- **Rationale**: Recap/profile cache and preferences benefit from persistence across reloads, while short-lived selection state should reset with session boundaries
- **Alternatives Considered**: Session-only storage, local-only storage, IndexedDB
- **Trade-offs**: Slightly more invalidation complexity vs. better UX and controlled persistence

### **Why Config-Driven Release Notes + Version Gate?**
- **Rationale**: Release history should be maintainable without UI rewrites, and version mismatches should trigger safe cache/auth reset behavior
- **Alternatives Considered**: Static markdown-only changelog, manual one-off migration scripts
- **Trade-offs**: Additional startup logic vs. clearer user communication and safer upgrades

### **Why .NET 8 over Node.js for Backend?**
- **Rationale**: Strong typing, excellent Azure Functions support, C# developer familiarity
- **Alternatives Considered**: Node.js with TypeScript, Python
- **Trade-offs**: Separate language stack vs. type safety and performance

---

## Metrics for Success

### **Technical Metrics**
- **Build Time**: < 2 minutes for full CI/CD pipeline
- **Cold Start**: < 3 seconds for first API call
- **API Response**: < 2 seconds for typical recap generation
- **Bundle Size**: < 500KB initial load
- **Lighthouse Score**: > 90 on all metrics

### **User Experience Metrics**
- **Time to First Recap**: < 30 seconds from landing page
- **Error Rate**: < 1% of API calls
- **OAuth Success Rate**: > 95% completion
- **Mobile Usage**: > 40% of traffic

### **Code Quality Metrics**
- **TypeScript Coverage**: 100% (no `any` types)
- **Zero High-Severity Vulnerabilities**: npm audit and Snyk
- **ESLint Errors**: Zero in production builds

---

## Versioning & Compatibility

### **API Versioning**
- **Current**: No versioning (v1 implicit)
- **Future**: Add `/api/v2/` prefix when breaking changes needed
- **Policy**: Maintain previous version for minimum 6 months

### **Frontend Compatibility**
- **Target Browsers**: Last 2 versions of Chrome, Firefox, Safari, Edge
- **Mobile**: iOS 14+, Android 10+
- **JavaScript Requirement**: Core SPA functionality requires modern JavaScript-enabled browsers

### **Provider API Compatibility**
- **Strava**: Follow v3 API, monitor deprecation notices
- **Intervals.icu**: Track API changes via their changelog
- **Fallback**: Graceful degradation when provider APIs change

---

## Maintenance Commitments

### **Dependency Updates**
- **Security patches**: Within 1 week of disclosure
- **Major version bumps**: Review and test before upgrading
- **Monthly review**: Check for outdated dependencies

### **Documentation**
- **Keep README current**: Update for any setup changes
- **Update Copilot instructions**: When patterns change
- **Constitution updates**: When principles evolve
- **Code comments**: Maintain accuracy with code changes

### **Monitoring**
- **Application Insights**: Monitor API health and errors
- **GitHub Actions**: Ensure CI/CD stays green
- **OAuth App Health**: Check provider dashboards monthly

---

## License & Attribution

### **Project License**
- Open source under GNU AGPL-3.0-only
- Network-deployed modified versions must provide corresponding source code per AGPL
- No warranty provided

### **Third-Party Dependencies**
- Respect all package licenses
- Attribute required libraries
- Keep license notices intact

### **Provider Attribution**
- Display provider logos appropriately
- Follow provider branding guidelines
- Link to provider terms of service

---

## Contact & Governance

### **Project Maintainer**
- Primary contact for architectural decisions
- Final say on constitutional changes
- Responsible for security incidents

### **Community**
- GitHub Issues for bug reports and features
- Pull requests welcome with proper review
- Code of conduct: Be respectful and constructive

### **Constitutional Amendments**
- Propose changes via pull request
- Require discussion and consensus
- Document rationale for all changes

---

**Adopted**: January 2026  
**Last Reviewed**: February 2026  
**Next Review**: August 2026 or upon major architectural changes
