using strava_recap_api.Entities;

namespace strava_recap_api.Services;

/// <summary>
/// Service for fetching Strava activities.
/// </summary>
public interface IActivityService
{
    /// <summary>
    /// Fetches athlete's activities based on the recap request.
    /// </summary>
    Task<ActivityResult> GetActivitiesAsync(RecapRequest recapRequest);
}

