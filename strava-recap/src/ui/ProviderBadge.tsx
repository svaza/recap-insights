import { useDisconnectMutation } from "../store";

export type ProviderBadgeProps = {
    connected: boolean;
    provider: string;
};

export function ProviderBadge({ connected, provider }: ProviderBadgeProps) {
    const [disconnect, { isLoading: isDisconnecting }] = useDisconnectMutation();

    const handleDisconnect = async () => {
        await disconnect();
    };

    return (
        <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="badge provider-badge d-flex align-items-center gap-1 px-2 py-1">
                <span
                    className={`rounded-circle status-dot ${connected ? "status-dot--connected" : "status-dot--disconnected"}`}
                ></span>
                <span className="small provider-badge__text">{provider}</span>
            </span>
            {connected && (
                <button
                    type="button"
                    className={`btn btn-sm d-inline-flex align-items-center gap-1 provider-disconnect-btn ${isDisconnecting ? "disconnect-badge--loading" : ""}`}
                    onClick={isDisconnecting ? undefined : handleDisconnect}
                    disabled={isDisconnecting}
                >
                    <span>{isDisconnecting ? "⏳" : "🔌"}</span>
                    <span className="small">{isDisconnecting ? "Disconnecting" : "Disconnect"}</span>
                </button>
            )}
        </div>
    );
}
