namespace strava_recap_api.Models;

/// <summary>
/// Summary DTO for an activity in the recap response.
/// </summary>
public class ActivitySummaryDto
{
    public long Id { get; set; }
    public string Name { get; set; } = "";
    public string Type { get; set; } = "Other";
    public string StartDateUtc { get; set; } = "";
    public double DistanceM { get; set; }
    public int MovingTimeSec { get; set; }
    public double ElevationM { get; set; }
    public double? AverageHeartrate { get; set; }
    public double? MaxHeartrate { get; set; }
}
