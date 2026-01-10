/**
 * Provider type identifier used in API responses and cookies.
 */
export type ProviderType = "strava" | "intervalsicu" | null;

/**
 * Parses a provider type string from API response or cookie.
 */
export function parseProviderType(value: string | undefined | null): ProviderType {
    if (!value) return null;
    if (value === "strava") return "strava";
    if (value === "intervalsicu" || value === "intervals.icu") return "intervalsicu";
    return "strava"; // default
}

/**
 * Gets the display-friendly name for a provider.
 */
export function getProviderDisplayName(provider: ProviderType | string | null): string {
    if (!provider) return "Not Connected";
    
    switch (provider) {
        case "strava": return "Strava";
        case "intervalsicu": return "intervals.icu";
        default: return "Provider";
    }
}
