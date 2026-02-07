export type TotalsBreakdownItem = {
    id: string;
    emoji: string;
    label: string;
    valueLabel: string;
    widthPct: number;
    pctLabel: string;
};

type TotalsBreakdownModalProps = {
    open: boolean;
    dialogId: string;
    sectionLabel: string;
    title: string;
    description: string;
    items: TotalsBreakdownItem[];
    emptyMessage: string;
    onClose: () => void;
};

export default function TotalsBreakdownModal(props: TotalsBreakdownModalProps) {
    if (!props.open) return null;

    const titleId = `${props.dialogId}-title`;
    const descriptionId = `${props.dialogId}-description`;

    return (
        <div
            className="recap-modal-backdrop"
            role="presentation"
            onClick={props.onClose}
        >
            <div
                id={props.dialogId}
                className="recap-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
                onClick={(event) => event.stopPropagation()}
            >
                {/* Header */}
                <div className="recap-modal__header">
                    <div className="recap-modal__title-wrap">
                        <div className="recap-modal__section-label">{props.sectionLabel}</div>
                        <h2 id={titleId} className="recap-modal__title">{props.title}</h2>
                        <p id={descriptionId} className="recap-modal__description">{props.description}</p>
                    </div>
                    <button
                        type="button"
                        className="recap-modal__close"
                        onClick={props.onClose}
                        aria-label="Close"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Items */}
                {props.items.length > 0 ? (
                    <div className="recap-totals-breakdown-list">
                        {props.items.map((item, index) => (
                            <div key={item.id} className="recap-totals-breakdown-item">
                                <div className="recap-totals-breakdown-item__head">
                                    <div className="recap-totals-breakdown-item__type">
                                        <span className="recap-totals-breakdown-item__rank">
                                            {index + 1}
                                        </span>
                                        <span
                                            className="recap-totals-breakdown-item__emoji"
                                            aria-hidden="true"
                                        >
                                            {item.emoji}
                                        </span>
                                        <span className="recap-totals-breakdown-item__label text-truncate">{item.label}</span>
                                    </div>
                                    <div className="recap-totals-breakdown-item__value">
                                        {item.valueLabel}
                                    </div>
                                </div>
                                <div className="recap-totals-breakdown-item__bar">
                                    <div className="recap-totals-breakdown-item__track" aria-hidden="true">
                                        <div
                                            className="recap-totals-breakdown-item__fill"
                                            style={{ width: `${item.widthPct}%` }}
                                        />
                                    </div>
                                    <span className="recap-totals-breakdown-item__pct">
                                        {item.pctLabel}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="recap-totals-breakdown-empty">
                        {props.emptyMessage}
                    </div>
                )}
            </div>
        </div>
    );
}
