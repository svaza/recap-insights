import { forwardRef } from "react";

export type FlyerTotals = {
    activities: number;
    distance: string;
    time: string;
    elevation: string;
};

export type FlyerHighlight = {
    title: string;
    emoji: string;
    value: string;
    subtitle: string;
};

type Props = {
    title: string;
    subtitle: string; // e.g. rangeLabel or date range
    totals: FlyerTotals;
    highlights: [FlyerHighlight, FlyerHighlight, FlyerHighlight];
    badges: Array<{ emoji: string; label: string; value: string }>;
    footerLeft?: string;
    footerRight?: string;
};

export default forwardRef<HTMLDivElement, Props>(function RecapFlyerPanel(props, ref) {
    return (
        <div
            ref={ref}
            style={{
                width: 1080,
                height: 1350,
                borderRadius: 36,
                overflow: "hidden",
                position: "relative",
                color: "#e9eef5",
                boxSizing: "border-box",
                border: "1px solid rgba(255,255,255,0.12)",

                // Background inspired by Strava/Garmin-style gradients
                background:
                    "radial-gradient(1200px 700px at 20% 10%, rgba(255,140,0,0.55), transparent 60%)," +
                    "radial-gradient(1100px 700px at 85% 0%, rgba(125,110,255,0.55), transparent 55%)," +
                    "linear-gradient(180deg, rgba(15,20,28,0.25), rgba(11,15,20,0.88) 55%, rgba(11,15,20,0.96))",
            }}
        >
            {/* subtle grain */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0.08,
                    background:
                        "repeating-linear-gradient(0deg, rgba(255,255,255,0.14) 0px, rgba(255,255,255,0.14) 1px, transparent 1px, transparent 4px)",
                    pointerEvents: "none",
                }}
            />

            {/* mountain silhouette */}
            <svg
                viewBox="0 0 1080 1350"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.25 }}
                aria-hidden="true"
            >
                <path
                    d="M0,900 C180,820 250,780 340,740 C430,700 520,720 610,690 C700,660 780,560 860,520 C940,480 1010,530 1080,500 L1080,1350 L0,1350 Z"
                    fill="rgba(0,0,0,0.75)"
                />
                <path
                    d="M0,980 C210,900 360,930 500,860 C640,790 710,650 820,610 C930,570 1000,630 1080,600 L1080,1350 L0,1350 Z"
                    fill="rgba(0,0,0,0.55)"
                />
            </svg>

            {/* runner accent */}
            <div
                style={{
                    position: "absolute",
                    left: 56,
                    top: 420,
                    fontSize: 96,
                    opacity: 0.18,
                    filter: "saturate(0.9)",
                    pointerEvents: "none",
                }}
            >
                🏃‍♂️
            </div>

            <div style={{ padding: 56, height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
                {/* Header */}
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 64, fontWeight: 950, letterSpacing: 1, textTransform: "uppercase" }}>
                        {props.title}
                    </div>
                    <div style={{ marginTop: 10, fontSize: 22, opacity: 0.85, fontWeight: 800 }}>
                        {props.subtitle}
                    </div>
                </div>

                {/* Totals strip */}
                <div
                    style={{
                        marginTop: 38,
                        borderRadius: 18,
                        padding: "18px 18px",
                        background: "rgba(0,0,0,0.28)",
                        border: "1px solid rgba(255,255,255,0.14)",
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: 14,
                    }}
                >
                    <TotalCell emoji="📅" value={String(props.totals.activities)} label="Activities" />
                    <TotalCell emoji="📏" value={props.totals.distance} label="Distance" />
                    <TotalCell emoji="⏱️" value={props.totals.time} label="Time" />
                    <TotalCell emoji="⛰️" value={props.totals.elevation} label="Elevation gain" />
                </div>

                {/* Highlights tiles */}
                <div style={{ marginTop: 34, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                    {props.highlights.map((h) => (
                        <div
                            key={h.title}
                            style={{
                                borderRadius: 22,
                                overflow: "hidden",
                                background: "rgba(0,0,0,0.30)",
                                border: "1px solid rgba(255,255,255,0.14)",
                                minHeight: 300,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                padding: 18,
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ fontSize: 15, fontWeight: 900, opacity: 0.9, textTransform: "uppercase", letterSpacing: 0.9 }}>
                                    {h.title}
                                </div>
                                <div style={{ fontSize: 26 }}>{h.emoji}</div>
                            </div>

                            <div style={{ marginTop: 18 }}>
                                <div style={{ fontSize: 44, fontWeight: 950, letterSpacing: -0.8 }}>
                                    {h.value}
                                </div>
                                <div style={{ marginTop: 10, fontSize: 16, opacity: 0.85, fontWeight: 800, lineHeight: 1.25 }}>
                                    {h.subtitle}
                                </div>
                            </div>

                            <div style={{ marginTop: 18, height: 10, borderRadius: 999, background: "rgba(255,255,255,0.10)" }}>
                                <div
                                    style={{
                                        width: "62%",
                                        height: "100%",
                                        borderRadius: 999,
                                        background: "rgba(42,127,255,0.75)",
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Badge row */}
                <div
                    style={{
                        marginTop: 30,
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)", // ✅ 4 per row
                        gap: 12,
                        alignContent: "start", // ✅ keeps rows packed at top
                    }}
                >
                    {props.badges.slice(0, 12).map((b) => ( // ✅ allow up to 12 -> wraps to 3 rows
                        <div
                            key={b.label}
                            style={{
                                borderRadius: 18,
                                padding: "14px 10px",
                                textAlign: "center",
                                background: "rgba(0,0,0,0.22)",
                                border: "1px solid rgba(255,255,255,0.12)",
                            }}
                        >
                            <div style={{ fontSize: 28 }}>{b.emoji}</div>
                            <div style={{ marginTop: 8, fontWeight: 950, fontSize: 18 }}>{b.value}</div>
                            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75, fontWeight: 900 }}>
                                {b.label}
                            </div>
                        </div>
                    ))}
                </div>


                {/* Footer */}
                <div style={{ marginTop: "auto", paddingTop: 26, display: "flex", justifyContent: "space-between", opacity: 0.7, fontWeight: 900 }}>
                    <div>{props.footerLeft ?? "Powered by Recap Insights"}</div>
                    <div>{props.footerRight ?? `Generated on ${new Date().toLocaleDateString()}`}</div>
                </div>
            </div>
        </div>
    );
});

function TotalCell(props: { emoji: string; value: string; label: string }) {
    return (
        <div style={{ display: "grid", gap: 6, justifyItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 20 }}>{props.emoji}</div>
                <div style={{ fontSize: 34, fontWeight: 950, letterSpacing: -0.6 }}>{props.value}</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 900, opacity: 0.8, textTransform: "uppercase", letterSpacing: 0.8 }}>
                {props.label}
            </div>
        </div>
    );
}
