using strava_recap_api.Entities;

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
    Task<AthleteProfile?> GetAthleteAsync(string accessToken);
}

