using Microsoft.Azure.Functions.Worker.Http;
using System.Net;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.Json.Serialization;
using strava_recap_api.Entities;
using strava_recap_api.Providers;

namespace strava_recap_api.Extensions;

public static class HttpRequestDataExtensions
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    /// <summary>
    /// Creates an HTTP 200 OK response with JSON payload and no-store cache control.
    /// </summary>
    public static async Task<HttpResponseData> OkJson(this HttpRequestData req, object payload, Action<HttpResponseData>? configureResponse = null)
    {
        var res = req.CreateResponse(HttpStatusCode.OK);
        res.Headers.Add("Content-Type", "application/json; charset=utf-8");
        res.Headers.Add("Cache-Control", "no-store");
        configureResponse?.Invoke(res);
        await res.WriteStringAsync(JsonSerializer.Serialize(payload, JsonOptions));
        return res;
    }

    /// <summary>
    /// Generates an AuthenticationRequest from HTTP request cookies.
    /// Does not validate - validation is the responsibility of the caller.
    /// </summary>
    public static AuthenticationRequest GenerateAuthenticationRequest(this HttpRequestData req)
    {
        var accessToken = req.GetAccessTokenFromCookies();
        var expiresAt = req.GetTokenExpirationFromCookies();

        return new AuthenticationRequest
        {
            AccessToken = accessToken,
            ExpiresAt = expiresAt
        };
    }

    /// <summary>
    /// Generates a CSRF protection state token with optional returnTo parameter and provider type encoded.
    /// Format: {randomHex}|{urlEncodedReturnTo}|{providerType}
    /// </summary>
    public static string GenerateAuthState(this HttpRequestData req, string? returnTo = null, ProviderType providerType = ProviderType.Strava)
    {
        var random = Convert.ToHexString(RandomNumberGenerator.GetBytes(16));
        var encodedReturn = WebUtility.UrlEncode(returnTo ?? "/");
        var providerValue = providerType.ToCookieValue();
        return $"{random}|{encodedReturn}|{providerValue}";
    }

    /// <summary>
    /// Creates an HTTP 302 redirect response with Location header and secure HttpOnly cookie for the auth state.
    /// </summary>
    public static HttpResponseData GenerateResponseWithRedirect(this HttpRequestData req, string redirectUrl)
    {
        var res = req.CreateResponse(System.Net.HttpStatusCode.Redirect);
        res.Headers.Add("Location", redirectUrl);
        return res;
    }

    /// <summary>
    /// Adds the OAuth state cookie to the response for CSRF protection.
    /// </summary>
    public static void AddAuthStateCookie(this HttpResponseData response, string state)
    {
        response.Headers.Add("Set-Cookie", $"recap_oauth_state={WebUtility.UrlEncode(state)}; Path=/; HttpOnly; SameSite=Lax");
    }

    /// <summary>
    /// Extracts the authorization code from callback query parameters.
    /// </summary>
    public static string? GetCodeFromQuery(this HttpRequestData req)
    {
        var query = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
        return query["authCode"];
    }

    /// <summary>
    /// Extracts the state token from callback query parameters.
    /// </summary>
    public static string? GetStateFromQuery(this HttpRequestData req)
    {
        var query = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
        return query["state"];
    }

    /// <summary>
    /// Extracts the error parameter from callback query (if user denied consent).
    /// </summary>
    public static string? GetErrorFromQuery(this HttpRequestData req)
    {
        var query = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
        return query["error"];
    }

    /// <summary>
    /// Extracts and decodes the returnTo value from state token.
    /// Format: {randomHex}|{urlEncodedReturnTo}|{providerType}
    /// </summary>
    public static string ExtractReturnToFromState(this string state)
    {
        var parts = state.Split('|');
        if (parts.Length >= 2)
        {
            return WebUtility.UrlDecode(parts[1]) ?? "/";
        }
        return "/";
    }

    /// <summary>
    /// Extracts the provider type from state token.
    /// Format: {randomHex}|{urlEncodedReturnTo}|{providerType}
    /// </summary>
    public static ProviderType ExtractProviderTypeFromState(this string state)
    {
        var parts = state.Split('|');
        if (parts.Length >= 3)
        {
            return parts[2].ParseProviderType();
        }
        return ProviderType.Strava; // Default to Strava for backward compatibility
    }

    /// <summary>
    /// Adds authentication cookies to the response (access token, expiration, and provider type).
    /// </summary>
    public static void AddAuthCookies(this HttpResponseData response, string accessToken, long expiresAt, ProviderType providerType = ProviderType.Strava)
    {
        response.Headers.Add("Set-Cookie", $"recap_access_token={WebUtility.UrlEncode(accessToken)}; Path=/; HttpOnly; SameSite=Lax");
        response.Headers.Add("Set-Cookie", $"recap_expires_at={expiresAt}; Path=/; HttpOnly; SameSite=Lax");
        response.Headers.Add("Set-Cookie", $"recap_provider={providerType.ToCookieValue()}; Path=/; HttpOnly; SameSite=Lax");
    }

    /// <summary>
    /// Clears the OAuth state cookie.
    /// </summary>
    public static void ClearStateCookie(this HttpResponseData response)
    {
        response.Headers.Add("Set-Cookie", "recap_oauth_state=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");
    }

    /// <summary>
    /// Gets the OAuth state value from request cookies.
    /// </summary>
    public static string? GetStateFromCookies(this HttpRequestData req)
    {
        if (!req.Headers.TryGetValues("Cookie", out var cookieHeaders))
            return null;

        var cookies = string.Join("; ", cookieHeaders);
        foreach (var part in cookies.Split(';', StringSplitOptions.RemoveEmptyEntries))
        {
            var kv = part.Trim().Split('=', 2);
            if (kv.Length == 2 && kv[0] == "recap_oauth_state")
                return WebUtility.UrlDecode(kv[1]);
        }
        return null;
    }

    /// <summary>
    /// Gets the access token from request cookies.
    /// </summary>
    public static string? GetAccessTokenFromCookies(this HttpRequestData req)
    {
        return GetCookieValue(req, "recap_access_token");
    }

    /// <summary>
    /// Gets the token expiration time (Unix seconds) from request cookies.
    /// </summary>
    public static long? GetTokenExpirationFromCookies(this HttpRequestData req)
    {
        var value = GetCookieValue(req, "recap_expires_at");
        if (long.TryParse(value, out var seconds))
            return seconds;
        return null;
    }

    /// <summary>
    /// Gets the provider type from request cookies.
    /// </summary>
    public static ProviderType GetProviderTypeFromCookies(this HttpRequestData req)
    {
        var value = GetCookieValue(req, "recap_provider");
        return value.ParseProviderType();
    }

    /// <summary>
    /// Gets a cookie value by name from request headers.
    /// </summary>
    private static string? GetCookieValue(HttpRequestData req, string name)
    {
        if (!req.Headers.TryGetValues("Cookie", out var cookieHeaders))
            return null;

        var cookies = string.Join("; ", cookieHeaders);
        foreach (var part in cookies.Split(';', StringSplitOptions.RemoveEmptyEntries))
        {
            var kv = part.Trim().Split('=', 2);
            if (kv.Length == 2 && kv[0] == name)
                return WebUtility.UrlDecode(kv[1]);
        }
        return null;
    }
}
