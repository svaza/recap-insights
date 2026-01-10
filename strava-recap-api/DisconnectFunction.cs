using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Net;
using strava_recap_api.Extensions;

namespace strava_recap_api;

public sealed class DisconnectFunction
{
    private readonly ILogger<DisconnectFunction> _logger;

    public DisconnectFunction(ILogger<DisconnectFunction> logger)
    {
        _logger = logger;
    }

    [Function("Disconnect")]
    public HttpResponseData Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "disconnect")] HttpRequestData req)
    {
        var response = req.CreateResponse(HttpStatusCode.OK);
        response.ClearAllRecapCookies();
        
        return response;
    }
}
