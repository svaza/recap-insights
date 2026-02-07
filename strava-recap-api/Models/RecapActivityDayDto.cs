namespace strava_recap_api.Models;

/// <summary>
/// DTO for per-day activity summary used by the recap heatmap.
/// </summary>
public sealed class RecapActivityDayDto
{
    public string Date { get; set; } = string.Empty;
    public int Activities { get; set; }
    public double DistanceM { get; set; }
    public int MovingTimeSec { get; set; }
    public int EffortScore { get; set; }
    public string EffortMetric { get; set; } = "none";
    public double EffortValue { get; set; }
    public string? EffortType { get; set; }
    public List<string> Types { get; set; } = new();
}
