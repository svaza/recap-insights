type StravaConnectButtonProps = {
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    variant?: "orange" | "white";
    fullWidth?: boolean;
};

export function StravaConnectButton({
    onClick,
    disabled = false,
    loading = false,
    variant = "orange",
    fullWidth = false,
}: StravaConnectButtonProps) {
    const isDisabled = disabled || loading;

    const src =
        variant === "white"
            ? "/strava/connect-white-1x.png"
            : "/btn_strava_connect_with_orange.png";

    return (
        <button
            type="button"
            onClick={isDisabled ? undefined : onClick}
            disabled={isDisabled}
            aria-label="Connect with Strava"
            style={{
                width: fullWidth ? "100%" : "auto",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                border: "none",
                background: "transparent",
                cursor: isDisabled ? "not-allowed" : "pointer",
                opacity: isDisabled ? 0.7 : 1,
                borderRadius: 10, // for focus ring shape only (doesn't alter image)
                outline: "none",
            }}
            onFocus={(e) => {
                // subtle focus ring without touching the image itself
                (e.currentTarget.style.boxShadow = "0 0 0 3px rgba(42,127,255,0.35)");
            }}
            onBlur={(e) => {
                e.currentTarget.style.boxShadow = "none";
            }}
        >
            <img
                src={src}
                alt="Connect with Strava"
                style={{
                    height: 48,        // standard connect button height
                    width: "auto",
                    maxWidth: "100%",
                    display: "block",
                    pointerEvents: "none", // keeps clicks on the button
                    userSelect: "none",
                }}
                draggable={false}
            />
        </button>
    );
}
