using System.Text.Json.Serialization;
using strava_recap_api.Models;

namespace strava_recap_api.Services;

/// <summary>
/// Service for fetching Strava activities and athlete profile information.
/// </summary>
public interface IActivityService
{
    /// <summary>
    /// Fetches athlete's activities based on the recap request.
    /// </summary>
    Task<ActivityResult> GetActivitiesAsync(RecapRequest recapRequest);

    /// <summary>
    /// Fetches athlete's profile information.
    /// </summary>
    Task<StravaAthleteProfile?> GetAthleteAsync(string accessToken);
}

/// <summary>
/// Result of activity fetch operation including error and rate limit details.
/// </summary>
public record ActivityResult(
    bool Success,
    List<StravaSummaryActivity>? Activities,
    string? ErrorMessage,
    int? ErrorStatusCode,
    RateLimitInfo? RateLimit);

/// <summary>
/// Strava rate limit information.
/// </summary>
public record RateLimitInfo(string? Limit, string? Usage, string? ReadLimit, string? ReadUsage);

/// <summary>
/// Strava athlete profile.
/// </summary>
public record StravaAthleteProfile(string FirstName, string LastName)
{
    public string FullName => $"{FirstName} {LastName}".Trim();
}

public sealed class StravaSummaryActivity
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("sport_type")]
    public string? SportType { get; set; }

    [JsonPropertyName("start_date")]
    public DateTimeOffset StartDate { get; set; }

    [JsonPropertyName("distance")]
    public double Distance { get; set; }

    [JsonPropertyName("moving_time")]
    public int MovingTime { get; set; }

    [JsonPropertyName("total_elevation_gain")]
    public double TotalElevationGain { get; set; }

    [JsonPropertyName("average_heartrate")]
    public double? AverageHeartrate { get; set; }

    [JsonPropertyName("max_heartrate")]
    public double? MaxHeartrate { get; set; }
}

