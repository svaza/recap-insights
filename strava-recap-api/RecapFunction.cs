using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using strava_recap_api.Services;
using strava_recap_api.Extensions;
using strava_recap_api.Models;

namespace strava_recap_api;

public sealed class RecapFunction
{
    private readonly ILogger<RecapFunction> _logger;
    private readonly IActivityService _activityService;

    public RecapFunction(ILogger<RecapFunction> logger, IActivityService activityService)
    {
        _logger = logger;
        _activityService = activityService;
    }

    [Function("Recap")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "recap")] HttpRequestData req)
    {
        // 1) Generate recap request from HTTP request
        var recapRequest = req.GenerateRecapRequest();

        // 2) Validate authentication
        if (!recapRequest.Authentication.IsValid())
        {
            _logger.LogWarning("Recap request made without valid/non-expired access token");
            return await req.OkJson(new { connected = false });
        }

        // 3) Fetch activities
        var activitiesResult = await _activityService.GetActivitiesAsync(recapRequest);

        if (!activitiesResult.Success)
        {
            return await req.OkJson(activitiesResult.ToErrorResponse());
        }

        // 4) Map to proper DTO
        var activities = activitiesResult.Activities!
            //.Filter(recapRequest)
            .Select(a => a.ToDto())
            .ToList();

        // 5) Fetch athlete profile (optional)
        var athlete = await _activityService.GetAthleteAsync(recapRequest.Authentication.AccessToken!);
        var athleteName = athlete?.FullName ?? "[Unknown]";

        return await req.OkJson(new
        {
            connected = true,
            athleteName,
            range = new
            {
                startUtc = recapRequest.StartUtc.UtcDateTime.ToString("o"),
                endUtc = recapRequest.EndUtc.UtcDateTime.ToString("o")
            },
            activities
        });
    }
}