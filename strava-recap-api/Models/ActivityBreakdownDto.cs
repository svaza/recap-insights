namespace strava_recap_api.Models;

/// <summary>
/// DTO for activity breakdown by type.
/// </summary>
public sealed class ActivityBreakdownDto
{
    public string Type { get; set; } = string.Empty;
    public double DistanceM { get; set; }
    public int MovingTimeSec { get; set; }
    public double ElevationM { get; set; }
}
