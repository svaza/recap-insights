/**
 * ConnectProviderPrompt - Reusable component for prompting users to connect a provider
 * Used in RecapPage and FlyerPage when user is not authenticated
 */

import { StravaConnectButton } from './StravaConnectButton';
import { IntervalsIcuConnectButton } from './IntervalsIcuConnectButton';

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
    message = 'Connect a provider (read-only) to continue.',
    onConnectStrava,
    onConnectIntervalsIcu,
    backButton,
}: ConnectProviderPromptProps) {
    return (
        <div className="d-flex flex-column gap-3">
            <p className="text-secondary mb-0">{message}</p>
            <div className="d-flex gap-2 justify-content-center flex-wrap">
                <StravaConnectButton onClick={onConnectStrava} />
                <IntervalsIcuConnectButton onClick={onConnectIntervalsIcu} />
            </div>
            {backButton && (
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={backButton.onClick}
                >
                    {backButton.label}
                </button>
            )}
        </div>
    );
}
