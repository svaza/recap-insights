using Microsoft.Azure.Functions.Worker.Http;

namespace strava_recap_api.Services;

/// <summary>
/// Service for token exchange during OAuth callback.
/// </summary>
public interface ITokenService
{
    /// <summary>
    /// Processes OAuth callback request: validates parameters and exchanges code for tokens.
    /// </summary>
    /// <param name="req">HTTP request containing OAuth callback parameters</param>
    /// <returns>Callback result with token and returnTo URL if successful, error if validation fails</returns>
    Task<CallbackResult> ProcessCallbackAsync(HttpRequestData req);
}

/// <summary>
/// Token response from OAuth provider.
/// </summary>
public record TokenResponse(string AccessToken, long ExpiresAt, string RefreshToken);

/// <summary>
/// Result of OAuth callback processing.
/// </summary>
public record CallbackResult
{
    public bool Success { get; init; }
    public TokenResponse? Token { get; init; }
    public string? ReturnTo { get; init; }
    public string? ErrorMessage { get; init; }
    public int? ErrorStatusCode { get; init; }
}
