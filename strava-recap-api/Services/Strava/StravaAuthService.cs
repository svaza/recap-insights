using System.Net;
using Microsoft.Extensions.Options;
using strava_recap_api.Options;
using strava_recap_api.Providers;

namespace strava_recap_api.Services.Strava;

/// <summary>
/// Strava-specific OAuth authorization service implementation.
/// </summary>
public class StravaAuthService : IAuthService
{
    private const string AuthorizeEndpoint = "https://www.strava.com/oauth/authorize";
    private const string DeauthorizeEndpoint = "https://www.strava.com/oauth/deauthorize";
    private const string Scope = "activity:read_all";

    private readonly AuthenticationOptions _options;
    private readonly ClientSetting _clientSettings;
    private readonly HttpClient _httpClient;

    public StravaAuthService(IOptions<AuthenticationOptions> options, HttpClient httpClient)
    {
        _options = options.Value;
        _clientSettings = _options.GetProviderSettings(ProviderType.Strava);
        _httpClient = httpClient;
    }

    /// <summary>
    /// Generates the Strava authorization URL for OAuth flow.
    /// </summary>
    /// <param name="state">CSRF protection state token</param>
    /// <returns>Complete Strava authorization URL</returns>
    public string GenerateAuthorizationUrl(string state)
    {
        return AuthorizeEndpoint +
            $"?client_id={WebUtility.UrlEncode(_clientSettings.ClientId)}" +
            $"&redirect_uri={WebUtility.UrlEncode(_options.RedirectUri)}" +
            $"&response_type=code" +
            $"&approval_prompt=force" +
            $"&scope={WebUtility.UrlEncode(Scope)}" +
            $"&state={WebUtility.UrlEncode(state)}";
    }

    /// <summary>
    /// Revokes the Strava access token.
    /// </summary>
    /// <param name="accessToken">Access token to revoke</param>
    /// <returns>True if revocation succeeded, false otherwise</returns>
    public async Task<bool> RevokeAccessAsync(string accessToken)
    {
        try
        {
            var content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                { "access_token", accessToken }
            });

            var response = await _httpClient.PostAsync(DeauthorizeEndpoint, content);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }
}
