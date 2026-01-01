import { num } from "../../utils/format";
import type { WowItem } from "../WowItemCard";

export default function WowEarth(props: { item: WowItem }) {
    const title = props.item.title || "Around Earth";
    const value = props.item.value || "0%";
    const subtitle = props.item.subtitle || "";

    // Parse "12.3%" -> 12.3
    const pct = clamp(parseFloat(value.replace(/[^\d.]/g, "")) || 0, 0, 100);
    const tier = getEarthTier(pct);

    const line1 =
        pct >= 100
            ? "That’s a full lap around the planet."
            : pct >= 50
                ? "That’s a big slice of Earth. Serious distance."
                : pct >= 10
                    ? "Real ground covered. This is building endurance."
                    : "Every bit counts. Keep stacking days.";

    const line2 =
        pct >= 100
            ? "You’ve got the engine — protect recovery and repeat."
            : pct >= 50
                ? "This is the kind of volume that compounds fast."
                : pct >= 10
                    ? "Consistency is the multiplier here."
                    : "Aim for the next small milestone — it adds up.";

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
                    "radial-gradient(900px 260px at 50% 0%, rgba(0,190,255,0.16), transparent 55%), rgba(255,255,255,0.03)",
                boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
                overflow: "hidden",
            }}
        >
            {/* animated ocean glow layer */}
            <div
                aria-hidden
                style={{
                    position: "absolute",
                    inset: -60,
                    background:
                        "conic-gradient(from 180deg at 50% 50%, rgba(0,190,255,0.12), rgba(255,255,255,0.05), rgba(0,255,170,0.10))",
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
                        width: "clamp(56px, 18vw, 64px)",
                        height: "clamp(56px, 18vw, 64px)",
                        borderRadius: 18,
                        display: "grid",
                        placeItems: "center",
                        fontSize: "clamp(30px, 8vw, 34px)",
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
                        transform: "translateY(2px)",
                        animation: "recapPop 700ms ease-out",
                    }}
                    title={title}
                >
                    {props.item.emoji}
                </div>

                {/* title */}
                <div style={{ fontSize: "clamp(11px, 2.6vw, 12px)", fontWeight: 900, letterSpacing: 1.2, opacity: 0.75 }}>
                    {String(title).toUpperCase()}
                </div>

                {/* tier badge */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <div
                        style={{
                            padding: "6px 10px",
                            borderRadius: 999,
                            fontSize: "clamp(11px, 2.6vw, 12px)",
                            fontWeight: 900,
                            letterSpacing: 0.6,
                            border: "1px solid rgba(255,255,255,0.12)",
                            background: tier.bg,
                            color: tier.fg,
                            boxShadow: "0 8px 18px rgba(0,0,0,0.25)",
                            whiteSpace: "nowrap",
                            opacity: 0.95,
                        }}
                    >
                        {tier.label}
                    </div>
                </div>

                {/* ring + hero */}
                <div style={{ display: "grid", placeItems: "center", marginTop: 2 }}>
                    <ProgressRing percent={pct} />

                    <div style={{ marginTop: -6 }}>
                        <div
                            style={{
                                fontSize: "clamp(30px, 7.5vw, 34px)",
                                fontWeight: 950,
                                letterSpacing: -0.8,
                                lineHeight: 1.05,
                                background: "linear-gradient(90deg, rgba(0,190,255,0.95), rgba(255,255,255,0.92))",
                                WebkitBackgroundClip: "text",
                                backgroundClip: "text",
                                color: "transparent",
                                textShadow: "0 0 18px rgba(0,190,255,0.18)",
                            }}
                        >
                            {num(pct, 1)}%
                        </div>
                        <div style={{ marginTop: 4, fontSize: "clamp(12px, 3vw, 13px)", fontWeight: 850, opacity: 0.75 }}>
                            of Earth’s circumference
                        </div>
                    </div>
                </div>

                {/* subtitle pill (optional) */}
                {subtitle && (
                    <div style={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
                        <div
                            style={{
                                maxWidth: 260,
                                padding: "8px 10px",
                                borderRadius: 999,
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,255,255,0.10)",
                                fontSize: "clamp(11px, 2.8vw, 12px)",
                                opacity: 0.9,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                fontWeight: 800,
                            }}
                            title={subtitle}
                        >
                            {subtitle}
                        </div>
                    </div>
                )}

                {/* microcopy */}
                <div style={{ fontSize: "clamp(14px, 3.2vw, 15px)", fontWeight: 750, lineHeight: 1.35, opacity: 0.95 }}>
                    {line1}
                    <div style={{ marginTop: 6, opacity: 0.85 }}>{line2}</div>
                </div>

                {/* chips */}
                <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
                    <Chip text="🌍 distance" />
                    <Chip text={pct >= 50 ? "🧭 explorer" : "🌱 building"} />
                    <Chip text="✅ done" />
                </div>

                {/* tiny footer hint */}
                <div style={{ fontSize: "clamp(11px, 2.6vw, 12px)", opacity: 0.65 }}>
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

function Chip(props: { text: string }) {
    return (
        <div
            style={{
                padding: "6px 10px",
                borderRadius: 999,
                fontSize: "clamp(11px, 2.8vw, 12px)",
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

function ProgressRing(props: { percent: number }) {
    const size = 120;
    const stroke = 10;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;

    const pct = clamp(props.percent, 0, 100);
    const offset = c - (pct / 100) * c;

    // responsive size (so mobile doesn’t feel cramped)
    const cssSize = "clamp(96px, 26vw, 120px)";

    return (
        <svg width={cssSize} height={cssSize} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="transparent"
                stroke="rgba(255,255,255,0.10)"
                strokeWidth={stroke}
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="transparent"
                stroke="rgba(0,190,255,0.95)"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${c} ${c}`}
                strokeDashoffset={offset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{ filter: "drop-shadow(0 0 10px rgba(0,190,255,0.22))" }}
            />
            {/* orbit dot */}
            <circle cx={size / 2} cy={stroke / 2} r={3} fill="rgba(255,255,255,0.35)" />
        </svg>
    );
}

function getEarthTier(pct: number) {
    if (pct >= 100)
        return {
            label: "ORBIT MODE",
            message: "You literally went all the way around.",
            bg: "rgba(255,255,255,0.10)",
            fg: "#e9eef5",
        };
    if (pct >= 50)
        return {
            label: "VOYAGER",
            message: "That’s serious distance. Keep exploring.",
            bg: "rgba(0,190,255,0.18)",
            fg: "#e9eef5",
        };
    if (pct >= 10)
        return {
            label: "EXPLORER",
            message: "You covered real ground. More adventures next.",
            bg: "rgba(255,255,255,0.08)",
            fg: "#e9eef5",
        };
    return {
        label: "STARTING OUT",
        message: "Every mile/kilometer counts. Build the orbit.",
        bg: "rgba(255,255,255,0.06)",
        fg: "#e9eef5",
    };
}

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}
