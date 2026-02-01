namespace strava_recap_api.Models;

/// <summary>
/// DTO for recap activity highlights (longest, farthest, etc.).
/// </summary>
public sealed class RecapHighlightsDto
{
    public ActivitySummaryDto? LongestActivity { get; set; }
    public ActivitySummaryDto? FarthestActivity { get; set; }
    public ActivitySummaryDto? BiggestClimbActivity { get; set; }
    public ActivitySummaryDto? FastestPaceActivity { get; set; }
    public ActivitySummaryDto? Best5kActivity { get; set; }
    public ActivitySummaryDto? Best10kActivity { get; set; }
    public RecapDaySummaryDto? MostActiveDay { get; set; }
    public RecapTimeOfDayDto? TimeOfDayPersona { get; set; }
    public ActivitySummaryDto? HighestAvgHeartrateActivity { get; set; }
    public ActivitySummaryDto? HighestMaxHeartrateActivity { get; set; }
}
