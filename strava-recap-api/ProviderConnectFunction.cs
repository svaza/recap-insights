using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using strava_recap_api.Extensions;
using strava_recap_api.Providers;
using System.Net;

namespace strava_recap_api;

public class ProviderConnectFunction
{
    private readonly ILogger<ProviderConnectFunction> _logger;
    private readonly IProviderFactory _providerFactory;

    public ProviderConnectFunction(ILogger<ProviderConnectFunction> logger, IProviderFactory providerFactory)
    {
        _logger = logger;
        _providerFactory = providerFactory;
    }

    [Function(nameof(ProviderConnectFunction))]
    public HttpResponseData Connect(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "provider/connect")] HttpRequestData req)
    {
        try
        {
            var query = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            var returnTo = query.GetReturnTo();
            var providerTypeString = query["provider"] ?? "strava";
            var providerType = providerTypeString.ParseProviderType();

            _logger.LogInformation("Provider connect request for {ProviderType}", providerType);

            // Get the appropriate provider
            var provider = _providerFactory.GetProvider(providerType);

            // Encode provider type in state so we know which provider to use on callback
            var state = req.GenerateAuthState(returnTo, providerType);

            var authUrl = provider.AuthService.GenerateAuthorizationUrl(state);

            var response = req.GenerateResponseWithRedirect(authUrl);
            response.AddAuthStateCookie(state);

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in provider connect");
            var errorRes = req.CreateResponse(HttpStatusCode.InternalServerError);
            errorRes.WriteString("Unexpected error");
            return errorRes;
        }
    }
}
