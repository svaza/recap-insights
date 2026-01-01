using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using strava_recap_api.Options;
using strava_recap_api.Services;

var builder = FunctionsApplication.CreateBuilder(args);
builder.Services.AddHttpClient();

// Configure authentication options from appsettings
builder.Services.Configure<AuthenticationOptions>(builder.Configuration.GetSection(nameof(AuthenticationOptions)));

// Register OAuth and token services with DI
builder.Services.AddScoped<IAuthService, StravaAuthService>();
builder.Services.AddScoped<ITokenService, StravaTokenService>();

// Register activity service with DI
builder.Services.AddScoped<IActivityService, StravaActivityService>();

builder.ConfigureFunctionsWebApplication();

builder.Services
    .AddApplicationInsightsTelemetryWorkerService()
    .ConfigureFunctionsApplicationInsights();

builder.Build().Run();