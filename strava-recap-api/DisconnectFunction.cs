using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Net;
using strava_recap_api.Extensions;
using strava_recap_api.Providers;

namespace strava_recap_api;

public sealed class DisconnectFunction
{
    private readonly ILogger<DisconnectFunction> _logger;
    private readonly IProviderFactory _providerFactory;

    public DisconnectFunction(ILogger<DisconnectFunction> logger, IProviderFactory providerFactory)
    {
        _logger = logger;
        _providerFactory = providerFactory;
    }

    [Function("Disconnect")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "disconnect")] HttpRequestData req)
    {
        var response = req.CreateResponse(HttpStatusCode.OK);

        try
        {
            // Get access token and provider from cookies
            var accessToken = req.GetAccessTokenFromCookies();
            var providerType = req.GetProviderTypeFromCookies();

            if (!string.IsNullOrEmpty(accessToken))
            {
                // Resolve provider and revoke access
                var provider = _providerFactory.GetProvider(providerType);
                var revoked = await provider.AuthService.RevokeAccessAsync(accessToken);

                if (revoked)
                {
                    _logger.LogInformation("Successfully revoked access token for provider {Provider}", providerType.ToDisplayName());
                }
                else
                {
                    _logger.LogWarning("Failed to revoke access token for provider {Provider}, but continuing with disconnect", providerType.ToDisplayName());
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error revoking access token during disconnect, but continuing with cookie cleanup");
        }

        // Always clear cookies regardless of revocation outcome
        response.ClearAllRecapCookies();
        
        return response;
    }
}
