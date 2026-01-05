using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.AspNetCore.WebUtilities;
using strava_recap_api.Entities;
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
    public static ActivitySummaryDto ToDto(this Entities.ActivitySummary activity)
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
    public static IEnumerable<Entities.ActivitySummary> Filter(this IEnumerable<Entities.ActivitySummary> activities, RecapRequest recapRequest)
    {
        return activities.Where(a => a.StartDate >= recapRequest.StartUtc && a.StartDate < recapRequest.EndUtc);
    }

    /// <summary>
    /// Computes totals for a collection of activities.
    /// </summary>
    public static ActivityTotal ToTotal(this IEnumerable<ActivitySummary> activities)
    {
        var activityList = activities.ToList();
        
        return new ActivityTotal(
            Activities: activityList.Count,
            DistanceM: activityList.Sum(a => a.Distance),
            MovingTimeSec: activityList.Sum(a => a.MovingTime),
            ElevationM: activityList.Sum(a => a.TotalElevationGain)
        );
    }

    /// <summary>
    /// Groups activities by type and computes aggregated statistics for each type.
    /// </summary>
    public static IEnumerable<Entities.ActivityBreakdown> ToBreakdown(this IEnumerable<ActivitySummary> activities)
    {
        return activities
            .GroupBy(a => a.SportType ?? a.Type ?? "Other")
            .Select(g => new Entities.ActivityBreakdown(
                Type: g.Key,
                DistanceM: g.Sum(a => a.Distance),
                MovingTimeSec: g.Sum(a => a.MovingTime),
                ElevationM: g.Sum(a => a.TotalElevationGain)
            ))
            .OrderByDescending(b => b.MovingTimeSec);
    }

    /// <summary>
    /// Converts ActivityTotal to DTO.
    /// </summary>
    public static ActivityTotalDto ToDto(this Entities.ActivityTotal total)
    {
        return new ActivityTotalDto
        {
            Activities = total.Activities,
            DistanceM = total.DistanceM,
            MovingTimeSec = total.MovingTimeSec,
            ElevationM = total.ElevationM
        };
    }

    /// <summary>
    /// Converts ActivityBreakdown to DTO.
    /// </summary>
    public static ActivityBreakdownDto ToDto(this Entities.ActivityBreakdown breakdown)
    {
        return new ActivityBreakdownDto
        {
            Type = breakdown.Type,
            DistanceM = breakdown.DistanceM,
            MovingTimeSec = breakdown.MovingTimeSec,
            ElevationM = breakdown.ElevationM
        };
    }

    /// <summary>
    /// Converts AthleteProfile to DTO.
    /// </summary>
    public static AthleteProfileDto ToDto(this Entities.AthleteProfile profile)
    {
        return new AthleteProfileDto
        {
            FirstName = profile.FirstName,
            LastName = profile.LastName,
            FullName = profile.FullName
        };
    }

    /// <summary>
    /// Computes the set of unique active days (in YYYY-MM-DD format) from activities.
    /// Uses the activity's start date in local time to determine the day.
    /// </summary>
    public static HashSet<string> ToActiveDays(this IEnumerable<ActivitySummary> activities)
    {
        var activeDays = new HashSet<string>();
        
        foreach (var activity in activities)
        {
            var date = activity.StartDate.UtcDateTime;
            var dayKey = $"{date.Year:0000}-{date.Month:D2}-{date.Day:D2}";
            activeDays.Add(dayKey);
        }
        
        return activeDays;
    }

    /// <summary>
    /// Computes recap highlights (longest by duration, farthest by distance, etc.).
    /// </summary>
    public static RecapHighlightsDto ToHighlights(this IEnumerable<ActivitySummary> activities)
    {
        var activityList = activities.ToList();

        var longestByDuration = activityList
            .OrderByDescending(a => a.MovingTime)
            .FirstOrDefault();

        var farthestByDistance = activityList
            .OrderByDescending(a => a.Distance)
            .FirstOrDefault();

        return new RecapHighlightsDto
        {
            LongestActivity = longestByDuration?.ToDto(),
            FarthestActivity = farthestByDistance?.ToDto()
        };
    }
}
