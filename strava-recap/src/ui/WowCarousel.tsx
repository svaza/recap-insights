import { useState } from "react";
import type { WowItem } from "./WowItemCard";
import { WowItemRenderer } from "./WowItemRenderer";

export default function WowCarousel(props: { items: WowItem[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (props.items.length === 0) return null;

    const currentItem = props.items[currentIndex];
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === props.items.length - 1;

    const goToPrevious = () => {
        if (!isFirst) setCurrentIndex(currentIndex - 1);
    };

    const goToNext = () => {
        if (!isLast) setCurrentIndex(currentIndex + 1);
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 16 }}>
                <div style={{ opacity: 0.75, fontSize: 13, fontWeight: 600 }}>
                    {currentIndex + 1} / {props.items.length}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        onClick={goToPrevious}
                        disabled={isFirst}
                        style={{
                            border: "1px solid rgba(255,255,255,0.12)",
                            background: isFirst ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)",
                            color: isFirst ? "rgba(233,238,245,0.5)" : "#e9eef5",
                            borderRadius: 10,
                            padding: "8px 12px",
                            cursor: isFirst ? "not-allowed" : "pointer",
                            fontWeight: 800,
                            opacity: isFirst ? 0.5 : 1,
                        }}
                        aria-label="Previous"
                    >
                        ← Prev
                    </button>
                    <button
                        onClick={goToNext}
                        disabled={isLast}
                        style={{
                            border: "1px solid rgba(255,255,255,0.12)",
                            background: isLast ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)",
                            color: isLast ? "rgba(233,238,245,0.5)" : "#e9eef5",
                            borderRadius: 10,
                            padding: "8px 12px",
                            cursor: isLast ? "not-allowed" : "pointer",
                            fontWeight: 800,
                            opacity: isLast ? 0.5 : 1,
                        }}
                        aria-label="Next"
                    >
                        Next →
                    </button>
                </div>
            </div>

            <div
                style={{
                    marginTop: 0,
                    display: "flex",
                    justifyContent: "center",
                    minHeight: 180,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 14,
                    padding: 24,
                }}
            >
                <div key={currentItem.id} style={{ width: "100%", maxWidth: 'auto' }}>
                    <WowItemRenderer item={currentItem} />
                </div>
            </div>
        </div>
    );
}
