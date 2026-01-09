using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using strava_recap_api.Extensions;
using strava_recap_api.Providers;
using strava_recap_api.Models;

namespace strava_recap_api;

public sealed class AthleteProfileFunction
{
    private readonly ILogger<AthleteProfileFunction> _logger;
    private readonly IProviderFactory _providerFactory;

    public AthleteProfileFunction(ILogger<AthleteProfileFunction> logger, IProviderFactory providerFactory)
    {
        _logger = logger;
        _providerFactory = providerFactory;
    }

    [Function("AthleteProfile")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "me")] HttpRequestData req)
    {
        // 1) Extract authentication from request
        var authRequest = req.GenerateAuthenticationRequest();

        // 2) Validate authentication
        if (!authRequest.IsValid())
        {
            return await req.OkJson(new { connected = false });
        }

        // 3) Get provider type from cookies and resolve provider
        var providerType = req.GetProviderTypeFromCookies();
        var provider = _providerFactory.GetProvider(providerType);

        _logger.LogInformation("Fetching athlete profile from {ProviderType}", providerType);

        // 4) Fetch athlete profile using provider's service
        var athlete = await provider.AthleteProfileService.GetAthleteAsync(authRequest);

        if (athlete == null)
        {
            return await req.OkJson(new { connected = false });
        }

        // 5) Return athlete profile with provider info
        return await req.OkJson(new
        {
            connected = true,
            provider = providerType.ToCookieValue(),
            profile = athlete.ToDto()
        });
    }
}
