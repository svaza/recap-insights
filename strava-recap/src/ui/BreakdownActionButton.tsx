type BreakdownActionButtonProps = {
    dialogId: string;
    label: string;
    onClick: () => void;
};

export default function BreakdownActionButton(props: BreakdownActionButtonProps) {
    return (
        <button
            type="button"
            className="recap-stat__action-btn"
            onClick={props.onClick}
            aria-haspopup="dialog"
            aria-controls={props.dialogId}
            aria-label={props.label}
            title={props.label}
        >
            <svg
                className="recap-stat__action-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    d="M5 16.5V18M10 13V18M14 9.5V18M19 6V18M4 18H20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
            </svg>
            <span className="visually-hidden">{props.label}</span>
        </button>
    );
}
