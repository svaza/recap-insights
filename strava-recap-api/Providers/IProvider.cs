using strava_recap_api.Services;

namespace strava_recap_api.Providers;

/// <summary>
/// Represents a data provider that exposes activity, athlete, and auth services.
/// Each provider implementation (Strava, intervals.icu, etc.) bundles its own service implementations.
/// </summary>
public interface IProvider
{
    /// <summary>
    /// The type of this provider.
    /// </summary>
    ProviderType ProviderType { get; }

    /// <summary>
    /// Service for generating OAuth authorization URLs.
    /// </summary>
    IAuthService AuthService { get; }

    /// <summary>
    /// Service for token exchange during OAuth callback.
    /// </summary>
    ITokenService TokenService { get; }

    /// <summary>
    /// Service for fetching athlete profile information.
    /// </summary>
    IAthleteProfileService AthleteProfileService { get; }

    /// <summary>
    /// Service for fetching activities.
    /// </summary>
    IActivityService ActivityService { get; }
}
