namespace strava_recap_api.Models;

/// <summary>
/// DTO for a single day's aggregated activity totals.
/// </summary>
public sealed class RecapDaySummaryDto
{
    public string Date { get; set; } = string.Empty;
    public int Activities { get; set; }
    public double DistanceM { get; set; }
    public int MovingTimeSec { get; set; }
    public double ElevationM { get; set; }
}
