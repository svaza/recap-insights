namespace strava_recap_api.Providers;

/// <summary>
/// Factory for resolving providers by type.
/// </summary>
public interface IProviderFactory
{
    /// <summary>
    /// Gets a provider by type.
    /// </summary>
    /// <param name="providerType">The type of provider to resolve.</param>
    /// <returns>The provider implementation.</returns>
    IProvider GetProvider(ProviderType providerType);

    /// <summary>
    /// Gets a provider by type string (parsed from cookie/query).
    /// </summary>
    /// <param name="providerTypeString">The provider type as a string.</param>
    /// <returns>The provider implementation.</returns>
    IProvider GetProvider(string? providerTypeString);
}
