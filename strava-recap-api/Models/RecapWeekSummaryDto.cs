namespace strava_recap_api.Models;

/// <summary>
/// DTO for a 7-day window aggregated activity totals.
/// </summary>
public sealed class RecapWeekSummaryDto
{
    public string StartDate { get; set; } = string.Empty;
    public string EndDate { get; set; } = string.Empty;
    public int Activities { get; set; }
    public double DistanceM { get; set; }
    public int MovingTimeSec { get; set; }
    public double ElevationM { get; set; }
}