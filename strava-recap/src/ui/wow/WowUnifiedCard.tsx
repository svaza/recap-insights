import type { WowItem } from "../WowItemCard";
import { getActivityEmoji } from "../../utils/activityTypes";
import "./wowUnifiedCard.css";

function formatActivityTypeLabel(type: string): string {
    return type
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/\s+/g, " ")
        .trim();
}

export default function WowUnifiedCard({ item }: { item: WowItem }) {
    const activityTypeBadge = item.activityType
        ? `${getActivityEmoji(item.activityType)} ${formatActivityTypeLabel(item.activityType)}`
        : null;

    return (
        <div className="wow-u">
            {activityTypeBadge && (
                <div className="wow-u__activity-type" title={activityTypeBadge}>
                    {activityTypeBadge}
                </div>
            )}

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
