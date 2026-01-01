import React from "react";
import type { WowItem } from "../ui/WowItemCard";

export default function RecapPoster(props: {
    title: string;
    rangeLabel: string;
    unitsLabel: string; // "km" or "mi" (for a tiny badge)
    totals: { activities: number; distance: string; time: string; elevation: string };
    breakdownRows: Array<{ emoji: string; type: string; line: string }>;
    wowItems: WowItem[]; // already filtered, e.g. top 4–6
    renderWow: (item: WowItem) => React.ReactNode;
}) {
    return (
        <div
            id="recap-poster"
            style={{
                width: 1080,
                height: 1350,
                borderRadius: 32,
                overflow: "hidden",
                position: "relative",
                boxSizing: "border-box",
                padding: 42,
                color: "#e9eef5",
                background:
                    "radial-gradient(1200px 600px at 30% 0%, rgba(42,127,255,0.28), transparent 55%), #0b0f14",
                border: "1px solid rgba(255,255,255,0.10)",
            }}
        >
            {/* header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 16 }}>
                <div>
                    <div style={{ fontSize: 44, fontWeight: 950, letterSpacing: -1.2, lineHeight: 1.05 }}>
                        {props.title}
                    </div>
                    <div style={{ marginTop: 10, fontSize: 18, opacity: 0.8 }}>{props.rangeLabel}</div>
                </div>

                <div
                    style={{
                        padding: "10px 14px",
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        fontSize: 13,
                        fontWeight: 900,
                        opacity: 0.9,
                        whiteSpace: "nowrap",
                    }}
                >
                    units: {props.unitsLabel}
                </div>
            </div>

            {/* totals */}
            <div style={{ marginTop: 34 }}>
                <div style={{ fontSize: 16, fontWeight: 900, opacity: 0.8, letterSpacing: 0.8 }}>
                    TOTALS
                </div>

                <div
                    style={{
                        marginTop: 14,
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: 14,
                    }}
                >
                    <PosterStat label="🎯 Activities" value={`${props.totals.activities}`} />
                    <PosterStat label="📏 Distance" value={props.totals.distance} />
                    <PosterStat label="⏱️ Time" value={props.totals.time} />
                    <PosterStat label="⛰️ Elevation" value={props.totals.elevation} />
                </div>
            </div>

            {/* breakdown */}
            <div style={{ marginTop: 34 }}>
                <div style={{ fontSize: 16, fontWeight: 900, opacity: 0.8, letterSpacing: 0.8 }}>
                    TOP ACTIVITY TYPES
                </div>

                <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                    {props.breakdownRows.slice(0, 4).map((r) => (
                        <div
                            key={r.type}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 12,
                                padding: "14px 14px",
                                borderRadius: 18,
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.08)",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ fontSize: 18 }}>{r.emoji}</div>
                                <div style={{ fontWeight: 900 }}>{r.type}</div>
                            </div>
                            <div style={{ opacity: 0.9, fontWeight: 800 }}>{r.line}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* wow grid */}
            <div style={{ marginTop: 34 }}>
                <div style={{ fontSize: 16, fontWeight: 900, opacity: 0.8, letterSpacing: 0.8 }}>
                    WOW HIGHLIGHTS
                </div>

                <div
                    style={{
                        marginTop: 14,
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: 14,
                    }}
                >
                    {props.wowItems.slice(0, 4).map((it) => (
                        <div
                            key={it.id}
                            style={{
                                borderRadius: 18,
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                padding: 14,
                                minHeight: 240,
                                display: "grid",
                                placeItems: "center",
                            }}
                        >
                            {props.renderWow(it)}
                        </div>
                    ))}
                </div>
            </div>

            {/* footer */}
            <div
                style={{
                    position: "absolute",
                    left: 42,
                    right: 42,
                    bottom: 34,
                    display: "flex",
                    justifyContent: "space-between",
                    opacity: 0.7,
                    fontSize: 13,
                    fontWeight: 800,
                }}
            >
                <div>Generated by Recap</div>
                <div>Data source: Strava</div>
            </div>
        </div>
    );
}

function PosterStat(props: { label: string; value: string }) {
    return (
        <div
            style={{
                padding: 16,
                borderRadius: 18,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
            }}
        >
            <div style={{ fontSize: 13, fontWeight: 900, opacity: 0.8 }}>{props.label}</div>
            <div style={{ marginTop: 10, fontSize: 26, fontWeight: 950, letterSpacing: -0.6 }}>
                {props.value}
            </div>
        </div>
    );
}
