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
        <div className="d-flex align-items-center gap-2">
            <span className="badge bg-dark border border-secondary d-flex align-items-center gap-1 px-2 py-1">
                <span
                    className={`rounded-circle status-dot ${connected ? "status-dot--connected" : "status-dot--disconnected"}`}
                ></span>
                <span className="small text-light">{provider}</span>
            </span>
            {connected && (
                <span 
                    className={`badge bg-warning text-dark d-flex align-items-center gap-1 px-2 py-1 disconnect-badge ${isDisconnecting ? "disconnect-badge--loading" : ""}`}
                    onClick={isDisconnecting ? undefined : handleDisconnect}
                    role="button"
                >
                    <span>{isDisconnecting ? "⏳" : "🔌"}</span>
                    <span className="small">{isDisconnecting ? "..." : "Disconnect"}</span>
                </span>
            )}
        </div>
    );
}
