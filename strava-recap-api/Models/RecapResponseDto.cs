namespace strava_recap_api.Models;

/// <summary>
/// DTO for recap response.
/// </summary>
public sealed class RecapResponseDto
{
    public bool Connected { get; set; }
    public string? Provider { get; set; }
    public RecapRangeDto Range { get; set; } = null!;
    public ActivityTotalDto Total { get; set; } = null!;
    public List<ActivityBreakdownDto> Breakdown { get; set; } = new();
    public HashSet<string> ActiveDays { get; set; } = new();
    public RecapHighlightsDto Highlights { get; set; } = null!;
}

/// <summary>
/// DTO for recap date range.
/// </summary>
public sealed class RecapRangeDto
{
    public string StartUtc { get; set; } = string.Empty;
    public string EndUtc { get; set; } = string.Empty;
}
