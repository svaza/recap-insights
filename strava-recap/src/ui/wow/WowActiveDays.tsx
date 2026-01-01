import type { WowItem } from "../WowItemCard";

export default function WowActiveDays(props: { item: WowItem }) {
    // value like "173/365", subtitle like "47% consistency"
    const [activeRaw, totalRaw] = (props.item.value || "0/1").split("/");
    const activeDays = Number(activeRaw || 0);
    const totalDays = Math.max(1, Number(totalRaw || 1));

    const percentageMatch = (props.item.subtitle ?? "").match(/(\d+)%/);
    const percentage = Math.min(100, Math.max(0, Number(percentageMatch ? percentageMatch[1] : 0)));

    const tier = getTier(percentage);

    const line1 =
        percentage >= 75
            ? "You showed up again and again."
            : percentage >= 50
                ? "You’re building a real habit."
                : "Momentum starts with one more day.";

    const line2 =
        percentage >= 75
            ? "Keep this rhythm — it compounds fast."
            : percentage >= 50
                ? "Add one extra day/week and you’ll feel it."
                : "Aim for consistency, not perfection.";

    return (
        <div
            style={{
                position: "relative",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                padding: "18px 14px",
                borderRadius: 18,
                border: "1px solid rgba(255,255,255,0.10)",
                background:
                    "radial-gradient(900px 260px at 50% 0%, rgba(42,127,255,0.20), transparent 55%), rgba(255,255,255,0.03)",
                boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
                overflow: "hidden",
            }}
        >
            {/* animated glow layer (same style language as Biggest Effort) */}
            <div
                aria-hidden
                style={{
                    position: "absolute",
                    inset: -60,
                    background:
                        "conic-gradient(from 180deg at 50% 50%, rgba(42,127,255,0.10), rgba(255,255,255,0.06), rgba(42,127,255,0.10))",
                    opacity: 0.32,
                    filter: "blur(22px)",
                    animation: "recapSpin 12s linear infinite",
                    pointerEvents: "none",
                }}
            />

            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 14 }}>
                {/* emoji badge */}
                <div
                    style={{
                        margin: "0 auto",
                        width: 64,
                        height: 64,
                        borderRadius: 18,
                        display: "grid",
                        placeItems: "center",
                        fontSize: 34,
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
                        transform: "translateY(2px)",
                        animation: "recapPop 700ms ease-out",
                    }}
                    title={props.item.title}
                >
                    {props.item.emoji}
                </div>

                {/* title */}
                <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 1.2, opacity: 0.75 }}>
                    ACTIVE DAYS
                </div>

                {/* tier badge */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <div
                        style={{
                            padding: "6px 10px",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 900,
                            letterSpacing: 0.4,
                            border: "1px solid rgba(255,255,255,0.12)",
                            background: tier.bg,
                            color: tier.fg,
                            boxShadow: "0 8px 18px rgba(0,0,0,0.25)",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {tier.label} {tier.emoji}
                    </div>
                </div>

                {/* ring + hero number */}
                <div style={{ marginTop: 4, display: "grid", placeItems: "center", gap: 10 }}>
                    <ProgressRing percent={percentage} />

                    <div>
                        <div
                            style={{
                                fontSize: 34,
                                fontWeight: 950,
                                letterSpacing: -0.8,
                                lineHeight: 1.05,
                                background: "linear-gradient(90deg, rgba(42,127,255,0.95), rgba(255,255,255,0.92))",
                                WebkitBackgroundClip: "text",
                                backgroundClip: "text",
                                color: "transparent",
                                textShadow: "0 0 18px rgba(42,127,255,0.18)",
                            }}
                        >
                            {percentage}%
                        </div>
                        <div style={{ marginTop: 4, fontSize: 13, fontWeight: 850, opacity: 0.75 }}>
                            consistency
                        </div>
                    </div>
                </div>

                {/* microcopy */}
                <div style={{ fontSize: 15, fontWeight: 750, lineHeight: 1.35, opacity: 0.95 }}>
                    {line1}
                    <div style={{ marginTop: 6, opacity: 0.85 }}>{line2}</div>
                </div>

                {/* active/total line */}
                <div style={{ fontSize: 16, fontWeight: 850, lineHeight: 1.35 }}>
                    Active on{" "}
                    <span style={{ color: "rgba(42,127,255,0.95)" }}>{activeDays}</span>{" "}
                    of{" "}
                    <span style={{ opacity: 0.9 }}>{totalDays}</span>{" "}
                    days
                </div>

                {/* chips */}
                <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
                    <Chip text="📆 consistency" />
                    <Chip text={percentage >= 65 ? "🔥 strong habit" : "🌱 building habit"} />
                    <Chip text="✅ showed up" />
                </div>

                {/* tiny footer hint */}
                <div style={{ fontSize: 12, opacity: 0.65 }}>
                    {tier.message}
                </div>
            </div>

            {/* local keyframes */}
            <style>
                {`
          @keyframes recapSpin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          @keyframes recapPop {
            0%   { transform: scale(0.9) translateY(6px); opacity: 0.2; }
            60%  { transform: scale(1.04) translateY(0px); opacity: 1; }
            100% { transform: scale(1) translateY(2px); opacity: 1; }
          }
        `}
            </style>
        </div>
    );
}

/** Lightweight SVG ring (no deps), responsive size via CSS */
function ProgressRing(props: { percent: number }) {
    const size = 120;
    const stroke = 10;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;

    const pct = Math.min(100, Math.max(0, props.percent));
    const offset = c - (pct / 100) * c;

    const cssSize = "clamp(96px, 26vw, 120px)";

    return (
        <svg
            width={cssSize}
            height={cssSize}
            viewBox={`0 0 ${size} ${size}`}
            style={{ display: "block" }}
        >
            {/* track */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="transparent"
                stroke="rgba(255,255,255,0.10)"
                strokeWidth={stroke}
            />
            {/* progress */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="transparent"
                stroke="rgba(42,127,255,0.95)"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${c} ${c}`}
                strokeDashoffset={offset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{ filter: "drop-shadow(0 0 10px rgba(42,127,255,0.20))" }}
            />
            {/* center dot */}
            <circle cx={size / 2} cy={size / 2} r={2} fill="rgba(255,255,255,0.35)" />
        </svg>
    );
}

function Chip(props: { text: string }) {
    return (
        <div
            style={{
                padding: "6px 10px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 850,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
                opacity: 0.9,
            }}
        >
            {props.text}
        </div>
    );
}

function getTier(pct: number) {
    if (pct >= 85)
        return {
            label: "ELITE",
            emoji: "🏆",
            message: "You basically live in motion.",
            bg: "rgba(255,255,255,0.10)",
            fg: "#e9eef5",
        };
    if (pct >= 65)
        return {
            label: "STRONG",
            emoji: "🔥",
            message: "Real consistency. Keep stacking.",
            bg: "rgba(42,127,255,0.18)",
            fg: "#e9eef5",
        };
    if (pct >= 45)
        return {
            label: "SOLID",
            emoji: "✅",
            message: "Good base. One extra day a week = huge.",
            bg: "rgba(255,255,255,0.08)",
            fg: "#e9eef5",
        };
    return {
        label: "BUILDING",
        emoji: "🌱",
        message: "Momentum starts here. Small wins count.",
        bg: "rgba(255,255,255,0.06)",
        fg: "#e9eef5",
    };
}
