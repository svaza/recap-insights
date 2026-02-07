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
        var activityType = query.TryGetValue("activityType", out var activityTypeVal)
            ? activityTypeVal.ToString()
            : null;
        activityType = string.IsNullOrWhiteSpace(activityType) ? null : activityType.Trim();

        var (startUtc, endUtc) = RecapRequest.ComputeDateRange(type, unit, days, offset);

        return new RecapRequest
        {
            Authentication = authentication,
            StartUtc = startUtc,
            EndUtc = endUtc,
            ActivityType = activityType
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
                Activities: g.Count(),
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
            Activities = breakdown.Activities,
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
        const double MinPaceDistanceM = 1000;
        const double Min5kDistanceM = 5000;
        const double Min10kDistanceM = 10000;

        var longestByDuration = activityList
            .OrderByDescending(a => a.MovingTime)
            .FirstOrDefault();

        var farthestByDistance = activityList
            .OrderByDescending(a => a.Distance)
            .FirstOrDefault();

        var biggestClimb = activityList
            .Where(a => a.TotalElevationGain > 0)
            .OrderByDescending(a => a.TotalElevationGain)
            .FirstOrDefault();

        var paceCandidates = activityList
            .Where(a => a.Distance >= MinPaceDistanceM && a.MovingTime > 0)
            .ToList();

        var fastestByPace = paceCandidates
            .OrderBy(a => a.MovingTime / a.Distance)
            .FirstOrDefault();

        var best5k = paceCandidates
            .Where(a => a.Distance >= Min5kDistanceM)
            .OrderBy(a => a.MovingTime / a.Distance)
            .FirstOrDefault();

        var best10k = paceCandidates
            .Where(a => a.Distance >= Min10kDistanceM)
            .OrderBy(a => a.MovingTime / a.Distance)
            .FirstOrDefault();

        var mostActiveDay = activityList
            .GroupBy(a => a.StartDate.UtcDateTime.Date)
            .Select(g => new
            {
                Date = g.Key,
                Activities = g.Count(),
                DistanceM = g.Sum(a => a.Distance),
                MovingTimeSec = g.Sum(a => a.MovingTime),
                ElevationM = g.Sum(a => a.TotalElevationGain)
            })
            .OrderByDescending(d => d.DistanceM)
            .ThenByDescending(d => d.MovingTimeSec)
            .FirstOrDefault();

        RecapDaySummaryDto? mostActiveDayDto = mostActiveDay == null
            ? null
            : new RecapDaySummaryDto
            {
                Date = mostActiveDay.Date.ToString("yyyy-MM-dd"),
                Activities = mostActiveDay.Activities,
                DistanceM = mostActiveDay.DistanceM,
                MovingTimeSec = mostActiveDay.MovingTimeSec,
                ElevationM = mostActiveDay.ElevationM
            };

        RecapWeekSummaryDto? longestWeeklyDistance = null;
        if (activityList.Count > 0)
        {
            var dayTotals = activityList
                .GroupBy(a => a.StartDate.UtcDateTime.Date)
                .ToDictionary(
                    g => g.Key,
                    g => new
                    {
                        Activities = g.Count(),
                        DistanceM = g.Sum(a => a.Distance),
                        MovingTimeSec = g.Sum(a => a.MovingTime),
                        ElevationM = g.Sum(a => a.TotalElevationGain)
                    });

            if (dayTotals.Count > 0)
            {
                var minDate = dayTotals.Keys.Min();
                var maxDate = dayTotals.Keys.Max();

                var dates = new List<DateTime>();
                for (var d = minDate; d <= maxDate; d = d.AddDays(1))
                {
                    dates.Add(d);
                }

                var dailyTotals = dates
                    .Select(d => dayTotals.TryGetValue(d, out var t)
                        ? t
                        : new { Activities = 0, DistanceM = 0.0, MovingTimeSec = 0, ElevationM = 0.0 })
                    .ToList();

                var windowLength = Math.Min(7, dailyTotals.Count);
                var bestDistance = 0.0;
                var bestStartIndex = 0;
                var bestActivities = 0;
                var bestMovingTimeSec = 0;
                var bestElevationM = 0.0;

                var sumDistance = 0.0;
                var sumActivities = 0;
                var sumMovingTimeSec = 0;
                var sumElevationM = 0.0;

                for (var i = 0; i < dailyTotals.Count; i++)
                {
                    var day = dailyTotals[i];
                    sumDistance += day.DistanceM;
                    sumActivities += day.Activities;
                    sumMovingTimeSec += day.MovingTimeSec;
                    sumElevationM += day.ElevationM;

                    if (i >= windowLength)
                    {
                        var removeDay = dailyTotals[i - windowLength];
                        sumDistance -= removeDay.DistanceM;
                        sumActivities -= removeDay.Activities;
                        sumMovingTimeSec -= removeDay.MovingTimeSec;
                        sumElevationM -= removeDay.ElevationM;
                    }

                    if (i >= windowLength - 1 && sumDistance > bestDistance)
                    {
                        bestDistance = sumDistance;
                        bestActivities = sumActivities;
                        bestMovingTimeSec = sumMovingTimeSec;
                        bestElevationM = sumElevationM;
                        bestStartIndex = i - windowLength + 1;
                    }
                }

                if (bestDistance > 0 && dates.Count > 0)
                {
                    var startDate = dates[bestStartIndex];
                    var endDate = dates[Math.Min(dates.Count - 1, bestStartIndex + windowLength - 1)];
                    longestWeeklyDistance = new RecapWeekSummaryDto
                    {
                        StartDate = startDate.ToString("yyyy-MM-dd"),
                        EndDate = endDate.ToString("yyyy-MM-dd"),
                        Activities = bestActivities,
                        DistanceM = bestDistance,
                        MovingTimeSec = bestMovingTimeSec,
                        ElevationM = bestElevationM
                    };
                }
            }
        }

        RecapTimeOfDayDto? timeOfDayPersona = null;
        if (activityList.Count > 0)
        {
            var buckets = new[]
            {
                new { Start = 0, End = 6, Persona = "Night owl", Label = "12am-6am" },
                new { Start = 6, End = 12, Persona = "Early bird", Label = "6am-12pm" },
                new { Start = 12, End = 18, Persona = "Midday mover", Label = "12pm-6pm" },
                new { Start = 18, End = 24, Persona = "Evening regular", Label = "6pm-12am" }
            };

            var counts = new int[buckets.Length];
            foreach (var activity in activityList)
            {
                var hour = activity.StartDate.UtcDateTime.Hour;
                var idx = hour < 6 ? 0 : hour < 12 ? 1 : hour < 18 ? 2 : 3;
                counts[idx] += 1;
            }

            var maxIdx = 0;
            for (var i = 1; i < counts.Length; i++)
            {
                if (counts[i] > counts[maxIdx])
                {
                    maxIdx = i;
                }
            }

            var totalActivities = activityList.Count;
            var maxCount = counts[maxIdx];
            var percent = totalActivities > 0
                ? (int)Math.Round(100.0 * maxCount / totalActivities)
                : 0;

            timeOfDayPersona = new RecapTimeOfDayDto
            {
                Persona = buckets[maxIdx].Persona,
                Bucket = buckets[maxIdx].Label,
                Activities = maxCount,
                TotalActivities = totalActivities,
                Percent = percent
            };
        }

        var highestAvgHr = activityList
            .Where(a => a.AverageHeartrate.HasValue)
            .OrderByDescending(a => a.AverageHeartrate)
            .FirstOrDefault();

        var highestMaxHr = activityList
            .Where(a => a.MaxHeartrate.HasValue)
            .OrderByDescending(a => a.MaxHeartrate)
            .FirstOrDefault();

        return new RecapHighlightsDto
        {
            LongestActivity = longestByDuration?.ToDto(),
            FarthestActivity = farthestByDistance?.ToDto(),
            BiggestClimbActivity = biggestClimb?.ToDto(),
            FastestPaceActivity = fastestByPace?.ToDto(),
            Best5kActivity = best5k?.ToDto(),
            Best10kActivity = best10k?.ToDto(),
            MostActiveDay = mostActiveDayDto,
            LongestWeeklyDistance = longestWeeklyDistance,
            TimeOfDayPersona = timeOfDayPersona,
            HighestAvgHeartrateActivity = highestAvgHr?.ToDto(),
            HighestMaxHeartrateActivity = highestMaxHr?.ToDto()
        };
    }
}
