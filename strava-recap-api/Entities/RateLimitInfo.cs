namespace strava_recap_api.Entities;

/// <summary>
/// Strava rate limit information.
/// </summary>
public record RateLimitInfo(string? Limit, string? Usage, string? ReadLimit, string? ReadUsage);
