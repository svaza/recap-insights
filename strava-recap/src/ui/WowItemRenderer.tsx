import type { WowItem } from "./WowItemCard";
import WowUnifiedCard from "./wow/WowUnifiedCard";
import { enrichWowItem } from "./wow/wowCopy";
import "./wow/wowTheme.css";

export function WowItemRenderer(props: { item: WowItem }) {
    const enriched = enrichWowItem(props.item);

    return (
        <div className={`wow-card-surface wow-card-surface--${props.item.id}`}>
            <WowUnifiedCard item={enriched} />
        </div>
    );
}

export default WowItemRenderer;
