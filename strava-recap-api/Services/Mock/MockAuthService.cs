namespace strava_recap_api.Services.Mock;

/// <summary>
/// Mock OAuth authorization service for testing.
/// </summary>
public class MockAuthService : IAuthService
{
    /// <summary>
    /// Generates a mock authorization URL.
    /// </summary>
    /// <param name="state">CSRF protection state token</param>
    /// <returns>Mock authorization URL</returns>
    public string GenerateAuthorizationUrl(string state)
    {
        return $"https://mock.example.com/oauth/authorize?state={state}";
    }

    /// <summary>
    /// Mock implementation that always returns true.
    /// </summary>
    /// <param name="accessToken">Access token to revoke (not used)</param>
    /// <returns>Always returns true</returns>
    public Task<bool> RevokeAccessAsync(string accessToken)
    {
        return Task.FromResult(true);
    }
}
