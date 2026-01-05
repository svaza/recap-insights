namespace strava_recap_api.Entities;

/// <summary>
/// Authentication request containing access token and expiration information.
/// </summary>
public class AuthenticationRequest
{
    public string? AccessToken { get; set; }
    public long? ExpiresAt { get; set; }

    /// <summary>
    /// Checks if the authentication request is valid (token exists and not expired).
    /// </summary>
    public bool IsValid()
    {
        if (string.IsNullOrWhiteSpace(AccessToken))
            return false;

        if (ExpiresAt.HasValue && DateTimeOffset.UtcNow.ToUnixTimeSeconds() >= ExpiresAt.Value)
            return false;

        return true;
    }
}
