using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using strava_recap_api.Extensions;
using strava_recap_api.Options;
using System.Net;
using System.Net.Http.Json;

namespace strava_recap_api.Services;

/// <summary>
/// Strava-specific token exchange service implementation.
/// Handles callback parameter validation and token exchange.
/// </summary>
public class StravaTokenService : ITokenService
{
    private const string TokenEndpoint = "oauth/token";

    private readonly HttpClient _http;
    private readonly AuthenticationOptions _options;
    private readonly ILogger<StravaTokenService> _logger;

    public StravaTokenService(HttpClient http, IOptions<AuthenticationOptions> options, ILogger<StravaTokenService> logger)
    {
        _http = http;
        _http.BaseAddress = new Uri("https://www.strava.com/api/v3/");
        _options = options.Value;
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
            var state = req.GetStateFromQuery();

            // Check if user denied consent
            if (!string.IsNullOrEmpty(error))
            {
                _logger.LogWarning("User denied Strava consent: {Error}", error);
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
            var expectedState = req.GetStateFromCookies();
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
            _logger.LogInformation("Successfully obtained access token from Strava, expires at: {ExpiresAt}", token.ExpiresAt);

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
            _logger.LogError(ex, "HTTP error during token exchange with Strava");
            return new CallbackResult
            {
                Success = false,
                ErrorMessage = "Strava API error",
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
    /// Exchanges an authorization code for Strava access and refresh tokens.
    /// </summary>
    private async Task<TokenResponse> ExchangeCodeForTokenAsync(string code)
    {
        var form = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["client_id"] = _options.ClientId,
            ["client_secret"] = _options.ClientSecret,
            ["code"] = code,
            ["grant_type"] = "authorization_code"
        });

        var response = await _http.PostAsync(TokenEndpoint, form);
        response.EnsureSuccessStatusCode();

        var tokenData = await response.Content.ReadFromJsonAsync<StravaTokenResponse>()
            ?? throw new InvalidOperationException("No token response from Strava");

        return new TokenResponse(tokenData.access_token, tokenData.expires_at, tokenData.refresh_token);
    }

    /// <summary>
    /// Strava token exchange response DTO.
    /// </summary>
    private record StravaTokenResponse(string access_token, long expires_at, string refresh_token);
}
