using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using strava_recap_api.Extensions;
using strava_recap_api.Services;
using strava_recap_api.Models;

namespace strava_recap_api;

public class ProviderCallbackFunction
{
    private readonly ILogger<ProviderCallbackFunction> _logger;
    private readonly ITokenService _tokenService;

    public ProviderCallbackFunction(ILogger<ProviderCallbackFunction> logger, ITokenService tokenService)
    {
        _logger = logger;
        _tokenService = tokenService;
    }

    [Function("ProviderCallback")]
    public async Task<HttpResponseData> Callback(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "provider/callback")] HttpRequestData req)
    {
        _logger.LogInformation("Provider callback received");

        // Process callback and validate parameters
        var result = await _tokenService.ProcessCallbackAsync(req);

        if (result.Success)
        {
            // Create response with DTO
            var response = await req.OkJson(result.ToDto(), (response) =>
            {
                // Add authentication cookies
                response.AddAuthCookies(result.Token!.AccessToken, result.Token.ExpiresAt);
                response.ClearStateCookie();
            });

            return response;
        }
        else
        {
            // Return DTO response with error
            return await req.OkJson(result.ToDto());
        }
    }
}

