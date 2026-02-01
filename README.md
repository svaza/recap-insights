# Recap Insights - Frontend

A React + TypeScript web application that generates personalized activity recaps from your Strava and intervals.icu data. This frontend connects to the [strava-recap-api](../strava-recap-api) backend to fetch and display your athletic achievements.

## Features

- 🔐 **Multi-Provider Support** - Connect to Strava and intervals.icu
- 📊 **Activity Analytics** - View comprehensive statistics for your activities
- 📅 **Flexible Time Windows** - Choose from various recap periods (rolling days, monthly, yearly)
- 🎨 **Visual Recaps** - Generate shareable recap posters and flyers
- 💪 **"Wow" Moments** - Highlight your biggest efforts and achievements
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Azure Static Web Apps (SWA)** for hosting and API integration
- **React Router** for navigation
- **html-to-image** for generating downloadable recaps
- **ESLint** for code quality

## Project Structure

```
src/
├── pages/           # Main route pages
│   ├── SelectPage.tsx           # Time window selection
│   ├── RecapPage.tsx            # Recap display
│   └── ProviderCallbackPage.tsx # OAuth callback handler
├── ui/              # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── RecapPoster.tsx
│   ├── StravaConnectButton.tsx
│   ├── WowCarousel.tsx
│   └── wow/                     # "Wow" moment components
├── models/          # TypeScript types and interfaces
├── utils/           # Helper functions and API queries
└── assets/          # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- The backend API running (see [strava-recap-api](../strava-recap-api))

### Installation

```bash
npm install
```

### Development

**Option 1: Using Azure Static Web Apps CLI (Recommended)**

The project includes VS Code tasks to run the full stack with Azure SWA emulation:

1. Run the `dev:all` task from VS Code (or from workspace root)
2. This starts:
   - Vite dev server on `http://localhost:5173`
   - Azure Functions API on `http://localhost:7071`
   - Azure SWA CLI on `http://localhost:4280` (unified endpoint)

Access the app at `http://localhost:4280` for the full SWA experience with API routing.

**Option 2: Vite only**

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (requires backend running separately).

### Building

```bash
npm run build
```

This compiles TypeScript and builds the production assets to the `dist/` folder.

### Linting

```bash
npm run lint
```

## API Integration

The frontend communicates with the Azure Functions backend API. Key endpoints:

- `/api/provider/connect` - Initiates Strava OAuth flow
- `/api/provider/callback` - Handles OAuth callback
- `Azure Static Web Apps

This project is designed for deployment to **Azure Static Web Apps**, which provides:

- 🚀 Global CDN distribution for the frontend
- 🔌 Seamless integration with Azure Functions backend
- 🔐 Built-in authentication and authorization
- 🌐 Custom domain support with free SSL
- 🎯 SPA routing with fallback configuration

### Configuration

The [staticwebapp.config.json](public/staticwebapp.config.json) handles:
- SPA routing (all routes fall back to `/index.html`)
- API route exclusions
- Static asset serving

### Local Development with SWA CLI

The Azure SWA CLI emulates the production environment locally:

```bash
# From workspace root
swa start http://localhost:5173 --api-devserver-url http://localhost:7071 --port 4280
```

This proxies the Vite dev server and Azure Functions through the SWA CLI for accurate local testing.

### Deployment

The project uses manual deployment to Azure Static Web Apps. Follow these steps:

**1. Build the frontend**
```bash
cd strava-recap;npm run build
```

**2. Build the Azure Functions API**
```bash
dotnet publish ./strava-recap-api/strava-recap-api.csproj -c Release -o ./strava-recap-api/publish
```

**3. Deploy to Azure SWA**
```bash
cd ..
swa deploy ./strava-recap/dist --api-location ./strava-recap-api/publish --deployment-token "<Deployment Token>" --api-language "dotnetisolated" --api-version "8.0" --env production
```

**Getting your deployment token:**
- Go to your Azure Static Web App in the Azure Portal
- Navigate to **Overview** > **Manage deployment token**
- Copy the token and use it in the deploy command

**Environment variables:**
Make sure to configure the required environment variables in your Azure Static Web App settings:
- `AuthenticationOptions__ClientId` - Strava OAuth client ID
- `AuthenticationOptions__ClientSecret` - Strava OAuth client secret
- `AuthenticationOptions__RedirectUri` - OAuth callback URL

## Development Notes

- Built with Vite for fast HMR and optimized builds
- Uses modern React 19 features
- TypeScript for type safety
- Fully configured for Azure Static Web Apps deployment
- Azure SWA CLI for local development parity with production
## Static Web App Configuration

The app is configured for Azure Static Web Apps with API integration. See [staticwebapp.config.json](public/staticwebapp.config.json) for routing configuration.

## Development Notes

- Built with Vite for fast HMR and optimized builds
- Uses modern React 19 features
- TypeScript for type safety
- Configured for Azure Static Web Apps deployment
