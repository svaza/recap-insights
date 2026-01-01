import type { WowItem } from "../WowItemCard";

export default function WowEiffel(props: { item: WowItem }) {
    const title = props.item.title || "Eiffel Towers";
    const value = props.item.value || "0×";
    const subtitle = props.item.subtitle || "";

    // Parse "1.4×" -> 1.4
    const raw = parseFloat(String(value).replace(/[^\d.]/g, ""));
    const factor = isFinite(raw) ? Math.max(0, raw) : 0;

    const tier = getEiffelTier(factor);

    // Visual stack: 1 block per 0.25x (cap at 16)
    const blocks = Math.max(0, Math.min(16, Math.round(factor / 0.25)));

    const line1 =
        factor >= 3
            ? "That’s a lot of vertical work."
            : factor >= 1.5
                ? "Solid climbing — legs are getting stronger."
                : "Every climb counts. Keep stacking hills.";

    const line2 =
        factor >= 6
            ? "Recovery matters here — elevation load is real."
            : factor >= 3
                ? "Consistent hills = durable engine."
                : factor >= 1.5
                    ? "One extra hill day/week compounds fast."
                    : "Small climbs repeated = big gains.";

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
                    "radial-gradient(900px 260px at 50% 0%, rgba(140,90,255,0.18), transparent 55%), rgba(255,255,255,0.03)",
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
                        "conic-gradient(from 180deg at 50% 50%, rgba(140,90,255,0.12), rgba(255,255,255,0.05), rgba(42,127,255,0.10))",
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

                {/* hero number */}
                <div
                    style={{
                        fontSize: "clamp(30px, 7.5vw, 38px)",
                        fontWeight: 950,
                        letterSpacing: -0.9,
                        lineHeight: 1.05,
                        background: "linear-gradient(90deg, rgba(140,90,255,0.95), rgba(255,255,255,0.92))",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                        textShadow: "0 0 18px rgba(140,90,255,0.18)",
                    }}
                >
                    {value}
                </div>

                {/* tower stack visualization (responsive width) */}
                {blocks > 0 && (
                    <div style={{ display: "grid", placeItems: "center", marginTop: 2 }}>
                        <div
                            style={{
                                width: "min(92%, 220px)",
                                height: "clamp(30px, 8vw, 36px)",
                                display: "flex",
                                alignItems: "flex-end",
                                justifyContent: "center",
                                gap: "clamp(3px, 1vw, 4px)",
                            }}
                            aria-label="Tower stack"
                            title="Each block ≈ 0.25× Eiffel Tower"
                        >
                            {Array.from({ length: blocks }).map((_, i) => (
                                <div
                                    key={i}
                                    style={{
                                        width: "clamp(7px, 2.2vw, 8px)",
                                        height: `clamp(10px, 3vw, 12px)`,
                                        borderRadius: 3,
                                        background: "rgba(140,90,255,0.75)",
                                        boxShadow: "0 0 12px rgba(140,90,255,0.18)",
                                        opacity: 0.9,
                                        transform: `translateY(${(i % 5) * 1}px)`, // tiny variation
                                    }}
                                />
                            ))}
                        </div>
                        <div style={{ marginTop: 6, fontSize: "clamp(11px, 2.8vw, 12px)", opacity: 0.75, fontWeight: 850 }}>
                            tower stack mode 🗼
                        </div>
                    </div>
                )}

                {/* subtitle pill */}
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
                    <Chip text="⛰️ elevation" />
                    <Chip text={factor >= 3 ? "🦵 strength" : "🌱 building"} />
                    <Chip text="✅ earned" />
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

function getEiffelTier(x: number) {
    if (x >= 6)
        return {
            label: "MOUNTAIN MODE",
            message: "At this point you’re basically climbing skylines.",
            bg: "rgba(255,255,255,0.10)",
            fg: "#e9eef5",
        };
    if (x >= 3)
        return {
            label: "BIG CLIMB",
            message: "That’s a lot of vertical. Legs of steel.",
            bg: "rgba(140,90,255,0.18)",
            fg: "#e9eef5",
        };
    if (x >= 1.5)
        return {
            label: "NICE CLIMB",
            message: "Solid elevation work — keep stacking.",
            bg: "rgba(255,255,255,0.08)",
            fg: "#e9eef5",
        };
    return {
        label: "CLIMBING UP",
        message: "Every bit of vertical counts. Next tower soon.",
        bg: "rgba(255,255,255,0.06)",
        fg: "#e9eef5",
    };
}
