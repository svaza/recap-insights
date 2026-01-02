using Microsoft.Extensions.Logging;
using strava_recap_api.Models;

namespace strava_recap_api.Services;

/// <summary>
/// Mock activity service that returns deterministic, hardcoded activities filtered by the requested date range.
/// Useful for local development when Strava connectivity is unavailable.
/// </summary>
public class MockActivityService : IActivityService
{
    private readonly ILogger<MockActivityService> _logger;

    public MockActivityService(ILogger<MockActivityService> logger)
    {
        _logger = logger;
    }

    public Task<ActivityResult> GetActivitiesAsync(RecapRequest recapRequest)
    {
        var seededActivities = BuildActivities(recapRequest.EndUtc);

        var filtered = seededActivities
            .Where(a => a.StartDate >= recapRequest.StartUtc && a.StartDate <= recapRequest.EndUtc)
            .OrderByDescending(a => a.StartDate)
            .ToList();

        _logger.LogInformation("MockActivityService returning {Count} activities between {Start} and {End}", filtered.Count, recapRequest.StartUtc, recapRequest.EndUtc);

        return Task.FromResult(new ActivityResult(
            Success: true,
            Activities: filtered,
            ErrorMessage: null,
            ErrorStatusCode: null,
            RateLimit: null));
    }

    public Task<StravaAthleteProfile?> GetAthleteAsync(string accessToken)
    {
        // Always return a simple mock profile
        return Task.FromResult<StravaAthleteProfile?>(new StravaAthleteProfile("Mock", "Athlete"));
    }

    private static List<StravaSummaryActivity> BuildActivities(DateTimeOffset anchorUtc)
    {
        // Anchor all mock activities relative to the requested end date to keep them in-range for typical recap windows.
        var baseDate = anchorUtc.Date.AddHours(6); // morning start to make timestamps predictable

        var templates = new (int daysAgo, string name, string type, string sportType, double distanceKm, int movingMinutes, double elevationGainM, double? avgHr, double? maxHr)[]
        {
            (1, "Sunrise Run", "Run", "Run", 10.2, 55, 120, 148, 172),
            (2, "Evening Walk", "Walk", "Walk", 4.1, 50, 40, null, null),
            (3, "Mountain Hike", "Hike", "Hike", 12.5, 180, 820, 132, 158),
            (4, "Pool Laps", "Swim", "Swim", 1.8, 45, 0, 124, 141),
            (5, "Trail Session", "TrailRun", "TrailRun", 15.3, 95, 480, 152, 178),
            (6, "Strength Circuit", "Workout", "StrengthTraining", 0.0, 50, 0, 118, 135),
            (7, "Vinyasa Flow", "Workout", "Yoga", 0.0, 40, 0, 102, 118),
            (9, "Lunch Ride", "Ride", "Ride", 24.6, 70, 210, 136, 165),
            (11, "Row Intervals", "Rowing", "Rowing", 5.0, 30, 0, 142, 168),
            (13, "Treadmill Tempo", "Run", "Run", 8.0, 42, 30, 150, 173),
            (15, "Evening Walk", "Walk", "Walk", 3.8, 46, 30, null, null),
            (18, "Gravel Grind", "Ride", "GravelRide", 46.0, 130, 540, 138, 171),
            (20, "Long Trail Day", "TrailRun", "TrailRun", 28.4, 220, 1320, 146, 172),
            (23, "Easy Recovery Run", "Run", "Run", 6.2, 36, 25, 141, 160),
            (25, "Stair Climber", "Workout", "Elliptical", 0.0, 35, 0, 120, 140),
            (28, "Open Water", "Swim", "Swim", 2.4, 52, 0, 125, 146),
            (32, "Sunset Hike", "Hike", "Hike", 9.8, 140, 650, 128, 154),
            (36, "Trail Shakeout", "TrailRun", "TrailRun", 7.5, 55, 220, 144, 166),
            (40, "Indoor Ride", "VirtualRide", "VirtualRide", 30.0, 75, 320, 139, 168),
            (45, "Row + Core", "Rowing", "Rowing", 4.2, 28, 0, 140, 164)
        };

        var activities = new List<StravaSummaryActivity>(templates.Length);

        for (var i = 0; i < templates.Length; i++)
        {
            var t = templates[i];
            activities.Add(new StravaSummaryActivity
            {
                Id = 10_000 + i,
                Name = t.name,
                Type = t.type,
                SportType = t.sportType,
                StartDate = baseDate.AddDays(-t.daysAgo),
                Distance = t.distanceKm * 1000, // convert km to meters
                MovingTime = t.movingMinutes * 60,
                TotalElevationGain = t.elevationGainM,
                AverageHeartrate = t.avgHr,
                MaxHeartrate = t.maxHr
            });
        }

        return activities;
    }
}