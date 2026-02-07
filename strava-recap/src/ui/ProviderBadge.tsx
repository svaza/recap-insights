import { useDisconnectMutation } from "../store";
import type { ReactElement } from "react";

export type ProviderBadgeProps = {
    connected: boolean;
    provider: string;
};

const providerMeta: Record<string, { className: string; icon: ReactElement }> = {
    Strava: {
        className: "provider-badge--strava",
        icon: (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
            </svg>
        ),
    },
    "Intervals.icu": {
        className: "provider-badge--intervals",
        icon: (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 12h4l2-6 4 12 2-6h6" />
            </svg>
        ),
    },
};

export function ProviderBadge({ connected, provider }: ProviderBadgeProps) {
    const [disconnect, { isLoading: isDisconnecting }] = useDisconnectMutation();
    const meta = providerMeta[provider] ?? { className: "", icon: null };

    const handleDisconnect = async () => {
        await disconnect();
    };

    return (
        <div className="provider-badge-group">
            <span className={`provider-badge ${meta.className}`}>
                <span className="provider-badge__icon">{meta.icon}</span>
                <span className={`provider-badge__dot ${connected ? "provider-badge__dot--on" : "provider-badge__dot--off"}`} />
                <span className="provider-badge__text">{provider}</span>
            </span>
            {connected && (
                <button
                    type="button"
                    className={`provider-disconnect-btn${isDisconnecting ? " provider-disconnect-btn--loading" : ""}`}
                    onClick={isDisconnecting ? undefined : handleDisconnect}
                    disabled={isDisconnecting}
                    aria-label={isDisconnecting ? "Disconnecting…" : "Disconnect provider"}
                >
                    {isDisconnecting ? (
                        <svg className="provider-disconnect-btn__spinner" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                        </svg>
                    ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M18.36 6.64A9 9 0 1 1 5.64 6.64" />
                            <line x1="12" y1="2" x2="12" y2="12" />
                        </svg>
                    )}
                    <span>{isDisconnecting ? "Disconnecting…" : "Disconnect"}</span>
                </button>
            )}
        </div>
    );
}
