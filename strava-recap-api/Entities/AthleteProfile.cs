namespace strava_recap_api.Entities;

/// <summary>
/// Strava athlete profile.
/// </summary>
public record AthleteProfile(string FirstName, string LastName)
{
    public string FullName => $"{FirstName} {LastName}".Trim();
}
