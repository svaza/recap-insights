using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using strava_recap_api.Services;
using strava_recap_api.Extensions;
using strava_recap_api.Models;

namespace strava_recap_api;

public sealed class AthleteProfileFunction
{
    private readonly ILogger<AthleteProfileFunction> _logger;
    private readonly IAthleteProfileService _athleteProfileService;

    public AthleteProfileFunction(ILogger<AthleteProfileFunction> logger, IAthleteProfileService athleteProfileService)
    {
        _logger = logger;
        _athleteProfileService = athleteProfileService;
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

        // 3) Fetch athlete profile
        var athlete = await _athleteProfileService.GetAthleteAsync(authRequest);

        if (athlete == null)
        {
            return await req.OkJson(new { connected = false });
        }

        // 4) Return athlete profile
        return await req.OkJson(new
        {
            connected = true,
            profile = athlete.ToDto()
        });
    }
}
