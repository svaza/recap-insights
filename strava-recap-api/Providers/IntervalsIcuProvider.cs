using strava_recap_api.Services;

namespace strava_recap_api.Providers;

/// <summary>
/// Intervals.icu provider implementation that bundles all Intervals.icu-specific services.
/// </summary>
public class IntervalsIcuProvider : IProvider
{
    public ProviderType ProviderType => ProviderType.IntervalsIcu;

    public IAuthService AuthService { get; }
    public ITokenService TokenService { get; }
    public IAthleteProfileService AthleteProfileService { get; }
    public IActivityService ActivityService { get; }

    public IntervalsIcuProvider(
        IAuthService authService,
        ITokenService tokenService,
        IAthleteProfileService athleteProfileService,
        IActivityService activityService)
    {
        AuthService = authService;
        TokenService = tokenService;
        AthleteProfileService = athleteProfileService;
        ActivityService = activityService;
    }
}
