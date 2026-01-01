using System.Collections.Specialized;

namespace strava_recap_api.Extensions;

public static class NameValueCollectionExtensions
{
    /// <summary>
    /// Gets the 'returnTo' query parameter value, defaulting to "/" if not present.
    /// </summary>
    public static string GetReturnTo(this NameValueCollection query)
    {
        return query["returnTo"] ?? "/";
    }
}
