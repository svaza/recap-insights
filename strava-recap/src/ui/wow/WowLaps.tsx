import type { WowItem } from "../WowItemCard";

export default function WowLaps(props: { item: WowItem }) {
    const title = props.item.title || "Track laps";
    const value = props.item.value || "0";          // usually an integer string like "124"
    const subtitle = props.item.subtitle || "400m laps";

    const laps = parseIntSafe(value);
    const tier = getLapsTier(laps);

    const line1 =
        laps >= 200
            ? "That’s a lot of laps. Pure consistency."
            : laps >= 80
                ? "Serious track volume."
                : laps >= 20
                    ? "Nice chunk of laps — solid work."
                    : "Every lap counts. Keep stacking.";

    const line2 =
        laps >= 200
            ? "You’re building durability the hard way."
            : laps >= 80
                ? "This kind of repetition makes you faster."
                : laps >= 20
                    ? "Do this consistently and the pace follows."
                    : "Show up, repeat, improve.";

    // orbit dots on the track: cap at 12
    const dots = clampInt(Math.round(laps / 12), 1, 12);
    const pct = clampInt(Math.round((dots / 12) * 100), 8, 100);

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
                    "radial-gradient(900px 260px at 50% 0%, rgba(255,90,140,0.14), transparent 55%), rgba(255,255,255,0.03)",
                boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
                overflow: "hidden",
            }}
        >
            {/* animated track glow */}
            <div
                aria-hidden
                style={{
                    position: "absolute",
                    inset: -60,
                    background:
                        "conic-gradient(from 180deg at 50% 50%, rgba(255,90,140,0.12), rgba(255,255,255,0.05), rgba(42,127,255,0.08))",
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

                {/* hero value */}
                <div
                    style={{
                        fontSize: "clamp(28px, 7.2vw, 36px)",
                        fontWeight: 950,
                        letterSpacing: -0.8,
                        lineHeight: 1.05,
                        background: "linear-gradient(90deg, rgba(255,90,140,0.95), rgba(255,255,255,0.92))",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                        textShadow: "0 0 18px rgba(255,90,140,0.18)",
                    }}
                >
                    {value}
                </div>

                {/* subtitle */}
                <div style={{ fontSize: "clamp(12px, 3vw, 13px)", fontWeight: 850, opacity: 0.78 }}>
                    {subtitle}
                </div>

                {/* oval track visual */}
                <div style={{ display: "grid", placeItems: "center", marginTop: 2 }}>
                    <div
                        style={{
                            width: "min(92%, 250px)",
                            height: "clamp(60px, 18vw, 82px)",
                            borderRadius: 999,
                            border: "1px solid rgba(255,255,255,0.10)",
                            background: "rgba(255,255,255,0.03)",
                            position: "relative",
                            overflow: "hidden",
                        }}
                        aria-label="Track"
                        title="A little lap track vibe"
                    >
                        {/* inner lane */}
                        <div
                            aria-hidden
                            style={{
                                position: "absolute",
                                inset: "12%",
                                borderRadius: 999,
                                border: "1px solid rgba(255,255,255,0.10)",
                                opacity: 0.9,
                            }}
                        />

                        {/* progress arc */}
                        <div
                            aria-hidden
                            style={{
                                position: "absolute",
                                inset: "8%",
                                borderRadius: 999,
                                border: "2px solid rgba(255,90,140,0.60)",
                                boxShadow: "0 0 16px rgba(255,90,140,0.16)",
                                clipPath: `inset(0 ${100 - pct}% 0 0 round 999px)`,
                                opacity: 0.9,
                            }}
                        />

                        {/* runner dots */}
                        {Array.from({ length: dots }).map((_, i) => (
                            <div
                                key={i}
                                aria-hidden
                                style={{
                                    position: "absolute",
                                    left: `${10 + (i * 80) / Math.max(1, dots - 1)}%`,
                                    top: `${i % 2 === 0 ? "24%" : "62%"}`,
                                    width: 6,
                                    height: 6,
                                    borderRadius: 999,
                                    background: "rgba(255,255,255,0.35)",
                                    boxShadow: "0 0 10px rgba(255,90,140,0.18)",
                                    transform: "translate(-50%, -50%)",
                                }}
                            />
                        ))}
                    </div>

                    <div style={{ marginTop: 6, fontSize: "clamp(11px, 2.8vw, 12px)", opacity: 0.7, fontWeight: 850 }}>
                        lap mode 🏟️
                    </div>
                </div>

                {/* microcopy */}
                <div style={{ fontSize: "clamp(14px, 3.2vw, 15px)", fontWeight: 750, lineHeight: 1.35, opacity: 0.95 }}>
                    {line1}
                    <div style={{ marginTop: 6, opacity: 0.85 }}>{line2}</div>
                </div>

                {/* chips */}
                <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
                    <Chip text="🏟️ track" />
                    <Chip text={laps >= 80 ? "⚡ repeatability" : "🌱 building"} />
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

function getLapsTier(laps: number) {
    if (laps >= 200)
        return {
            label: "TRACK MONK",
            emoji: "🏆",
            message: "That’s a ton of repetition. Elite consistency.",
            bg: "rgba(255,255,255,0.10)",
            fg: "#e9eef5",
        };
    if (laps >= 80)
        return {
            label: "BIG SESSION",
            emoji: "🔥",
            message: "Serious lap volume. You’re building speed.",
            bg: "rgba(255,90,140,0.18)",
            fg: "#e9eef5",
        };
    if (laps >= 20)
        return {
            label: "SOLID",
            emoji: "✅",
            message: "Nice chunk of laps. Keep stacking.",
            bg: "rgba(255,255,255,0.08)",
            fg: "#e9eef5",
        };
    return {
        label: "BUILDING",
        emoji: "🌱",
        message: "Every lap counts. Momentum starts here.",
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
