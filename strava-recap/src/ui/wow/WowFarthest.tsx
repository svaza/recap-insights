import type { WowItem } from "../WowItemCard";

export default function WowFarthest(props: { item: WowItem }) {
    const title = props.item.title || "Farthest session";
    const value = props.item.value || "—"; // e.g. "13.21 mi" or "21.5 km"
    const subtitle = props.item.subtitle || ""; // e.g. "🏃‍♂️ Morning Run"

    const dist = parseDistance(value); // in unit from string
    const tier = getDistanceTier(dist.value, dist.unit);

    const line1 =
        tier.key === "ultra"
            ? "That’s a big day. Real endurance."
            : tier.key === "long"
                ? "That’s a legit long session."
                : tier.key === "solid"
                    ? "Nice distance — building the engine."
                    : "Good work. Keep stacking.";

    const line2 =
        tier.key === "ultra"
            ? "Recover well and you’ll bounce back stronger."
            : tier.key === "long"
                ? "Consistency with these changes everything."
                : tier.key === "solid"
                    ? "Add one more like this every couple weeks."
                    : "Next milestone is closer than you think.";

    // Fake-but-nice progress bar fill (based on tiers)
    const fillPct =
        tier.key === "ultra" ? 92 : tier.key === "long" ? 78 : tier.key === "solid" ? 62 : 45;

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
                    "radial-gradient(900px 260px at 50% 0%, rgba(42,127,255,0.18), transparent 55%), rgba(255,255,255,0.03)",
                boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
                overflow: "hidden",
            }}
        >
            {/* animated glow */}
            <div
                aria-hidden
                style={{
                    position: "absolute",
                    inset: -60,
                    background:
                        "conic-gradient(from 180deg at 50% 50%, rgba(42,127,255,0.10), rgba(255,255,255,0.06), rgba(42,127,255,0.10))",
                    opacity: 0.30,
                    filter: "blur(22px)",
                    animation: "recapSpin 12s linear infinite",
                    pointerEvents: "none",
                }}
            />

            {/* subtle motion stripe */}
            <div
                aria-hidden
                style={{
                    position: "absolute",
                    left: -90,
                    top: 14,
                    width: 280,
                    height: 38,
                    transform: "rotate(-12deg)",
                    background:
                        "linear-gradient(90deg, transparent, rgba(42,127,255,0.12), rgba(255,255,255,0.06), transparent)",
                    filter: "blur(2px)",
                    opacity: 0.9,
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

                {/* hero distance */}
                <div
                    style={{
                        fontSize: "clamp(30px, 7.5vw, 34px)",
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
                    {value}
                </div>

                {/* finish line micro-visual (responsive) */}
                <div style={{ display: "grid", placeItems: "center", marginTop: 2 }}>
                    <div
                        style={{
                            width: "min(86%, 180px)",
                            height: "clamp(8px, 2.2vw, 10px)",
                            borderRadius: 999,
                            background: "rgba(255,255,255,0.07)",
                            border: "1px solid rgba(255,255,255,0.10)",
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                height: "100%",
                                width: `${fillPct}%`,
                                borderRadius: 999,
                                background: "rgba(42,127,255,0.75)",
                                boxShadow: "0 0 14px rgba(42,127,255,0.22)",
                            }}
                        />
                    </div>
                    <div style={{ marginTop: 6, fontSize: "clamp(11px, 2.8vw, 12px)", opacity: 0.7, fontWeight: 850 }}>
                        finish line energy 🏁
                    </div>
                </div>

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
                    <Chip text="📏 distance" />
                    <Chip text={tier.key === "ultra" ? "🧠 grit" : "🦵 endurance"} />
                    <Chip text="✅ done" />
                </div>

                {/* tiny footer hint */}
                <div style={{ fontSize: "clamp(11px, 2.6vw, 12px)", opacity: 0.65 }}>
                    That’s not a workout — that’s a journey.
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

function parseDistance(v: string): { value: number; unit: "mi" | "km" | "m" | "unknown" } {
    const s = String(v).toLowerCase();

    // capture first number (supports "13.21 mi" or "21.1km")
    const n = parseFloat(s.replace(/[^0-9.]+/g, " ").trim().split(" ")[0] || "0");
    const value = isFinite(n) ? n : 0;

    if (s.includes("mi")) return { value, unit: "mi" };
    if (s.includes("km")) return { value, unit: "km" };
    if (s.includes(" m")) return { value, unit: "m" };
    return { value, unit: "unknown" };
}

function getDistanceTier(v: number, unit: "mi" | "km" | "m" | "unknown") {
    // If we can detect mi/km, tier thresholds based on common running distance landmarks.
    // If unknown, just tier on numeric value with conservative cutoffs.
    const miles = unit === "km" ? v * 0.621371 : unit === "mi" ? v : unit === "m" ? v * 0.000621371 : v;

    if (miles >= 26)
        return {
            key: "ultra" as const,
            label: "MARATHON+",
            emoji: "🏆",
            bg: "rgba(255,255,255,0.10)",
            fg: "#e9eef5",
        };
    if (miles >= 13)
        return {
            key: "long" as const,
            label: "HALF+",
            emoji: "🔥",
            bg: "rgba(42,127,255,0.18)",
            fg: "#e9eef5",
        };
    if (miles >= 6)
        return {
            key: "solid" as const,
            label: "LONG RUN",
            emoji: "🚀",
            bg: "rgba(255,255,255,0.08)",
            fg: "#e9eef5",
        };
    return {
        key: "base" as const,
        label: "BUILDING",
        emoji: "🌱",
        bg: "rgba(255,255,255,0.06)",
        fg: "#e9eef5",
    };
}
