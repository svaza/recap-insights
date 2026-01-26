using System.Net;
using System.Net.Http.Headers;
using Microsoft.Extensions.Options;
using strava_recap_api.Options;
using strava_recap_api.Providers;

namespace strava_recap_api.Services.IntervalsIcu;

/// <summary>
/// Intervals.icu-specific OAuth authorization service implementation.
/// </summary>
public class IntervalsIcuAuthService : IAuthService
{
    private const string AuthorizeEndpoint = "https://intervals.icu/oauth/authorize";
    private const string DisconnectEndpoint = "https://intervals.icu/api/v1/disconnect-app";
    private const string Scope = "ACTIVITY:READ,SETTINGS:READ";

    private readonly AuthenticationOptions _options;
    private readonly ClientSetting _clientSettings;
    private readonly HttpClient _httpClient;

    public IntervalsIcuAuthService(IOptions<AuthenticationOptions> options, HttpClient httpClient)
    {
        _options = options.Value;
        _clientSettings = _options.GetProviderSettings(ProviderType.IntervalsIcu);
        _httpClient = httpClient;
    }

    /// <summary>
    /// Generates the Intervals.icu authorization URL for OAuth flow.
    /// </summary>
    /// <param name="state">CSRF protection state token</param>
    /// <returns>Complete Intervals.icu authorization URL</returns>
    public string GenerateAuthorizationUrl(string state)
    {
        return AuthorizeEndpoint +
            $"?client_id={WebUtility.UrlEncode(_clientSettings.ClientId)}" +
            $"&redirect_uri={WebUtility.UrlEncode(_options.RedirectUri)}" +
            $"&response_type=code" +
            $"&scope={WebUtility.UrlEncode(Scope)}" +
            $"&state={WebUtility.UrlEncode(state)}";
    }

    /// <summary>
    /// Revokes the Intervals.icu access token.
    /// </summary>
    /// <param name="accessToken">Access token to revoke</param>
    /// <returns>True if revocation succeeded, false otherwise</returns>
    public async Task<bool> RevokeAccessAsync(string accessToken)
    {
        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Delete, DisconnectEndpoint);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var response = await _httpClient.SendAsync(request);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }
}
