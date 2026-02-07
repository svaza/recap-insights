/**
 * ConnectProviderPrompt - Reusable component for prompting users to connect a provider
 * Used in RecapPage and FlyerPage when user is not authenticated
 */

import "./ConnectProviderPrompt.css";

type ConnectProviderPromptProps = {
    /** Message to display above the connect buttons */
    message?: string;
    /** Callback when Strava connect is clicked */
    onConnectStrava: () => void;
    /** Callback when Intervals.icu connect is clicked */
    onConnectIntervalsIcu: () => void;
    /** Optional back button configuration */
    backButton?: {
        label: string;
        onClick: () => void;
    };
};

export default function ConnectProviderPrompt({
    message = "Connect a provider to continue.",
    onConnectStrava,
    onConnectIntervalsIcu,
    backButton,
}: ConnectProviderPromptProps) {
    return (
        <div className="connect-prompt">
            <div className="connect-prompt__header">
                <div className="connect-prompt__icon" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" y1="12" x2="3" y2="12" />
                    </svg>
                </div>
                <p className="connect-prompt__message">{message}</p>
            </div>

            <div className="connect-prompt__grid">
                {/* Strava card */}
                <button
                    type="button"
                    className="connect-card connect-card--strava"
                    onClick={onConnectStrava}
                    aria-label="Connect with Strava"
                >
                    <div className="connect-card__badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                        </svg>
                    </div>
                    <span className="connect-card__name">Strava</span>
                    <span className="connect-card__arrow" aria-hidden="true">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </span>
                </button>

                {/* Intervals.icu card */}
                <button
                    type="button"
                    className="connect-card connect-card--intervals"
                    onClick={onConnectIntervalsIcu}
                    aria-label="Connect with Intervals.icu"
                >
                    <div className="connect-card__badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M2 12h4l2-6 4 12 2-6h6" />
                        </svg>
                    </div>
                    <span className="connect-card__name">Intervals.icu</span>
                    <span className="connect-card__arrow" aria-hidden="true">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </span>
                </button>
            </div>

            <p className="connect-prompt__tip">
                <svg className="connect-prompt__tip-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                Have an <span className="provider-name provider-name--intervals">Intervals.icu</span> account?
                Connect it to avoid <span className="provider-name provider-name--strava">Strava</span> rate limits.
            </p>

            {backButton && (
                <button
                    type="button"
                    className="connect-prompt__back"
                    onClick={backButton.onClick}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    {backButton.label}
                </button>
            )}
        </div>
    );
}
