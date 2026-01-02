import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface CallbackResultDto {
    success: boolean;
    message?: string;
    returnTo?: string;
    errorStatusCode?: number;
}

export default function ProviderCallbackPage() {
    const navigate = useNavigate();
    const hasRun = useRef(false);

    useEffect(() => {
        // Prevent running twice in Strict Mode development
        if (hasRun.current) return;
        hasRun.current = true;

        const run = async () => {
            const qs = new URLSearchParams(window.location.search);
            const code = qs.get("code");   // Provider sends this
            const state = qs.get("state");
            const error = qs.get("error");

            if (error) {
                navigate("/?strava=denied", { replace: true });
                return;
            }

            if (!code) {
                navigate("/?strava=missing_code", { replace: true });
                return;
            }

            try {
                const apiUrl =
                    `/api/provider/callback?authCode=${encodeURIComponent(code)}` +
                    (state ? `&state=${encodeURIComponent(state)}` : "");

                const res = await fetch(apiUrl, {
                    method: "GET",
                    credentials: "include"
                });

                if (!res.ok) {
                    console.error("API error. Status:", res.status);
                    navigate("/?strava=exchange_failed", { replace: true });
                    return;
                }
                const result: CallbackResultDto = await res.json();

                if (result.success) {
                    // Successfully connected - redirect to return URL or recap
                    const returnTo = result.returnTo || "/recap";
                    navigate(`${returnTo}`, { replace: true });
                } else {
                    // Callback failed - redirect with error
                    console.error("Callback failed:", result.message);

                    // Map error codes to query params
                    if (result.errorStatusCode === 401 || result.errorStatusCode === 403) {
                        navigate("/?strava=auth_failed", { replace: true });
                    } else if (result.errorStatusCode === 400) {
                        navigate("/?strava=invalid_state", { replace: true });
                    } else {
                        navigate("/?strava=exchange_failed", { replace: true });
                    }
                }
            } catch (e: any) {
                console.error("Exception during callback:", e);
                navigate("/?strava=exchange_error", { replace: true });
            }
        };

        run();
    }, [navigate]);

    return (
        <div style={{ padding: 24 }}>
            <h2>Strava</h2>
            <p>Finalizing connection…</p>
        </div>
    );
}
