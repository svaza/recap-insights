using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using strava_recap_api.Extensions;
using strava_recap_api.Providers;
using strava_recap_api.Models;
using strava_recap_api.Services;

namespace strava_recap_api;

public sealed class RecapFunction
{
    private readonly ILogger<RecapFunction> _logger;
    private readonly IProviderFactory _providerFactory;

    public RecapFunction(ILogger<RecapFunction> logger, IProviderFactory providerFactory)
    {
        _logger = logger;
        _providerFactory = providerFactory;
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

        // 3) Get provider type from cookies and resolve provider
        var providerType = req.GetProviderTypeFromCookies();
        var provider = _providerFactory.GetProvider(providerType);

        _logger.LogInformation("Fetching activities from {ProviderType}", providerType);

        // 4) Fetch activities using provider's service
        var activitiesResult = await provider.ActivityService.GetActivitiesAsync(recapRequest);

        if (!activitiesResult.Success)
        {
            return await req.OkJson(activitiesResult.ToErrorResponse());
        }

        // 5) Compute totals and breakdown
        var allActivities = activitiesResult.Activities!;
        var availableActivityTypes = allActivities
            .ToBreakdown()
            .Select(b => b.Type)
            .ToList();

        var activities = string.IsNullOrWhiteSpace(recapRequest.ActivityType)
            ? allActivities
            : allActivities
                .Where(a => string.Equals(
                    a.SportType ?? a.Type ?? "Other",
                    recapRequest.ActivityType,
                    StringComparison.OrdinalIgnoreCase))
                .ToList();

        var total = activities.ToTotal().ToDto();
        var breakdown = activities.ToBreakdown().Select(b => b.ToDto()).ToList();
        var activeDays = activities.ToActiveDays();
        var highlights = activities.ToHighlights();

        return await req.OkJson(new RecapResponseDto
        {
            Connected = true,
            Provider = providerType.ToCookieValue(),
            Range = new RecapRangeDto
            {
                StartUtc = recapRequest.StartUtc.UtcDateTime.ToString("o"),
                EndUtc = recapRequest.EndUtc.UtcDateTime.ToString("o")
            },
            Total = total,
            AvailableActivityTypes = availableActivityTypes,
            Breakdown = breakdown,
            ActiveDays = activeDays,
            Highlights = highlights
        });
    }
}
