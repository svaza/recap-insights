using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using strava_recap_api.Entities;

namespace strava_recap_api.Services.Strava;

/// <summary>
/// Strava-specific athlete profile service implementation.
/// Handles fetching athlete profile from Strava API.
/// </summary>
public class StravaAthleteProfileService : IAthleteProfileService
{
    private readonly HttpClient _http;
    private readonly ILogger<StravaAthleteProfileService> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    public StravaAthleteProfileService(HttpClient http, ILogger<StravaAthleteProfileService> logger)
    {
        _http = http;
        _http.BaseAddress = new Uri("https://www.strava.com/api/v3/");
        _logger = logger;
    }

    /// <summary>
    /// Fetches athlete's profile information. Returns null if fetch fails.
    /// </summary>
    public async Task<AthleteProfile?> GetAthleteAsync(AuthenticationRequest authRequest)
    {
        try
        {
            _logger.LogDebug("Fetching athlete profile from Strava");

            using var msg = new HttpRequestMessage(HttpMethod.Get, "athlete");
            msg.Headers.Authorization = new AuthenticationHeaderValue("Bearer", authRequest.AccessToken);

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

            var profile = new AthleteProfile(athlete.FirstName ?? "", athlete.LastName ?? "");
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
