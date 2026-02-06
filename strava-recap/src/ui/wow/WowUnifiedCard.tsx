import type { WowItem } from "../WowItemCard";
import "./wowUnifiedCard.css";

export default function WowUnifiedCard({ item }: { item: WowItem }) {
    return (
        <div className="wow-u">
            <div className="wow-u__emoji" title={item.title}>
                {item.emoji}
            </div>

            <div className="wow-u__title">
                {item.title}
            </div>

            <div className="wow-u__value">
                {item.value || "\u2014"}
            </div>

            {item.secondaryValue && (
                <div className="wow-u__secondary">{item.secondaryValue}</div>
            )}

            {item.subtitle && (
                <div className="wow-u__subtitle" title={item.subtitle}>
                    {item.subtitle}
                </div>
            )}

            {(item.line1 || item.line2) && (
                <div className="wow-u__quote">
                    {item.line1}
                    {item.line2 && (
                        <div className="wow-u__quote-line2">{item.line2}</div>
                    )}
                </div>
            )}

            {item.chips && item.chips.length > 0 && (
                <div className="wow-u__chips">
                    {item.chips.map((text) => (
                        <span key={text} className="wow-u__chip">{text}</span>
                    ))}
                </div>
            )}

            {item.footer && (
                <div className="wow-u__footer">{item.footer}</div>
            )}
        </div>
    );
}
