namespace strava_recap_api.Models;

/// <summary>
/// DTO for athlete profile information.
/// </summary>
public sealed class AthleteProfileDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
}
