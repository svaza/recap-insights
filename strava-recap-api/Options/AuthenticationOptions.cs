using strava_recap_api.Providers;

namespace strava_recap_api.Options;

/// <summary>
/// OAuth client credentials for a specific provider.
/// </summary>
public class ClientSetting
{
    /// <summary>
    /// OAuth application client ID.
    /// </summary>
    public string ClientId { get; set; } = string.Empty;

    /// <summary>
    /// OAuth application client secret.
    /// </summary>
    public string ClientSecret { get; set; } = string.Empty;
}

/// <summary>
/// Configuration options for OAuth authentication across multiple providers.
/// </summary>
public class AuthenticationOptions
{
    /// <summary>
    /// OAuth redirect URI (shared across all providers, must be registered with each provider).
    /// </summary>
    public string RedirectUri { get; set; } = string.Empty;

    /// <summary>
    /// Client credentials for each supported provider.
    /// </summary>
    public Dictionary<ProviderType, ClientSetting> Providers { get; set; } = new();

    /// <summary>
    /// Gets the client settings for a specific provider.
    /// </summary>
    /// <param name="providerType">The provider type.</param>
    /// <returns>The client settings for the provider.</returns>
    /// <exception cref="InvalidOperationException">Thrown when provider is not configured.</exception>
    public ClientSetting GetProviderSettings(ProviderType providerType)
    {
        if (Providers.TryGetValue(providerType, out var settings))
        {
            return settings;
        }
        throw new InvalidOperationException($"Provider {providerType} is not configured.");
    }
}
