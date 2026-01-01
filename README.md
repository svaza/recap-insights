# Recap Insights (Strava Recap)

A personal Strava recap app that turns your activities into clean stats + shareable visuals.

**Monorepo**
- `strava-recap/` – Web UI (TypeScript)
- `strava-recap-api/` – Backend API (C#)
- `strava-recap.sln` – .NET solution

## What it does
- Connects to Strava via OAuth
- Pulls activities and aggregates metrics for a selected time window
- Supports recap windows like:
  - Rolling: last N days
  - Calendar: this month / this year / last year (via `offset`)
- Generates a “recap” view and optionally a downloadable flyer/poster

## Tech stack
- Frontend: TypeScript web app (see `strava-recap/`)
- Backend: C# API (see `strava-recap-api/`)
- Auth/Data: Strava OAuth + Strava Activities API
