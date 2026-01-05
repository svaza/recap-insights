namespace strava_recap_api.Entities;

/// <summary>
/// Computed totals for a collection of activities.
/// </summary>
public record ActivityTotal(
    int Activities,
    double DistanceM,
    int MovingTimeSec,
    double ElevationM);
