namespace strava_recap_api.Entities;

/// <summary>
/// Result of activity fetch operation including error and rate limit details.
/// </summary>
public record ActivityResult(
    bool Success,
    List<ActivitySummary>? Activities,
    string? ErrorMessage,
    int? ErrorStatusCode,
    RateLimitInfo? RateLimit);
