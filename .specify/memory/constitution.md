<!--
Sync Impact Report - Constitution v1.0.0
========================================
Project: Recap Insights (multi-provider activity recap platform)
Version Change: Template → 1.0.0 (Initial Ratification)
Ratification Date: 2026-01-25

Modified Principles:
- All placeholder principles replaced with project-specific values

Added Principles:
1. User Privacy First - Never store activity data, secure authentication, transparent usage
2. Provider Abstraction - Consistent interface for all activity data sources
3. Type Safety Everywhere - Strong typing in TypeScript and C#, zero any types
4. Performance & Caching - Fast feedback loops, graceful degradation, smart caching
5. Separation of Concerns - Clear frontend/backend/provider boundaries

Added Sections:
- Code Quality Standards (TypeScript and C# specific rules)
- Security Principles (Token management, API security, frontend security)
- Testing Philosophy (What to test, what not to test)

Templates Requiring Updates:
✅ Updated: .github/agents/copilot-instructions.md (contains constitution alignment references)
✅ Updated: spec-template.md principles check (already references constitution.md)
✅ Updated: plan-template.md constitution check gate (already implemented)
⚠ Pending: None - all templates already reference constitution file generically

Follow-up TODOs:
- None - all placeholders filled with concrete values

Migration Notes:
- Existing .github/constitution.md contains expanded guidance; this file is the canonical minimal version
- Developers should reference both files: this for principles, .github/constitution.md for detailed guidance
-->

# Recap Insights Constitution

## Mission Statement

**Recap Insights** empowers athletes to visualize and celebrate their achievements by transforming raw activity data into meaningful, shareable insights.

---

## Core Principles

### I. User Privacy First (NON-NEGOTIABLE)

**MUST NOT** store activity data on servers; all recap generation happens on-demand. **MUST** use HTTP-only cookies for OAuth tokens, never exposing them to frontend JavaScript. **MUST** provide transparent data usage disclosure. **MUST** enable users to disconnect and revoke access with complete data cleanup.

**Rationale**: Privacy is non-negotiable. Athletes trust us with their personal fitness data; we honor that trust by minimizing data retention and maximizing transparency.

**Testable**: Verify no activity data in database queries; verify tokens in HTTP-only cookies; verify disconnect clears all tokens.

---

### II. Provider Abstraction

**MUST** implement the `IProvider` interface for all activity data sources. **MUST** provide four services per provider: `IAuthService`, `ITokenService`, `IAthleteProfileService`, `IActivityService`. **MUST** use `ProviderFactory` for provider resolution. **MUST NOT** couple features to specific providers.

**Rationale**: Supporting multiple activity platforms requires consistent interfaces. This pattern makes adding new providers predictable and maintains feature parity across sources.

**Testable**: Verify all providers implement IProvider; verify features work with any provider; verify new providers follow four-service pattern.

---

### III. Type Safety Everywhere (NON-NEGOTIABLE)

**MUST** use explicit TypeScript types; **MUST NOT** use `any` type except for verified third-party integrations. **MUST** enable nullable reference types in C#. **MUST** validate null checks before dereferencing. **MUST** use discriminated unions for complex state.

**Rationale**: Type safety catches errors at compile time, not runtime. Strong typing improves maintainability and reduces debugging time.

**Testable**: TypeScript coverage 100% (no `any`); C# nullable warnings as errors; zero runtime null reference exceptions in logs.

---

### IV. Performance & Caching

**MUST** target <2 second API response times for recap generation. **MUST** implement graceful degradation for API rate limits and failures. **MUST** cache API responses in sessionStorage with timestamps. **MUST** respect external API pagination limits. **MUST NOT** block UI during async operations.

**Rationale**: Fast feedback loops keep users engaged. Smart caching reduces load on external APIs while respecting data freshness needs.

**Testable**: Measure API response times; verify loading states exist; verify cache hit/miss behavior; test rate limit handling.

---

### V. Separation of Concerns

**MUST** maintain clear boundaries: Frontend (React/TypeScript), Backend (Azure Functions/.NET), Providers (pluggable services). **MUST** use RTK Query for all API communication. **MUST** use extension methods for cross-cutting concerns. **MUST NOT** mix business logic into UI components. **MUST NOT** couple frontend to backend implementation details.

**Rationale**: Clear separation enables independent testing, parallel development, and easier maintenance. Each layer has a single responsibility.

**Testable**: Verify no direct HTTP calls in components (only RTK Query); verify business logic in services not components; verify providers are swappable.

---

## Code Quality Standards

### TypeScript Requirements

**MUST** use functional components with hooks (no class components). **MUST** define explicit prop types for all components. **MUST** handle RTK Query loading/error states in UI. **MUST** use `useCallback` and `useMemo` for performance-critical operations. **MUST** follow naming: PascalCase for components, camelCase for utilities.

**Example (Compliant)**:
```typescript
type Props = { title: string; onSubmit: (value: string) => void; };
export default function MyComponent({ title, onSubmit }: Props) {
  const { data, isLoading, isError } = useQuery();
  if (isLoading) return <Loading />;
  if (isError) return <Error />;
  return <div>{data.content}</div>;
}
```

**Example (Non-Compliant)**:
```typescript
// ❌ Missing types, no error handling
function MyComponent(props: any) {
  const data = useQuery().data;
  return <div>{data.content}</div>; // Crashes if data is undefined
}
```

---

### C# Requirements

**MUST** use async/await for all I/O operations. **MUST** use constructor injection for dependencies. **MUST** log with structured context (include provider, timestamps, key IDs). **MUST** check nullability before dereferencing. **MUST** use extension methods for reusable operations. **MUST** follow naming: PascalCase for public members, camelCase with underscore for private fields.

**Example (Compliant)**:
```csharp
public async Task<ActivityResult> GetActivitiesAsync(RecapRequest request)
{
    if (request.AccessToken is null)
        return ActivityResult.Error("Missing access token");
    
    _logger.LogInformation("Fetching activities for {Provider}", request.ProviderType);
    var response = await _httpClient.GetAsync(url);
    return await ProcessResponseAsync(response);
}
```

**Example (Non-Compliant)**:
```csharp
// ❌ Blocking call, no null check, poor logging
public ActivityResult GetActivities(RecapRequest request)
{
    _logger.LogInformation("Getting data");
    var response = _httpClient.GetAsync(url).Result; // Blocks thread
    return ProcessResponse(response);
}
```

---

## Security Principles

### Token Management

**MUST** store OAuth tokens in HTTP-only cookies with Secure flag. **MUST** track token expiration and refresh proactively. **MUST** request minimum required OAuth scopes. **MUST** clear all tokens on user disconnect. **MUST NOT** expose tokens to frontend JavaScript. **MUST NOT** log token values.

---

### API Security

**MUST** validate tokens on every backend request. **MUST** configure CORS via Azure SWA settings. **MUST** respect external API rate limits. **MUST NOT** leak sensitive data in error messages. **MUST** use HTTPS in production.

---

### Frontend Security

**MUST NOT** store tokens in localStorage or accessible cookies. **MUST** sanitize user-generated content before rendering. **MUST** set Content Security Policy via SWA config. **MUST** enforce HTTPS in production.

---

## Testing Philosophy

### What to Test

**Backend**: Service layer business logic, date range calculations, activity aggregation, provider factory resolution, extension methods.

**Frontend**: Complex UI logic, custom hooks, data transformations, edge cases in formatting, RTK Query integration.

### What NOT to Test

**MUST NOT** test external API integrations (use mocks instead). **MUST NOT** test simple presentational components with no logic. **MUST NOT** test third-party library behavior. **MUST NOT** test Azure Functions runtime.

**Rationale**: Focus testing effort on code we own and logic we control. External dependencies are tested by their maintainers.

---

## Technical Stack Requirements

**Frontend**: React 19, TypeScript 5.x, Vite 7, RTK Query, React Router v7, html-to-image.

**Backend**: .NET 8, Azure Functions v4 (isolated worker), ASP.NET Core integration.

**Platform**: Azure Static Web Apps (frontend hosting), Azure Functions (backend runtime).

**Storage**: Session storage for client-side caching only. **MUST NOT** use databases for activity data.

**Rationale**: Stack chosen for type safety, performance, Azure integration, and developer experience.

---

## Amendment Process

**Proposals**: Submit constitution amendments via pull request to `.specify/memory/constitution.md`.

**Review**: Amendments require discussion and consensus among maintainers.

**Documentation**: All amendments **MUST** document rationale in commit message.

**Versioning**: Increment version according to semantic versioning:
- MAJOR: Backward incompatible principle removals/redefinitions
- MINOR: New principles or materially expanded guidance
- PATCH: Clarifications, wording fixes, non-semantic refinements

**Migration**: Breaking changes **MUST** include migration guide for existing code.

---

## Governance

This constitution supersedes all other development practices. All code reviews **MUST** verify compliance with these principles. Any deviation **MUST** be explicitly justified and documented. For runtime development guidance, see `.github/agents/copilot-instructions.md`. For expanded architectural guidance, see `.github/constitution.md`.

**Enforcement**: Pull requests that violate NON-NEGOTIABLE principles will be rejected. Other violations require explicit justification and maintainer approval.

**Authority**: Project maintainer has final authority on constitutional interpretation and amendment approval.

---

**Version**: 1.0.0 | **Ratified**: 2026-01-25 | **Last Amended**: 2026-01-25
