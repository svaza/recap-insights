using System.Net;
using Microsoft.Extensions.Options;
using strava_recap_api.Options;

namespace strava_recap_api.Services;

/// <summary>
/// Strava-specific OAuth authorization service implementation.
/// </summary>
public class StravaAuthService : IAuthService
{
    private const string AuthorizeEndpoint = "https://www.strava.com/oauth/authorize";
    private const string Scope = "activity:read_all";

    private readonly AuthenticationOptions _options;

    public StravaAuthService(IOptions<AuthenticationOptions> options)
    {
        _options = options.Value;
    }

    /// <summary>
    /// Generates the Strava authorization URL for OAuth flow.
    /// </summary>
    /// <param name="state">CSRF protection state token</param>
    /// <returns>Complete Strava authorization URL</returns>
    public string GenerateAuthorizationUrl(string state)
    {
        return AuthorizeEndpoint +
            $"?client_id={WebUtility.UrlEncode(_options.ClientId)}" +
            $"&redirect_uri={WebUtility.UrlEncode(_options.RedirectUri)}" +
            $"&response_type=code" +
            $"&approval_prompt=force" +
            $"&scope={WebUtility.UrlEncode(Scope)}" +
            $"&state={WebUtility.UrlEncode(state)}";
    }
}
