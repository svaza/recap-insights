import { forwardRef } from "react";
import type { WowItem } from "./WowItemCard";
import { WowItemRenderer } from "./WowItemRenderer";

const WowGrid = forwardRef<HTMLDivElement, { items: WowItem[] }>(function WowGrid(props, ref) {
    if (props.items.length === 0) return null;

    return (
        <div ref={ref} className="wow-grid">
            {props.items.map((item) => (
                <div key={item.id} className="wow-grid-item">
                    <WowItemRenderer item={item} />
                </div>
            ))}
        </div>
    );
});

export default WowGrid;
