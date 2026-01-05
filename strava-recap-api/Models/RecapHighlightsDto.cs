namespace strava_recap_api.Models;

/// <summary>
/// DTO for recap activity highlights (longest, farthest, etc.).
/// </summary>
public sealed class RecapHighlightsDto
{
    public ActivitySummaryDto? LongestActivity { get; set; }
    public ActivitySummaryDto? FarthestActivity { get; set; }
}
