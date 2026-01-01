import { num } from "../../utils/format";
import type { WowItem } from "../WowItemCard";

export default function WowMoon(props: { item: WowItem }) {
    const title = props.item.title || "To the Moon";
    const value = props.item.value || "0%"; // like "1.2%"
    const subtitle = props.item.subtitle || "Earth → Moon";

    const pct = clamp(parseFloat(String(value).replace(/[^\d.]/g, "")) || 0, 0, 200);
    const tier = getMoonTier(pct);

    // visual: progress across a “space lane” from Earth to Moon
    const progress = clamp(pct, 0, 100); // we render 0..100% (cap visually), but tiers can go higher
    const dots = clampInt(Math.round(progress / 10), 1, 10);

    const line1 =
        pct >= 50
            ? "Halfway to the Moon is already insane distance."
            : pct >= 10
                ? "That’s real travel. You’re building huge volume."
                : pct >= 1
                    ? "You’re on the way. Keep stacking."
                    : "First percent is closer than it looks.";

    const line2 =
        pct >= 50
            ? "Recover well — this is serious load."
            : pct >= 10
                ? "Consistency like this compounds fast."
                : pct >= 1
                    ? "Steady weeks make this jump quickly."
                    : "One step at a time — keep moving.";

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
                    "radial-gradient(900px 260px at 50% 0%, rgba(180,120,255,0.14), transparent 55%), rgba(255,255,255,0.03)",
                boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
                overflow: "hidden",
            }}
        >
            {/* animated nebula glow */}
            <div
                aria-hidden
                style={{
                    position: "absolute",
                    inset: -60,
                    background:
                        "conic-gradient(from 180deg at 50% 50%, rgba(180,120,255,0.12), rgba(255,255,255,0.05), rgba(42,127,255,0.08))",
                    opacity: 0.32,
                    filter: "blur(22px)",
                    animation: "recapSpin 14s linear infinite",
                    pointerEvents: "none",
                }}
            />

            {/* star speckles */}
            <div
                aria-hidden
                style={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.10), transparent 18%), radial-gradient(circle at 70% 25%, rgba(255,255,255,0.07), transparent 16%), radial-gradient(circle at 60% 75%, rgba(255,255,255,0.08), transparent 18%), radial-gradient(circle at 30% 80%, rgba(255,255,255,0.06), transparent 16%)",
                    opacity: 0.55,
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

                {/* hero value */}
                <div
                    style={{
                        fontSize: "clamp(28px, 7.2vw, 36px)",
                        fontWeight: 950,
                        letterSpacing: -0.8,
                        lineHeight: 1.05,
                        background: "linear-gradient(90deg, rgba(180,120,255,0.95), rgba(255,255,255,0.92))",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                        textShadow: "0 0 18px rgba(180,120,255,0.18)",
                    }}
                >
                    {num(pct, 1)}%
                </div>

                {/* subtitle */}
                <div style={{ fontSize: "clamp(12px, 3vw, 13px)", fontWeight: 850, opacity: 0.78 }}>
                    {subtitle}
                </div>

                {/* launch / orbit visual */}
                <div style={{ display: "grid", placeItems: "center", marginTop: 2 }}>
                    <div
                        style={{
                            width: "min(92%, 260px)",
                            height: "clamp(64px, 18vw, 84px)",
                            borderRadius: 16,
                            border: "1px solid rgba(255,255,255,0.10)",
                            background: "rgba(255,255,255,0.03)",
                            position: "relative",
                            overflow: "hidden",
                        }}
                        aria-label="Earth to Moon lane"
                        title="Progress toward the Moon (visual capped at 100%)"
                    >
                        {/* faint diagonal space streak */}
                        <div
                            aria-hidden
                            style={{
                                position: "absolute",
                                left: -60,
                                top: 18,
                                width: 240,
                                height: 34,
                                transform: "rotate(-12deg)",
                                background:
                                    "linear-gradient(90deg, transparent, rgba(180,120,255,0.10), rgba(255,255,255,0.06), transparent)",
                                filter: "blur(2px)",
                                opacity: 0.9,
                            }}
                        />

                        {/* dotted trajectory */}
                        <div
                            aria-hidden
                            style={{
                                position: "absolute",
                                left: 16,
                                right: 16,
                                top: "50%",
                                height: 2,
                                transform: "translateY(-50%)",
                                background: "rgba(255,255,255,0.10)",
                                maskImage: "repeating-linear-gradient(90deg, #000 0 9px, transparent 9px 15px)",
                                opacity: 0.9,
                            }}
                        />

                        {/* progress glow */}
                        <div
                            aria-hidden
                            style={{
                                position: "absolute",
                                left: 16,
                                top: "50%",
                                height: 2,
                                width: `calc((100% - 32px) * ${progress / 100})`,
                                transform: "translateY(-50%)",
                                background: "rgba(180,120,255,0.70)",
                                boxShadow: "0 0 14px rgba(180,120,255,0.16)",
                                borderRadius: 999,
                            }}
                        />

                        {/* Earth */}
                        <div
                            aria-hidden
                            style={{
                                position: "absolute",
                                left: 12,
                                top: "50%",
                                transform: "translate(-50%, -50%)",
                                width: 18,
                                height: 18,
                                borderRadius: 999,
                                background: "radial-gradient(circle at 30% 30%, rgba(0,190,255,0.95), rgba(0,120,255,0.55))",
                                boxShadow: "0 0 16px rgba(0,190,255,0.14)",
                            }}
                        />

                        {/* Moon */}
                        <div
                            aria-hidden
                            style={{
                                position: "absolute",
                                right: 12,
                                top: "50%",
                                transform: "translate(50%, -50%)",
                                width: 16,
                                height: 16,
                                borderRadius: 999,
                                background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.85), rgba(255,255,255,0.30))",
                                boxShadow: "0 0 14px rgba(255,255,255,0.12)",
                            }}
                        />

                        {/* rocket */}
                        <div
                            aria-hidden
                            style={{
                                position: "absolute",
                                left: `calc(16px + (100% - 32px) * ${progress / 100})`,
                                top: "50%",
                                transform: "translate(-50%, -50%)",
                                fontSize: 16,
                                filter: "drop-shadow(0 0 10px rgba(180,120,255,0.20))",
                            }}
                        >
                            🚀
                        </div>

                        {/* checkpoint dots (cosmetic) */}
                        {Array.from({ length: dots }).map((_, i) => (
                            <div
                                key={i}
                                aria-hidden
                                style={{
                                    position: "absolute",
                                    left: `calc(16px + (100% - 32px) * ${(i + 1) / (dots + 1)})`,
                                    top: i % 2 === 0 ? "34%" : "66%",
                                    transform: "translate(-50%, -50%)",
                                    width: 6,
                                    height: 6,
                                    borderRadius: 999,
                                    background: "rgba(255,255,255,0.30)",
                                    boxShadow: "0 0 10px rgba(180,120,255,0.14)",
                                    opacity: 0.9,
                                }}
                            />
                        ))}
                    </div>

                    <div style={{ marginTop: 6, fontSize: "clamp(11px, 2.8vw, 12px)", opacity: 0.7, fontWeight: 850 }}>
                        launch mode 🌕
                    </div>
                </div>

                {/* microcopy */}
                <div style={{ fontSize: "clamp(14px, 3.2vw, 15px)", fontWeight: 750, lineHeight: 1.35, opacity: 0.95 }}>
                    {line1}
                    <div style={{ marginTop: 6, opacity: 0.85 }}>{line2}</div>
                </div>

                {/* chips */}
                <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
                    <Chip text="🌕 distance" />
                    <Chip text={pct >= 10 ? "🧠 consistency" : "🌱 building"} />
                    <Chip text="✅ done" />
                </div>

                {/* footer hint */}
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

function getMoonTier(pct: number) {
    if (pct >= 100)
        return {
            label: "LUNAR LANDING",
            emoji: "🏆",
            message: "You made it. Full Earth → Moon equivalent.",
            bg: "rgba(255,255,255,0.10)",
            fg: "#e9eef5",
        };
    if (pct >= 50)
        return {
            label: "HALFWAY",
            emoji: "🔥",
            message: "Halfway to the Moon is already insane distance.",
            bg: "rgba(180,120,255,0.18)",
            fg: "#e9eef5",
        };
    if (pct >= 10)
        return {
            label: "ORBITING",
            emoji: "✅",
            message: "That’s real travel. Keep stacking volume.",
            bg: "rgba(255,255,255,0.08)",
            fg: "#e9eef5",
        };
    if (pct >= 1)
        return {
            label: "LAUNCHING",
            emoji: "🚀",
            message: "You’re on the way. Consistency compounds fast.",
            bg: "rgba(180,120,255,0.12)",
            fg: "#e9eef5",
        };
    return {
        label: "IGNITION",
        emoji: "🌱",
        message: "Every mile/km counts. First percent is coming.",
        bg: "rgba(255,255,255,0.06)",
        fg: "#e9eef5",
    };
}

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

function clampInt(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}
