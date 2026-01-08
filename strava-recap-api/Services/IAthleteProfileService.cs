using strava_recap_api.Entities;

namespace strava_recap_api.Services;

/// <summary>
/// Service for fetching athlete profile information.
/// </summary>
public interface IAthleteProfileService
{
    /// <summary>
    /// Fetches athlete's profile information.
    /// Returns null if the token is invalid or the fetch fails.
    /// </summary>
    Task<AthleteProfile?> GetAthleteAsync(AuthenticationRequest authRequest);
}
