# AGENTS.md

## Purpose
Strava Recap exists to help athletes generate meaningful, shareable recap insights from provider data (Strava and Intervals.icu) while preserving user privacy by default.

This project must remain:
- Security first
- Privacy first
- Performant
- Extensible
- Modular

---

## Non-Negotiable Guardrails

### 1. Security and Privacy First
- Never store user activity history on server-side infrastructure.
- Never store OAuth tokens in frontend-accessible storage.
- Use HTTP-only cookies for auth/session token data.
- Keep provider access read-only unless explicitly approved as a product change.
- Never expose secrets in code, logs, or client responses.

### 2. No Server-Side Logging of User Data
- Do not log activity payloads, athlete profile payloads, token values, callback codes, or raw query/body data.
- Do not add telemetry that captures identifiable user workout data.
- If logging is required for operational health, it must be minimal, aggregate, and non-identifying.

### 3. No Server-Side User Data Persistence
- No database/file persistence for user recap content or raw provider activity data.
- Any cache for recap data must be browser-side only.
- Backend must remain stateless for recap content.

### 4. Config-First, Not Hardcoded
- New behavior, release metadata, and provider-specific switches should be config-driven when feasible.
- Prefer centralized config files for product flags, release notes, and provider settings.
- Avoid scattering constants across components/services when a shared config model is practical.

### 5. Modular Frontend Architecture
- React UI must be composed of small, focused, reusable components.
- Move non-UI logic into hooks/utilities/selectors.
- Keep page components orchestration-focused; keep rendering units isolated and testable.
- Avoid monolithic components that combine data fetching, transformation, and heavy rendering.

### 6. Performance by Default
- Minimize unnecessary renders and large computations in render paths.
- Use memoization for expensive derived recap calculations.
- Keep network payloads intentionally small and normalized.
- Invalidate cache intentionally (disconnect, version migration, explicit user actions).

---

## Project Patterns

### Backend Patterns
- Provider pattern is mandatory:
  - `IProvider`
  - `ProviderFactory`
  - provider-specific auth/token/activity/profile services
- Keep Azure Function handlers thin.
- Put shared request/response and aggregation logic in dedicated extensions/services.
- Maintain strict DTO boundaries between backend entities and API contracts.

### Frontend Patterns
- RTK Query is the default API state layer.
- Query/response normalization lives at data boundaries (`store/api.ts`, hooks).
- URL query params are source-of-truth for recap selection and filtering.
- Release and migration behavior must be version/config driven.

### Cross-Cutting Patterns
- Additive changes over breaking changes when possible.
- If new recap metrics are added, update backend aggregation, DTOs, normalization, and UI together.
- Keep naming and types aligned between backend contracts and frontend consumers.

---

## Implementation Rules

### Required for New Features
1. Define data flow (provider -> backend aggregation -> DTO -> frontend normalization -> UI).
2. Confirm privacy/security impact against guardrails above.
3. Prefer config entry over hardcoded branching.
4. Keep component/service boundaries modular.
5. Validate performance impact (payload size, render cost, cache behavior).

### Forbidden
- Adding server-side persistence for recap/user activity data.
- Adding server logs that include user workout/profile/token details.
- Introducing `any` without strong justification.
- Embedding secrets or provider credentials in frontend code.
- Mixing provider-specific behavior directly into generic flows without abstraction.

---

## Quality and Review Checklist
- Security constraints satisfied.
- No server-side user-data logging/storage introduced.
- Config-driven approach used where appropriate.
- React components remain modular and focused.
- API contracts and frontend types stay in sync.
- Performance impact assessed for recap and rendering paths.

---

## Source Alignment
This file aligns with:
- `.github/constitution.md`
- `.github/copilot-instructions.md`

If there is a conflict, follow the stricter security/privacy rule.
