namespace strava_recap_api.Entities;

/// <summary>
/// Recap request with authentication and date range.
/// </summary>
public class RecapRequest
{
    public required AuthenticationRequest Authentication { get; set; }
    public DateTimeOffset StartUtc { get; set; }
    public DateTimeOffset EndUtc { get; set; }

    /// <summary>
    /// Computes the date range for the recap based on query parameters.
    /// Expected patterns: type=rolling&days=7 or unit=month or unit=year
    /// </summary>
    public static (DateTimeOffset startUtc, DateTimeOffset endUtc) ComputeDateRange(string? type, string? unit, string? days, string? offset)
    {
        var now = DateTimeOffset.UtcNow;

        // Handle rolling days
        if (string.Equals(type, "rolling", StringComparison.OrdinalIgnoreCase))
        {
            var dayCount = int.TryParse(days, out var d) ? d : 7;
            dayCount = Math.Clamp(dayCount, 1, 365);
            return (now.AddDays(-dayCount), now);
        }

        // Handle calendar units
        var unitValue = unit ?? "month";

        if (string.Equals(unitValue, "year", StringComparison.OrdinalIgnoreCase) && offset != null)
        {
            if (int.TryParse(offset, out var offsetInt))
            {
                var targetYear = now.Year + offsetInt;
                var startOfYear = new DateTimeOffset(new DateTime(targetYear, 1, 1, 0, 0, 0, DateTimeKind.Utc));
                var endOfYear = new DateTimeOffset(new DateTime(targetYear, 12, 31, 23, 59, 59, DateTimeKind.Utc));
                return (startOfYear, endOfYear);
            }
        }

        if (string.Equals(unitValue, "year", StringComparison.OrdinalIgnoreCase))
        {
            var startOfYear = new DateTimeOffset(new DateTime(now.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc));
            return (startOfYear, now);
        }

        // Default: current month
        var startOfMonth = new DateTimeOffset(new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc));
        return (startOfMonth, now);
    }
}
