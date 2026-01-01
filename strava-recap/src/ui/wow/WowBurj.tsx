import type { WowItem } from "../WowItemCard";

export default function WowBurj(props: { item: WowItem }) {
    const value = props.item.value || "—";
    const subtitle = props.item.subtitle ?? "828m tall";

    const tier = getTier(value);

    const line1 =
        tier.key === "giant"
            ? "That’s a serious vertical stack."
            : tier.key === "solid"
                ? "Nice climbing — that adds up fast."
                : "Good start. More hills = more gains.";

    const line2 =
        tier.key === "giant"
            ? "Recovery matters here — big elevation is real load."
            : tier.key === "solid"
                ? "Keep it steady and your legs will level up."
                : "Small climbs repeated = big progress.";

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
            {/* animated glow layer */}
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

            {/* content */}
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
                    title={props.item.title}
                >
                    {props.item.emoji}
                </div>

                {/* title */}
                <div style={{ fontSize: "clamp(11px, 2.6vw, 12px)", fontWeight: 900, letterSpacing: 1.2, opacity: 0.75 }}>
                    {String(props.item.title || "BURJ KHALIFA").toUpperCase()}
                </div>

                {/* tier badge */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <div
                        style={{
                            padding: "6px 10px",
                            borderRadius: 999,
                            fontSize: "clamp(11px, 2.6vw, 12px)",
                            fontWeight: 900,
                            letterSpacing: 0.4,
                            border: "1px solid rgba(255,255,255,0.12)",
                            background: tier.bg,
                            color: tier.fg,
                            boxShadow: "0 8px 18px rgba(0,0,0,0.25)",
                            whiteSpace: "nowrap",
                            opacity: 0.95,
                        }}
                    >
                        {tier.label} {tier.emoji}
                    </div>
                </div>

                {/* value highlight */}
                <div
                    style={{
                        fontSize: "clamp(26px, 7vw, 32px)",
                        fontWeight: 950,
                        letterSpacing: -0.6,
                        background: "linear-gradient(90deg, rgba(42,127,255,0.95), rgba(255,255,255,0.92))",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                        textShadow: "0 0 18px rgba(42,127,255,0.18)",
                        lineHeight: 1.05,
                    }}
                >
                    {value}
                </div>

                {/* subtitle */}
                <div style={{ fontSize: "clamp(12px, 3vw, 13px)", fontWeight: 850, opacity: 0.78 }}>
                    {subtitle}
                </div>

                {/* microcopy */}
                <div style={{ fontSize: "clamp(14px, 3.2vw, 15px)", fontWeight: 750, lineHeight: 1.35, opacity: 0.95 }}>
                    {line1}
                    <div style={{ marginTop: 6, opacity: 0.85 }}>{line2}</div>
                </div>

                {/* chips */}
                <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
                    <Chip text="⛰️ elevation" />
                    <Chip text={tier.key === "giant" ? "🦵 leg strength" : "🧠 consistency"} />
                    <Chip text="✅ earned" />
                </div>

                {/* tiny footer hint */}
                <div style={{ fontSize: "clamp(11px, 2.6vw, 12px)", opacity: 0.65 }}>
                    Climbing builds engine + resilience.
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

/**
 * Works even if value is "1.4×" or "2×" or "0.8×".
 * We tier based on how many "Burj Khalifas" you climbed.
 */
function getTier(value: string) {
    const n = parseFloat(String(value).replace(/[^\d.]/g, "")); // "1.4×" -> 1.4
    const x = isFinite(n) ? n : 0;

    if (x >= 3)
        return {
            key: "giant" as const,
            label: "MONSTER",
            emoji: "🦍",
            bg: "rgba(255,255,255,0.10)",
            fg: "#e9eef5",
        };

    if (x >= 1.5)
        return {
            key: "giant" as const,
            label: "ULTRA",
            emoji: "🏔️",
            bg: "rgba(42,127,255,0.20)",
            fg: "#e9eef5",
        };

    if (x >= 1)
        return {
            key: "solid" as const,
            label: "STRONG",
            emoji: "🔥",
            bg: "rgba(42,127,255,0.16)",
            fg: "#e9eef5",
        };

    if (x >= 0.5)
        return {
            key: "solid" as const,
            label: "BUILDING",
            emoji: "🌱",
            bg: "rgba(255,255,255,0.08)",
            fg: "#e9eef5",
        };

    return {
        key: "small" as const,
        label: "STARTER",
        emoji: "✅",
        bg: "rgba(255,255,255,0.06)",
        fg: "#e9eef5",
    };
}
