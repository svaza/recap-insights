using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using strava_recap_api.Entities;

namespace strava_recap_api.Services.IntervalsIcu;

/// <summary>
/// Intervals.icu-specific activity service implementation.
/// Handles fetching activities from Intervals.icu API.
/// </summary>
public class IntervalsIcuActivityService : IActivityService
{
    private const string ActivitiesEndpoint = "api/v1/athlete/0/activities";
    private const int MaxPageSize = 366;
    private const int MaxPages = 30;

    private readonly HttpClient _http;
    private readonly ILogger<IntervalsIcuActivityService> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    public IntervalsIcuActivityService(HttpClient http, ILogger<IntervalsIcuActivityService> logger)
    {
        _http = http;
        _http.BaseAddress = new Uri("https://intervals.icu/");
        _logger = logger;
    }

    /// <summary>
    /// Fetches athlete's activities based on the recap request with pagination.
    /// </summary>
    public async Task<ActivityResult> GetActivitiesAsync(RecapRequest recapRequest)
    {
        var accessToken = recapRequest.Authentication.AccessToken!;

        // Intervals.icu uses local ISO-8601 date format
        var oldest = recapRequest.StartUtc.ToString("yyyy-MM-ddTHH:mm:ss");
        var newest = recapRequest.EndUtc.ToString("yyyy-MM-ddTHH:mm:ss");

        _logger.LogInformation("Fetching activities from Intervals.icu for range {StartUtc} to {EndUtc}", recapRequest.StartUtc, recapRequest.EndUtc);

        var allActivities = new List<IntervalsIcuActivityDto>(capacity: 256);

        try
        {
            // Intervals.icu pagination: we use oldest/newest to define the range and limit for page size
            // For subsequent pages, we adjust the 'oldest' parameter to the newest activity's start date from the previous page + 1 second
            var currentOldest = oldest;

            for (var page = 1; page <= MaxPages; page++)
            {
                _logger.LogDebug("Fetching activity page {Page} from Intervals.icu", page);

                var url = $"{ActivitiesEndpoint}?oldest={Uri.EscapeDataString(currentOldest)}&newest={Uri.EscapeDataString(newest)}&limit={MaxPageSize}";
                using var msg = new HttpRequestMessage(HttpMethod.Get, url);
                msg.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

                using var resp = await _http.SendAsync(msg);
                var body = await resp.Content.ReadAsStringAsync();

                // Check for authentication errors
                if (resp.StatusCode == HttpStatusCode.Unauthorized)
                {
                    _logger.LogWarning("Intervals.icu returned 401 Unauthorized - token invalid or expired");
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
                    _logger.LogWarning("Intervals.icu returned 403 Forbidden - missing required scopes");
                    return new ActivityResult(
                        Success: false,
                        Activities: null,
                        ErrorMessage: "Missing required scopes (ACTIVITY:READ)",
                        ErrorStatusCode: (int)HttpStatusCode.Forbidden,
                        RateLimit: null);
                }

                // Check for rate limiting
                if ((int)resp.StatusCode == 429)
                {
                    _logger.LogWarning("Intervals.icu rate limit hit (429) - too many requests");
                    return new ActivityResult(
                        Success: false,
                        Activities: null,
                        ErrorMessage: "Rate limit exceeded",
                        ErrorStatusCode: 429,
                        RateLimit: null);
                }

                // Check for other errors
                if (!resp.IsSuccessStatusCode)
                {
                    _logger.LogError("Intervals.icu API returned error on page {Page}: {StatusCode} {ReasonPhrase}",
                        page, resp.StatusCode, resp.ReasonPhrase);
                    return new ActivityResult(
                        Success: false,
                        Activities: null,
                        ErrorMessage: $"Intervals.icu API error: {resp.StatusCode}",
                        ErrorStatusCode: (int)resp.StatusCode,
                        RateLimit: null);
                }

                // Parse page items
                var pageItems = JsonSerializer.Deserialize<List<IntervalsIcuActivityDto>>(body, JsonOptions) ?? new();
                _logger.LogDebug("Received {ActivityCount} activities on page {Page}", pageItems.Count, page);

                if (pageItems.Count == 0)
                {
                    _logger.LogDebug("No more activities, pagination complete at page {Page}", page);
                    break;
                }

                allActivities.AddRange(pageItems);

                // If we got less than the limit, we've reached the end
                if (pageItems.Count < MaxPageSize)
                {
                    _logger.LogDebug("Received less than limit, pagination complete at page {Page}", page);
                    break;
                }

                // For next page, set oldest to just after the newest activity from this page
                var newestInPage = pageItems.MaxBy(a => a.StartDate);
                if (newestInPage?.StartDateLocal != null)
                {
                    // Add 1 second to avoid duplicates
                    var newestDate = DateTime.Parse(newestInPage.StartDateLocal).AddSeconds(1);
                    currentOldest = newestDate.ToString("yyyy-MM-ddTHH:mm:ss");
                }
                else
                {
                    break;
                }
            }

            // Convert Intervals.icu DTOs to ActivitySummary
            var activities = allActivities.Select(ToActivitySummary).ToList();

            _logger.LogInformation("Successfully fetched {TotalActivities} activities from Intervals.icu", activities.Count);

            return new ActivityResult(
                Success: true,
                Activities: activities,
                ErrorMessage: null,
                ErrorStatusCode: null,
                RateLimit: null);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "HTTP error during activity fetch from Intervals.icu");
            return new ActivityResult(
                Success: false,
                Activities: null,
                ErrorMessage: "Network error communicating with Intervals.icu",
                ErrorStatusCode: (int)HttpStatusCode.BadGateway,
                RateLimit: null);
        }
        catch (TimeoutException ex)
        {
            _logger.LogError(ex, "Timeout during activity fetch from Intervals.icu");
            return new ActivityResult(
                Success: false,
                Activities: null,
                ErrorMessage: "Request timed out",
                ErrorStatusCode: (int)HttpStatusCode.GatewayTimeout,
                RateLimit: null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during activity fetch from Intervals.icu: {Message}", ex.Message);
            return new ActivityResult(
                Success: false,
                Activities: null,
                ErrorMessage: "Unexpected error fetching activities",
                ErrorStatusCode: (int)HttpStatusCode.InternalServerError,
                RateLimit: null);
        }
    }

    /// <summary>
    /// Converts an Intervals.icu activity DTO to the common ActivitySummary format.
    /// </summary>
    private static ActivitySummary ToActivitySummary(IntervalsIcuActivityDto dto)
    {
        // Parse the string ID - remove the 'i' prefix if present and parse as long
        var idString = dto.Id?.TrimStart('i') ?? "0";
        long.TryParse(idString, out var id);

        return new ActivitySummary
        {
            Id = id,
            Name = dto.Name,
            Type = dto.Type,
            SportType = dto.Type, // Intervals.icu uses 'type' for both
            StartDate = dto.StartDate,
            Distance = dto.Distance ?? 0,
            MovingTime = dto.MovingTime ?? 0,
            TotalElevationGain = dto.TotalElevationGain ?? 0,
            AverageHeartrate = dto.AverageHeartrate,
            MaxHeartrate = dto.MaxHeartrate
        };
    }

    /// <summary>
    /// DTO for Intervals.icu activity API response.
    /// </summary>
    private sealed class IntervalsIcuActivityDto
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }
        [JsonPropertyName("name")]
        public string? Name { get; set; }
        [JsonPropertyName("type")]
        public string? Type { get; set; }
        [JsonPropertyName("start_date_local")]
        public string? StartDateLocal { get; set; }
        [JsonPropertyName("start_date")]
        public DateTimeOffset StartDate { get; set; }
        [JsonPropertyName("distance")]
        public double? Distance { get; set; }
        [JsonPropertyName("moving_time")]
        public int? MovingTime { get; set; }
        [JsonPropertyName("total_elevation_gain")]
        public double? TotalElevationGain { get; set; }
        [JsonPropertyName("average_heartrate")]
        public double? AverageHeartrate { get; set; }
        [JsonPropertyName("max_heartrate")]
        public double? MaxHeartrate { get; set; }
    }
}
