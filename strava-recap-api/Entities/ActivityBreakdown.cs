namespace strava_recap_api.Entities;

/// <summary>
/// Aggregated activity statistics grouped by activity type.
/// </summary>
public record ActivityBreakdown(
    string Type,
    double DistanceM,
    int MovingTimeSec,
    double ElevationM);
