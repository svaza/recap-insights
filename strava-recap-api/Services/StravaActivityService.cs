using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using strava_recap_api.Models;

namespace strava_recap_api.Services;

/// <summary>
/// Strava-specific activity service implementation.
/// Handles fetching activities and athlete profile from Strava API.
/// </summary>
public class StravaActivityService : IActivityService
{
    private const int MaxPageSize = 200;
    private const int MaxPages = 30;

    private readonly HttpClient _http;
    private readonly ILogger<StravaActivityService> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    public StravaActivityService(HttpClient http, ILogger<StravaActivityService> logger)
    {
        _http = http;
        _http.BaseAddress = new Uri("https://www.strava.com/api/v3/");
        _logger = logger;
    }

    /// <summary>
    /// Fetches athlete's activities based on the recap request with pagination.
    /// </summary>
    public async Task<ActivityResult> GetActivitiesAsync(RecapRequest recapRequest)
    {
        var accessToken = recapRequest.Authentication.AccessToken!;
        var after = recapRequest.StartUtc.ToUnixTimeSeconds();
        var before = recapRequest.EndUtc.ToUnixTimeSeconds();

        _logger.LogInformation("Fetching activities from Strava for range {StartUtc} to {EndUtc}", recapRequest.StartUtc, recapRequest.EndUtc);

        var activities = new List<StravaSummaryActivity>(capacity: 256);

        try
        {
            for (var page = 1; page <= MaxPages; page++)
            {
                _logger.LogDebug("Fetching activity page {Page} from Strava", page);

                var url = $"athlete/activities?after={after}&before={before}&page={page}&per_page={MaxPageSize}";
                using var msg = new HttpRequestMessage(HttpMethod.Get, url);
                msg.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

                using var resp = await _http.SendAsync(msg);
                var body = await resp.Content.ReadAsStringAsync();

                // Check for authentication errors
                if (resp.StatusCode == HttpStatusCode.Unauthorized)
                {
                    _logger.LogWarning("Strava returned 401 Unauthorized - token invalid or expired");
                    return new ActivityResult(
                        Success: false,
                        Activities: null,
                        ErrorMessage: "Token invalid or expired",
                        ErrorStatusCode: (int)HttpStatusCode.Unauthorized,
                        RateLimit: null);
                }

                // Check for authorization errors
                if (resp.StatusCode == HttpStatusCode.Forbidden)
                {
                    _logger.LogWarning("Strava returned 403 Forbidden - missing required scopes");
                    return new ActivityResult(
                        Success: false,
                        Activities: null,
                        ErrorMessage: "Missing required scopes (activity:read or activity:read_all)",
                        ErrorStatusCode: (int)HttpStatusCode.Forbidden,
                        RateLimit: null);
                }

                // Check for rate limiting
                if ((int)resp.StatusCode == 429)
                {
                    _logger.LogWarning("Strava rate limit hit (429) - too many requests");
                    resp.Headers.TryGetValues("X-RateLimit-Limit", out var lim);
                    resp.Headers.TryGetValues("X-RateLimit-Usage", out var use);
                    resp.Headers.TryGetValues("X-ReadRateLimit-Limit", out var rlim);
                    resp.Headers.TryGetValues("X-ReadRateLimit-Usage", out var ruse);

                    var rateLimitInfo = new RateLimitInfo(
                        lim?.FirstOrDefault(),
                        use?.FirstOrDefault(),
                        rlim?.FirstOrDefault(),
                        ruse?.FirstOrDefault());

                    return new ActivityResult(
                        Success: false,
                        Activities: null,
                        ErrorMessage: "Rate limit exceeded",
                        ErrorStatusCode: 429,
                        RateLimit: rateLimitInfo);
                }

                // Check for other errors
                if (!resp.IsSuccessStatusCode)
                {
                    _logger.LogError("Strava API returned error on page {Page}: {StatusCode} {ReasonPhrase}",
                        page, resp.StatusCode, resp.ReasonPhrase);
                    return new ActivityResult(
                        Success: false,
                        Activities: null,
                        ErrorMessage: $"Strava API error: {resp.StatusCode}",
                        ErrorStatusCode: (int)resp.StatusCode,
                        RateLimit: null);
                }

                // Parse page items
                var pageItems = JsonSerializer.Deserialize<List<StravaSummaryActivity>>(body, JsonOptions) ?? new();
                _logger.LogDebug("Received {ActivityCount} activities on page {Page}", pageItems.Count, page);

                if (pageItems.Count == 0)
                {
                    _logger.LogDebug("No more activities, pagination complete at page {Page}", page);
                    break;
                }

                activities.AddRange(pageItems);
            }

            _logger.LogInformation("Successfully fetched {TotalActivities} activities from Strava", activities.Count);

            return new ActivityResult(
                Success: true,
                Activities: activities,
                ErrorMessage: null,
                ErrorStatusCode: null,
                RateLimit: null);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "HTTP error during activity fetch");
            return new ActivityResult(
                Success: false,
                Activities: null,
                ErrorMessage: "Network error communicating with Strava",
                ErrorStatusCode: (int)HttpStatusCode.BadGateway,
                RateLimit: null);
        }
        catch (TimeoutException ex)
        {
            _logger.LogError(ex, "Timeout during activity fetch");
            return new ActivityResult(
                Success: false,
                Activities: null,
                ErrorMessage: "Request timed out",
                ErrorStatusCode: (int)HttpStatusCode.GatewayTimeout,
                RateLimit: null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during activity fetch: {Message}", ex.Message);
            return new ActivityResult(
                Success: false,
                Activities: null,
                ErrorMessage: "Unexpected error fetching activities",
                ErrorStatusCode: (int)HttpStatusCode.InternalServerError,
                RateLimit: null);
        }
    }

    /// <summary>
    /// Fetches athlete's profile information. Returns null if fetch fails.
    /// </summary>
    public async Task<StravaAthleteProfile?> GetAthleteAsync(string accessToken)
    {
        try
        {
            _logger.LogDebug("Fetching athlete profile from Strava");

            using var msg = new HttpRequestMessage(HttpMethod.Get, "athlete");
            msg.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            using var resp = await _http.SendAsync(msg);

            if (!resp.IsSuccessStatusCode)
            {
                _logger.LogWarning("Failed to fetch athlete profile: {StatusCode}", resp.StatusCode);
                return null;
            }

            var body = await resp.Content.ReadAsStringAsync();
            var athlete = JsonSerializer.Deserialize<StravaAthlete>(body, JsonOptions);

            if (athlete == null)
            {
                _logger.LogWarning("No athlete data in response");
                return null;
            }

            var profile = new StravaAthleteProfile(athlete.FirstName ?? "", athlete.LastName ?? "");
            _logger.LogInformation("Retrieved athlete name: {AthleteName}", profile.FullName);
            return profile;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning(ex, "HTTP error fetching athlete profile");
            return null;
        }
        catch (TimeoutException ex)
        {
            _logger.LogWarning(ex, "Timeout fetching athlete profile");
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error fetching athlete profile: {Message}", ex.Message);
            return null;
        }
    }

    /// <summary>
    /// Strava athlete DTO for deserialization.
    /// </summary>
    private sealed class StravaAthlete
    {
        [JsonPropertyName("firstname")]
        public string? FirstName { get; set; }

        [JsonPropertyName("lastname")]
        public string? LastName { get; set; }
    }
}
