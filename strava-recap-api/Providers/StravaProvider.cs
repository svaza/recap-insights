using strava_recap_api.Services;

namespace strava_recap_api.Providers;

/// <summary>
/// Strava provider implementation that bundles all Strava-specific services.
/// </summary>
public class StravaProvider : IProvider
{
    public ProviderType ProviderType => ProviderType.Strava;

    public IAuthService AuthService { get; }
    public ITokenService TokenService { get; }
    public IAthleteProfileService AthleteProfileService { get; }
    public IActivityService ActivityService { get; }

    public StravaProvider(
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
