using Microsoft.Extensions.Logging;
using strava_recap_api.Entities;
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
        var activities = BuildActivities(recapRequest.StartUtc, recapRequest.EndUtc);

        return Task.FromResult(new ActivityResult(
            Success: true,
            Activities: activities,
            ErrorMessage: null,
            ErrorStatusCode: null,
            RateLimit: null));
    }

    private static List<ActivitySummary> BuildActivities(DateTimeOffset startUtc, DateTimeOffset endUtc)
    {
        var activities = new List<ActivitySummary>();
        var activityId = 10_000;

        // Calculate the number of days in the range
        var currentDate = startUtc.Date;
        var endDate = endUtc.Date;

        // Deterministic random based on the date (same date = same random activities)
        var random = new Random(currentDate.Year * 10000 + currentDate.Month * 100 + currentDate.Day);

        // Templates for additional activities (not the daily run)
        var additionalActivities = new (string name, string type, string sportType, double distanceKm, int movingMinutes, double elevationGainM, double? avgHr, double? maxHr, int weight)[]
        {
            ("Evening Walk", "Walk", "Walk", 4.1, 50, 40, null, null, 25),
            ("Mountain Hike", "Hike", "Hike", 12.5, 180, 820, 132, 158, 10),
            ("Pool Laps", "Swim", "Swim", 1.8, 45, 0, 124, 141, 15),
            ("Trail Session", "TrailRun", "TrailRun", 15.3, 95, 480, 152, 178, 12),
            ("Strength Circuit", "Workout", "StrengthTraining", 0.0, 50, 0, 118, 135, 20),
            ("Vinyasa Flow", "Workout", "Yoga", 0.0, 40, 0, 102, 118, 15),
            ("Lunch Ride", "Ride", "Ride", 24.6, 70, 210, 136, 165, 18),
            ("Row Intervals", "Rowing", "Rowing", 5.0, 30, 0, 142, 168, 10),
            ("Gravel Grind", "Ride", "GravelRide", 46.0, 130, 540, 138, 171, 8),
            ("Long Trail Day", "TrailRun", "TrailRun", 28.4, 220, 1320, 146, 172, 5),
            ("Stair Climber", "Workout", "Elliptical", 0.0, 35, 0, 120, 140, 12),
            ("Open Water", "Swim", "Swim", 2.4, 52, 0, 125, 146, 8),
            ("Sunset Hike", "Hike", "Hike", 9.8, 140, 650, 128, 154, 10),
            ("Indoor Ride", "VirtualRide", "VirtualRide", 30.0, 75, 320, 139, 168, 15),
        };

        var runVariations = new (string name, double distanceKm, int movingMinutes, double elevationGainM)[]
        {
            ("Morning Run", 8.5, 48, 85),
            ("Easy Run", 6.2, 36, 45),
            ("Tempo Run", 10.2, 55, 120),
            ("Recovery Jog", 5.0, 32, 30),
            ("Long Run", 16.8, 98, 180),
            ("Interval Session", 7.5, 42, 60),
            ("Hill Workout", 9.0, 52, 210),
        };

        while (currentDate <= endDate)
        {
            // Always add a daily run
            var runVariation = runVariations[random.Next(runVariations.Length)];
            var runTime = currentDate.AddHours(6 + random.Next(4)); // Between 6am and 10am

            activities.Add(new ActivitySummary
            {
                Id = activityId++,
                Name = runVariation.name,
                Type = "Run",
                SportType = "Run",
                StartDate = runTime,
                Distance = runVariation.distanceKm * 1000 * (0.9 + random.NextDouble() * 0.2), // ±10% variation
                MovingTime = (int)(runVariation.movingMinutes * 60 * (0.95 + random.NextDouble() * 0.1)), // ±5% variation
                TotalElevationGain = runVariation.elevationGainM * (0.8 + random.NextDouble() * 0.4), // ±20% variation
                AverageHeartrate = 145 + random.Next(15),
                MaxHeartrate = 168 + random.Next(12)
            });

            // 40% chance to add an additional activity on this day
            if (random.Next(100) < 40)
            {
                // Weighted random selection
                var totalWeight = additionalActivities.Sum(a => a.weight);
                var randomWeight = random.Next(totalWeight);
                var cumulativeWeight = 0;

                foreach (var template in additionalActivities)
                {
                    cumulativeWeight += template.weight;
                    if (randomWeight < cumulativeWeight)
                    {
                        var activityTime = currentDate.AddHours(14 + random.Next(6)); // Between 2pm and 8pm

                        activities.Add(new ActivitySummary
                        {
                            Id = activityId++,
                            Name = template.name,
                            Type = template.type,
                            SportType = template.sportType,
                            StartDate = activityTime,
                            Distance = template.distanceKm * 1000 * (0.9 + random.NextDouble() * 0.2),
                            MovingTime = (int)(template.movingMinutes * 60 * (0.95 + random.NextDouble() * 0.1)),
                            TotalElevationGain = template.elevationGainM * (0.8 + random.NextDouble() * 0.4),
                            AverageHeartrate = template.avgHr,
                            MaxHeartrate = template.maxHr
                        });
                        break;
                    }
                }
            }

            currentDate = currentDate.AddDays(1);
        }

        return activities.OrderByDescending(a => a.StartDate).ToList();
    }
}