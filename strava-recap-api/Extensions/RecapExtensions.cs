using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.AspNetCore.WebUtilities;
using strava_recap_api.Models;

namespace strava_recap_api.Extensions;

/// <summary>
/// Extension methods for recap operations.
/// </summary>
public static class RecapExtensions
{
    /// <summary>
    /// Generates a RecapRequest from HTTP request (auth from cookies, date range from query parameters).
    /// Does not validate - validation is the responsibility of the caller.
    /// </summary>
    public static RecapRequest GenerateRecapRequest(this HttpRequestData req)
    {
        // Extract authentication from cookies
        var accessToken = req.GetAccessTokenFromCookies();
        var expiresAt = req.GetTokenExpirationFromCookies();

        var authentication = new AuthenticationRequest
        {
            AccessToken = accessToken,
            ExpiresAt = expiresAt
        };

        // Extract date range from query parameters
        var query = QueryHelpers.ParseQuery(req.Url.Query);
        var type = query.TryGetValue("type", out var typeVal) ? typeVal.ToString() : null;
        var unit = query.TryGetValue("unit", out var unitVal) ? unitVal.ToString() : null;
        var days = query.TryGetValue("days", out var daysVal) ? daysVal.ToString() : null;
        var offset = query.TryGetValue("offset", out var offsetVal) ? offsetVal.ToString() : null;

        var (startUtc, endUtc) = RecapRequest.ComputeDateRange(type, unit, days, offset);

        return new RecapRequest
        {
            Authentication = authentication,
            StartUtc = startUtc,
            EndUtc = endUtc
        };
    }

    /// <summary>
    /// Maps an activity to ActivitySummaryDto.
    /// </summary>
    public static ActivitySummaryDto ToDto(this Services.StravaSummaryActivity activity)
    {
        return new ActivitySummaryDto
        {
            Id = activity.Id,
            Name = activity.Name ?? "(untitled)",
            Type = activity.SportType ?? activity.Type ?? "Other",
            StartDateUtc = activity.StartDate.UtcDateTime.ToString("o"),
            DistanceM = activity.Distance,
            MovingTimeSec = activity.MovingTime,
            ElevationM = activity.TotalElevationGain,
            AverageHeartrate = activity.AverageHeartrate,
            MaxHeartrate = activity.MaxHeartrate
        };
    }

    /// <summary>
    /// Filters activities to only those within the recap request date range.
    /// </summary>
    public static IEnumerable<Services.StravaSummaryActivity> Filter(this IEnumerable<Services.StravaSummaryActivity> activities, RecapRequest recapRequest)
    {
        return activities.Where(a => a.StartDate >= recapRequest.StartUtc && a.StartDate < recapRequest.EndUtc);
    }
}
