import { forwardRef } from "react";
import type { WowItem } from "./WowItemCard";
import { WowItemRenderer } from "./WowItemRenderer";

const WowGrid = forwardRef<HTMLDivElement, { items: WowItem[] }>(function WowGrid(props, ref) {
    if (props.items.length === 0) return null;

    return (
        <div
            ref={ref}
            className="wow-grid"
            style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "stretch",
                gap: 16,
            }}
        >
            {props.items.map((item) => (
                <div key={item.id} className="wow-grid-item">
                    <WowItemRenderer item={item} />
                </div>
            ))}
            <style>
                {`
          .wow-grid-item {
            flex: 1 1 260px;
            max-width: 360px;
            display: flex;
          }

          .wow-grid-item > * {
            flex: 1;
          }

          @media (max-width: 575.98px) {
            .wow-grid-item {
              flex-basis: 100%;
              max-width: 100%;
            }
          }
        `}
            </style>
        </div>
    );
});

export default WowGrid;
