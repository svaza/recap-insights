using System.Net;
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
    private const string Scope = "ACTIVITY:READ";

    private readonly AuthenticationOptions _options;
    private readonly ClientSetting _clientSettings;

    public IntervalsIcuAuthService(IOptions<AuthenticationOptions> options)
    {
        _options = options.Value;
        _clientSettings = _options.GetProviderSettings(ProviderType.IntervalsIcu);
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
}
