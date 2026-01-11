using System.Net;
using strava_recap_api.Entities;
using strava_recap_api.Models;
using strava_recap_api.Providers;

namespace strava_recap_api.Services;

/// <summary>
/// Extension methods for activity service results.
/// </summary>
public static class ActivityResultExtensions
{
    /// <summary>
    /// Creates an error response object from a failed ActivityResult.
    /// </summary>
    public static object ToErrorResponse(this Entities.ActivityResult result)
    {
        if (result.Success)
            throw new InvalidOperationException("Cannot create error response from successful result");

        // Rate limit error
        if (result.RateLimit != null)
        {
            return new
            {
                connected = true,
                error = result.ErrorMessage,
                rateLimit = new
                {
                    limit = result.RateLimit.Limit,
                    usage = result.RateLimit.Usage,
                    readLimit = result.RateLimit.ReadLimit,
                    readUsage = result.RateLimit.ReadUsage
                }
            };
        }

        // Auth error - treat as disconnected
        if (result.ErrorStatusCode == (int)HttpStatusCode.Unauthorized)
        {
            return new { connected = false };
        }

        // Other errors
        return new { connected = true, error = result.ErrorMessage };
    }
}

/// <summary>
/// Extension methods for token service callback results.
/// </summary>
public static class CallbackResultExtensions
{
    /// <summary>
    /// Converts a token service CallbackResult to a CallbackResultDto for client response.
    /// </summary>
    public static CallbackResultDto ToDto(this CallbackResult result, ProviderType providerType = ProviderType.Strava)
    {
        var providerName = providerType.ToDisplayName();
        return new CallbackResultDto
        {
            Success = result.Success,
            Provider = providerType.ToCookieValue(),
            Message = result.Success ? $"Successfully connected to {providerName}" : result.ErrorMessage,
            ReturnTo = result.ReturnTo,
            ErrorStatusCode = result.ErrorStatusCode
        };
    }
}
