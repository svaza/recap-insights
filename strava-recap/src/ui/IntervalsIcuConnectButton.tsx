import styles from "./IntervalsIcuConnectButton.module.css";

type IntervalsIcuConnectButtonProps = {
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    variant?: "accent" | "white";
    fullWidth?: boolean;
};

export function IntervalsIcuConnectButton({
    onClick,
    disabled = false,
    loading = false,
    variant = "accent",
    fullWidth = false,
}: IntervalsIcuConnectButtonProps) {
    const isDisabled = disabled || loading;

    const classNames = [
        styles.btnProvider,
        variant === "white" ? styles.btnIntervalsWhite : styles.btnIntervals,
        fullWidth ? styles.fullWidth : "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <button
            type="button"
            onClick={isDisabled ? undefined : onClick}
            disabled={isDisabled}
            aria-label="Connect with Intervals.icu"
            className={classNames}
        >
            <span className={styles.btnProviderIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                    <path
                        d="M2 12h4l2-6 4 12 2-6h6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </span>
            <span className={styles.btnProviderText}>
                {loading ? "Connecting…" : "Connect Intervals.icu"}
            </span>
        </button>
    );
}
