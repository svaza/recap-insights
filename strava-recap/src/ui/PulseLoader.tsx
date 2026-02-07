import "./PulseLoader.css";

type PulseLoaderProps = {
    /** Label text shown beneath the pulse line */
    label?: string;
    /** Optional className for the wrapper */
    className?: string;
};

/**
 * PulseLoader — activity-trace style loading indicator.
 * Renders an animated SVG heartbeat/activity line with an optional label.
 */
export default function PulseLoader({
    label = "Loading…",
    className = "",
}: PulseLoaderProps) {
    return (
        <div className={`pulse-loader ${className}`} role="status" aria-live="polite">
            <svg
                className="pulse-loader__svg"
                viewBox="0 0 120 24"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
            >
                <path
                    d="M0 12h20l4-8 4 16 4-12 4 8 4-4h80"
                    stroke="var(--ath-sage)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            {label && (
                <span className="pulse-loader__label">{label}</span>
            )}
        </div>
    );
}
