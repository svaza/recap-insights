using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using strava_recap_api.Extensions;
using strava_recap_api.Options;
using strava_recap_api.Providers;
using System.Net;
using System.Net.Http.Json;

namespace strava_recap_api.Services;

/// <summary>
/// Intervals.icu-specific token exchange service implementation.
/// Handles callback parameter validation and token exchange.
/// </summary>
public class IntervalsIcuTokenService : ITokenService
{
    private const string TokenEndpoint = "https://intervals.icu/api/oauth/token";

    private readonly HttpClient _http;
    private readonly ClientSetting _clientSettings;
    private readonly ILogger<IntervalsIcuTokenService> _logger;

    public IntervalsIcuTokenService(HttpClient http, IOptions<AuthenticationOptions> options, ILogger<IntervalsIcuTokenService> logger)
    {
        _http = http;
        _clientSettings = options.Value.GetProviderSettings(ProviderType.IntervalsIcu);
        _logger = logger;
    }

    /// <summary>
    /// Processes OAuth callback: extracts, validates parameters, and exchanges code for tokens.
    /// </summary>
    public async Task<CallbackResult> ProcessCallbackAsync(HttpRequestData req)
    {
        try
        {
            // Extract query parameters
            var error = req.GetErrorFromQuery();
            var code = req.GetCodeFromQuery();
            var state = WebUtility.UrlDecode(req.GetStateFromQuery() ?? string.Empty);

            // Check if user denied consent
            if (!string.IsNullOrEmpty(error))
            {
                _logger.LogWarning("User denied Intervals.icu consent: {Error}", error);
                return new CallbackResult
                {
                    Success = false,
                    ErrorMessage = "User denied consent",
                    ErrorStatusCode = (int)HttpStatusCode.Redirect
                };
            }

            // Check if authorization code is present
            if (string.IsNullOrWhiteSpace(code))
            {
                _logger.LogError("Missing authorization code in callback");
                return new CallbackResult
                {
                    Success = false,
                    ErrorMessage = "Missing authorization code",
                    ErrorStatusCode = (int)HttpStatusCode.BadRequest
                };
            }

            // Validate CSRF state token
            var expectedState = WebUtility.UrlDecode(req.GetStateFromCookies() ?? string.Empty);
            if (string.IsNullOrWhiteSpace(state) || string.IsNullOrWhiteSpace(expectedState) || state != expectedState)
            {
                _logger.LogError("State validation failed - possible CSRF attempt or session expired");
                return new CallbackResult
                {
                    Success = false,
                    ErrorMessage = "Invalid state token",
                    ErrorStatusCode = (int)HttpStatusCode.BadRequest
                };
            }

            _logger.LogInformation("State validation passed, exchanging code for tokens");

            // Exchange authorization code for tokens
            var token = await ExchangeCodeForTokenAsync(code);
            _logger.LogInformation("Successfully obtained access token from Intervals.icu, expires at: {ExpiresAt}", token.ExpiresAt);

            // Extract returnTo from state
            var returnTo = state.ExtractReturnToFromState();

            return new CallbackResult
            {
                Success = true,
                Token = token,
                ReturnTo = returnTo
            };
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "HTTP error during token exchange with Intervals.icu");
            return new CallbackResult
            {
                Success = false,
                ErrorMessage = "Intervals.icu API error",
                ErrorStatusCode = (int)HttpStatusCode.BadGateway
            };
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogError(ex, "Configuration or validation error in token service");
            return new CallbackResult
            {
                Success = false,
                ErrorMessage = "Configuration error",
                ErrorStatusCode = (int)HttpStatusCode.InternalServerError
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in token service: {Message}", ex.Message);
            return new CallbackResult
            {
                Success = false,
                ErrorMessage = "Unexpected error",
                ErrorStatusCode = (int)HttpStatusCode.InternalServerError
            };
        }
    }

    /// <summary>
    /// Exchanges an authorization code for Intervals.icu access and refresh tokens.
    /// </summary>
    private async Task<TokenResponse> ExchangeCodeForTokenAsync(string code)
    {
        var form = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["client_id"] = _clientSettings.ClientId,
            ["client_secret"] = _clientSettings.ClientSecret,
            ["code"] = code,
            ["grant_type"] = "authorization_code"
        });

        var response = await _http.PostAsync(TokenEndpoint, form);
        response.EnsureSuccessStatusCode();

        var tokenData = await response.Content.ReadFromJsonAsync<IntervalsIcuTokenResponse>()
            ?? throw new InvalidOperationException("No token response from Intervals.icu");

        // If expires_at is 0, set default expiration to 30 minutes from now
        var expiresAt = tokenData.expires_at;
        if (expiresAt == 0)
        {
            expiresAt = DateTimeOffset.UtcNow.AddMinutes(30).ToUnixTimeSeconds();
        }

        return new TokenResponse(tokenData.access_token, expiresAt, tokenData.refresh_token);
    }

    /// <summary>
    /// Intervals.icu token exchange response DTO.
    /// </summary>
    private record IntervalsIcuTokenResponse(string access_token, long expires_at, string refresh_token);
}
