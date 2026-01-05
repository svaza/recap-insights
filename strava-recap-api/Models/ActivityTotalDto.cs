namespace strava_recap_api.Models;

/// <summary>
/// DTO for aggregated activity totals.
/// </summary>
public sealed class ActivityTotalDto
{
    public int Activities { get; set; }
    public double DistanceM { get; set; }
    public int MovingTimeSec { get; set; }
    public double ElevationM { get; set; }
}
