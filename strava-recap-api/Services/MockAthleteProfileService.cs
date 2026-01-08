using Microsoft.Extensions.Logging;
using strava_recap_api.Entities;

namespace strava_recap_api.Services;

/// <summary>
/// Mock athlete profile service that returns a hardcoded profile.
/// Useful for local development when Strava connectivity is unavailable.
/// </summary>
public class MockAthleteProfileService : IAthleteProfileService
{
    private readonly ILogger<MockAthleteProfileService> _logger;

    public MockAthleteProfileService(ILogger<MockAthleteProfileService> logger)
    {
        _logger = logger;
    }

    public Task<AthleteProfile?> GetAthleteAsync(AuthenticationRequest authRequest)
    {
        _logger.LogDebug("Returning mock athlete profile");
        return Task.FromResult<AthleteProfile?>(new AthleteProfile("Mock", "Athlete"));
    }
}
