namespace strava_recap_api.Models;

/// <summary>
/// DTO describing time-of-day activity tendencies.
/// </summary>
public sealed class RecapTimeOfDayDto
{
    public string Persona { get; set; } = string.Empty;
    public string Bucket { get; set; } = string.Empty;
    public int Activities { get; set; }
    public int TotalActivities { get; set; }
    public int Percent { get; set; }
}
