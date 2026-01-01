namespace strava_recap_api.Options;

/// <summary>
/// Configuration options for Strava OAuth authentication.
/// </summary>
public class AuthenticationOptions
{
    /// <summary>
    /// Strava OAuth application client ID.
    /// </summary>
    public string ClientId { get; set; } = string.Empty;

    /// <summary>
    /// Strava OAuth application client secret.
    /// </summary>
    public string ClientSecret { get; set; } = string.Empty;

    /// <summary>
    /// Strava OAuth redirect URI (must be registered with Strava).
    /// </summary>
    public string RedirectUri { get; set; } = string.Empty;
}
