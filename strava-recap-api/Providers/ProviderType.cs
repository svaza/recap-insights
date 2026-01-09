namespace strava_recap_api.Providers;

/// <summary>
/// Supported activity data providers.
/// </summary>
public enum ProviderType
{
    /// <summary>
    /// Strava - default provider for activity data.
    /// </summary>
    Strava,

    /// <summary>
    /// intervals.icu - training analytics platform.
    /// </summary>
    IntervalsIcu
}

public static class ProviderTypeExtensions
{
    /// <summary>
    /// Parses a string to ProviderType. Defaults to Strava if invalid.
    /// </summary>
    public static ProviderType ParseProviderType(this string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return ProviderType.Strava;

        return value.ToLowerInvariant() switch
        {
            "strava" => ProviderType.Strava,
            "intervals" or "intervalsicu" or "intervals.icu" => ProviderType.IntervalsIcu,
            _ => ProviderType.Strava
        };
    }

    /// <summary>
    /// Converts ProviderType to a cookie-safe string value.
    /// </summary>
    public static string ToCookieValue(this ProviderType providerType)
    {
        return providerType switch
        {
            ProviderType.Strava => "strava",
            ProviderType.IntervalsIcu => "intervalsicu",
            _ => "strava"
        };
    }

    /// <summary>
    /// Gets a display-friendly name for the provider.
    /// </summary>
    public static string ToDisplayName(this ProviderType providerType)
    {
        return providerType switch
        {
            ProviderType.Strava => "Strava",
            ProviderType.IntervalsIcu => "intervals.icu",
            _ => "Unknown"
        };
    }
}
