import type { WowItem } from "../WowItemCard";

export default function WowFloors(props: { item: WowItem }) {
    const title = props.item.title || "Floors climbed";
    const value = props.item.value || "0";
    const subtitle = props.item.subtitle || "~3m per floor";

    const floors = parseIntSafe(value);
    const tier = getFloorsTier(floors);

    const line1 =
        floors >= 5000
            ? "That’s a massive amount of climbing."
            : floors >= 2000
                ? "Serious vertical volume. Strong legs."
                : floors >= 600
                    ? "Solid climb work — that adds up fast."
                    : "Good work. Small climbs compound.";

    const line2 =
        floors >= 5000
            ? "Keep recovery tight — this is real load."
            : floors >= 2000
                ? "Consistent hills/stairs build durability."
                : floors >= 600
                    ? "One extra climb day/week is a big multiplier."
                    : "Stay steady — the building gets taller.";

    // visual blocks: 1 block per 150 floors (cap 18)
    const blocks = clampInt(Math.round(floors / 150), 0, 18);

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
                    "radial-gradient(900px 260px at 50% 0%, rgba(255,160,60,0.14), transparent 55%), rgba(255,255,255,0.03)",
                boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
                overflow: "hidden",
            }}
        >
            {/* animated warm glow */}
            <div
                aria-hidden
                style={{
                    position: "absolute",
                    inset: -60,
                    background:
                        "conic-gradient(from 180deg at 50% 50%, rgba(255,160,60,0.12), rgba(255,255,255,0.05), rgba(42,127,255,0.08))",
                    opacity: 0.30,
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

                {/* hero number */}
                <div
                    style={{
                        fontSize: "clamp(28px, 7.2vw, 36px)",
                        fontWeight: 950,
                        letterSpacing: -0.8,
                        lineHeight: 1.05,
                        background: "linear-gradient(90deg, rgba(255,160,60,0.95), rgba(255,255,255,0.92))",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                        textShadow: "0 0 18px rgba(255,160,60,0.18)",
                    }}
                >
                    {value}
                </div>

                {/* subtitle */}
                <div style={{ fontSize: "clamp(12px, 3vw, 13px)", fontWeight: 850, opacity: 0.78 }}>
                    {subtitle}
                </div>

                {/* building visual */}
                {blocks > 0 && (
                    <div style={{ display: "grid", placeItems: "center", marginTop: 2 }}>
                        <div
                            style={{
                                width: "min(92%, 240px)",
                                height: "clamp(46px, 14vw, 62px)",
                                borderRadius: 14,
                                border: "1px solid rgba(255,255,255,0.10)",
                                background: "rgba(255,255,255,0.03)",
                                overflow: "hidden",
                                position: "relative",
                            }}
                            aria-label="Building blocks"
                            title="Each block ≈ 150 floors"
                        >
                            {/* subtle grid */}
                            <div
                                aria-hidden
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    background:
                                        "linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(180deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                                    backgroundSize: "18px 18px",
                                    opacity: 0.35,
                                    pointerEvents: "none",
                                }}
                            />

                            <div
                                style={{
                                    position: "absolute",
                                    inset: 10,
                                    display: "flex",
                                    alignItems: "flex-end",
                                    justifyContent: "center",
                                    gap: "clamp(3px, 1vw, 4px)",
                                }}
                            >
                                {Array.from({ length: blocks }).map((_, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            width: "clamp(10px, 2.8vw, 12px)",
                                            height: `${12 + (i % 6) * 6}px`,
                                            borderRadius: 6,
                                            background: "rgba(255,160,60,0.72)",
                                            boxShadow: "0 0 12px rgba(255,160,60,0.16)",
                                            opacity: 0.92,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: 6, fontSize: "clamp(11px, 2.8vw, 12px)", opacity: 0.7, fontWeight: 850 }}>
                            building mode 🧱
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
                    <Chip text="🧱 stairs/hills" />
                    <Chip text={floors >= 2000 ? "🦵 strength" : "🌱 building"} />
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

function getFloorsTier(floors: number) {
    if (floors >= 5000)
        return {
            label: "TOWER MODE",
            emoji: "🏆",
            message: "That’s a huge amount of climbing.",
            bg: "rgba(255,255,255,0.10)",
            fg: "#e9eef5",
        };
    if (floors >= 2000)
        return {
            label: "BIG CLIMB",
            emoji: "🔥",
            message: "Serious vertical volume. Strong legs.",
            bg: "rgba(255,160,60,0.18)",
            fg: "#e9eef5",
        };
    if (floors >= 600)
        return {
            label: "SOLID",
            emoji: "✅",
            message: "Nice work. This adds up fast.",
            bg: "rgba(255,255,255,0.08)",
            fg: "#e9eef5",
        };
    return {
        label: "BUILDING",
        emoji: "🌱",
        message: "Keep going — the building gets taller.",
        bg: "rgba(255,255,255,0.06)",
        fg: "#e9eef5",
    };
}

function parseIntSafe(v: string) {
    const n = parseInt(String(v).replace(/[^\d]/g, ""), 10);
    return isFinite(n) ? n : 0;
}

function clampInt(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}
