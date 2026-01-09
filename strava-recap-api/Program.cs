using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using strava_recap_api.Options;
using strava_recap_api.Providers;
using strava_recap_api.Services;

var builder = FunctionsApplication.CreateBuilder(args);
builder.Services.AddHttpClient();

// Configure authentication options from appsettings
builder.Services.Configure<AuthenticationOptions>(builder.Configuration.GetSection(nameof(AuthenticationOptions)));

// Register Strava services
builder.Services.AddScoped<StravaAuthService>();
builder.Services.AddScoped<StravaTokenService>();
builder.Services.AddScoped<StravaActivityService>();
builder.Services.AddScoped<StravaAthleteProfileService>();

// Register Strava provider
builder.Services.AddScoped<StravaProvider>(sp => new StravaProvider(
    sp.GetRequiredService<StravaAuthService>(),
    sp.GetRequiredService<StravaTokenService>(),
    sp.GetRequiredService<StravaAthleteProfileService>(),
    sp.GetRequiredService<StravaActivityService>()
));

// Register provider registry and factory
builder.Services.AddScoped<ProviderRegistry>(sp =>
{
    var registry = new ProviderRegistry();
    registry.Register(ProviderType.Strava, sp.GetRequiredService<StravaProvider>());
    // Future: registry.Register(ProviderType.IntervalsIcu, sp.GetRequiredService<IntervalsIcuProvider>());
    return registry;
});

builder.Services.AddScoped<IProviderFactory, ProviderFactory>();

builder.ConfigureFunctionsWebApplication();

builder.Services
    .AddApplicationInsightsTelemetryWorkerService()
    .ConfigureFunctionsApplicationInsights();

builder.Build().Run();