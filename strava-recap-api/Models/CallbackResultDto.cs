namespace strava_recap_api.Models;

/// <summary>
/// Callback result DTO returned to the client.
/// Contains callback status information without token details.
/// </summary>
public class CallbackResultDto
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public string? ReturnTo { get; set; }
    public int? ErrorStatusCode { get; set; }
}
