namespace strava_recap_api.Providers;

/// <summary>
/// Factory for resolving providers by type.
/// Uses keyed service resolution to get the appropriate provider implementation.
/// </summary>
public class ProviderFactory : IProviderFactory
{
    private readonly IServiceProvider _serviceProvider;

    public ProviderFactory(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    /// <inheritdoc />
    public IProvider GetProvider(ProviderType providerType)
    {
        // Use keyed services pattern - resolve by provider type key
        var provider = _serviceProvider.GetKeyedService<IProvider>(providerType);
        
        if (provider == null)
        {
            throw new InvalidOperationException($"No provider registered for type: {providerType}");
        }

        return provider;
    }

    /// <inheritdoc />
    public IProvider GetProvider(string? providerTypeString)
    {
        var providerType = providerTypeString.ParseProviderType();
        return GetProvider(providerType);
    }
}

// Extension method helper for keyed service resolution
public static class ServiceProviderExtensions
{
    public static T? GetKeyedService<T>(this IServiceProvider provider, object key) where T : class
    {
        // For .NET 8+, we use Microsoft.Extensions.DependencyInjection.Abstractions keyed services
        // For now, we'll use a dictionary-based approach through a provider registry
        var registry = provider.GetService(typeof(ProviderRegistry)) as ProviderRegistry;
        return registry?.GetProvider(key) as T;
    }
}

/// <summary>
/// Registry that holds provider instances by their type.
/// This is used for keyed service resolution.
/// </summary>
public class ProviderRegistry
{
    private readonly Dictionary<ProviderType, IProvider> _providers = new();

    public void Register(ProviderType type, IProvider provider)
    {
        _providers[type] = provider;
    }

    public IProvider? GetProvider(object key)
    {
        if (key is ProviderType providerType && _providers.TryGetValue(providerType, out var provider))
        {
            return provider;
        }
        return null;
    }
}
