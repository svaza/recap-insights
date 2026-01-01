namespace strava_recap_api.Services;

/// <summary>
/// Service for generating OAuth authorization URLs.
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Generates an OAuth authorization URL.
    /// </summary>
    /// <param name="state">CSRF protection state token</param>
    /// <returns>Complete authorization URL</returns>
    string GenerateAuthorizationUrl(string state);
}
