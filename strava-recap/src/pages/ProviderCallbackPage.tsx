import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../ui/PageShell";
import PulseLoader from "../ui/PulseLoader";
import "./ProviderCallbackPage.css";

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
            } catch (e: unknown) {
                console.error("Exception during callback:", e);
                navigate("/?strava=exchange_error", { replace: true });
            }
        };

        run();
    }, [navigate]);

    return (
        <PageShell title="Connecting">
            <div className="callback-page">
                <div className="callback-page__card">
                    <div className="callback-page__icon" aria-hidden="true">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                            <polyline points="10 17 15 12 10 7" />
                            <line x1="15" y1="12" x2="3" y2="12" />
                        </svg>
                    </div>
                    <h2 className="callback-page__title">Finalizing connection</h2>
                    <p className="callback-page__subtitle">
                        Exchanging authorization with your provider…
                    </p>
                    <PulseLoader label="Connecting to provider…" />
                </div>
            </div>
        </PageShell>
    );
}
