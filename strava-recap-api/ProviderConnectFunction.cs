using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using strava_recap_api.Extensions;
using strava_recap_api.Services;
using System.Net;

namespace strava_recap_api;

public class ProviderConnectFunction
{
    private readonly ILogger<ProviderConnectFunction> _logger;
    private readonly IAuthService _authService;

    public ProviderConnectFunction(ILogger<ProviderConnectFunction> logger, IAuthService authService)
    {
        _logger = logger;
        _authService = authService;
    }

    [Function(nameof(ProviderConnectFunction))]
    public HttpResponseData Connect(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "provider/connect")] HttpRequestData req)
    {
        try
        {
            var query = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            var returnTo = query.GetReturnTo();

            var state = req.GenerateAuthState(returnTo);

            var authUrl = _authService.GenerateAuthorizationUrl(state);

            var response = req.GenerateResponseWithRedirect(authUrl);
            response.AddAuthStateCookie(state);

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in Strava connect");
            var errorRes = req.CreateResponse(HttpStatusCode.InternalServerError);
            errorRes.WriteString("Unexpected error");
            return errorRes;
        }
    }
}
