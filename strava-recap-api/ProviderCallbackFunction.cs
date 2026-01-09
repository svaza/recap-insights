using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using strava_recap_api.Extensions;
using strava_recap_api.Providers;
using strava_recap_api.Models;
using strava_recap_api.Services;

namespace strava_recap_api;

public class ProviderCallbackFunction
{
    private readonly ILogger<ProviderCallbackFunction> _logger;
    private readonly IProviderFactory _providerFactory;

    public ProviderCallbackFunction(ILogger<ProviderCallbackFunction> logger, IProviderFactory providerFactory)
    {
        _logger = logger;
        _providerFactory = providerFactory;
    }

    [Function("ProviderCallback")]
    public async Task<HttpResponseData> Callback(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "provider/callback")] HttpRequestData req)
    {
        _logger.LogInformation("Provider callback received");

        // Extract provider type from state cookie
        var stateCookie = req.GetStateFromCookies();
        var providerType = stateCookie?.ExtractProviderTypeFromState() ?? ProviderType.Strava;

        _logger.LogInformation("Processing callback for provider: {ProviderType}", providerType);

        // Get the appropriate provider
        var provider = _providerFactory.GetProvider(providerType);

        // Process callback and validate parameters using provider's token service
        var result = await provider.TokenService.ProcessCallbackAsync(req);

        if (result.Success)
        {
            // Create response with DTO
            var response = await req.OkJson(result.ToDto(providerType), (response) =>
            {
                // Add authentication cookies with provider type
                response.AddAuthCookies(result.Token!.AccessToken, result.Token.ExpiresAt, providerType);
                response.ClearStateCookie();
            });

            return response;
        }
        else
        {
            // Return DTO response with error
            return await req.OkJson(result.ToDto(providerType));
        }
    }
}

