import type { WowItem } from "../WowItemCard";

const THEMES: Record<string, { accent: string; glow: string; solid: string }> = {
    "avg-pace": {
        accent: "rgba(42,127,255,0.22)",
        glow: "rgba(42,127,255,0.10)",
        solid: "rgba(42,127,255,0.95)",
    },
    "avg-session": {
        accent: "rgba(0,210,255,0.20)",
        glow: "rgba(0,210,255,0.10)",
        solid: "rgba(0,210,255,0.95)",
    },
    "climb-density": {
        accent: "rgba(66,210,120,0.22)",
        glow: "rgba(66,210,120,0.10)",
        solid: "rgba(66,210,120,0.95)",
    },
    "biggest-climb": {
        accent: "rgba(66,210,120,0.22)",
        glow: "rgba(66,210,120,0.10)",
        solid: "rgba(66,210,120,0.95)",
    },
    "dominant-sport": {
        accent: "rgba(255,180,60,0.22)",
        glow: "rgba(255,180,60,0.10)",
        solid: "rgba(255,180,60,0.95)",
    },
    "variety": {
        accent: "rgba(190,130,255,0.22)",
        glow: "rgba(190,130,255,0.10)",
        solid: "rgba(190,130,255,0.95)",
    },
    "busiest-week": {
        accent: "rgba(255,90,110,0.22)",
        glow: "rgba(255,90,110,0.10)",
        solid: "rgba(255,90,110,0.95)",
    },
    "fastest-pace": {
        accent: "rgba(60,170,255,0.22)",
        glow: "rgba(60,170,255,0.10)",
        solid: "rgba(60,170,255,0.95)",
    },
    "best-5k": {
        accent: "rgba(190,130,255,0.22)",
        glow: "rgba(190,130,255,0.10)",
        solid: "rgba(190,130,255,0.95)",
    },
    "best-10k": {
        accent: "rgba(170,110,255,0.22)",
        glow: "rgba(170,110,255,0.10)",
        solid: "rgba(170,110,255,0.95)",
    },
    "most-active-day": {
        accent: "rgba(255,150,70,0.22)",
        glow: "rgba(255,150,70,0.10)",
        solid: "rgba(255,150,70,0.95)",
    },
    "time-of-day": {
        accent: "rgba(90,220,200,0.22)",
        glow: "rgba(90,220,200,0.10)",
        solid: "rgba(90,220,200,0.95)",
    },
    "avg-hr": {
        accent: "rgba(255,90,110,0.22)",
        glow: "rgba(255,90,110,0.10)",
        solid: "rgba(255,90,110,0.95)",
    },
    "max-hr": {
        accent: "rgba(255,70,90,0.22)",
        glow: "rgba(255,70,90,0.10)",
        solid: "rgba(255,70,90,0.95)",
    },
};

const COPY: Record<
    string,
    { line1: string; line2: string; chips: [string, string, string] }
> = {
    "avg-pace": {
        line1: "Smooth rhythm across your recap.",
        line2: "Consistency makes speed inevitable.",
        chips: ["⚡ rhythm", "🧠 steady", "✅ done"],
    },
    "avg-session": {
        line1: "That’s your typical session size.",
        line2: "Repeatable volume builds real fitness.",
        chips: ["📦 volume", "🔁 repeat", "✅ done"],
    },
    "climb-density": {
        line1: "That’s a solid hill profile.",
        line2: "Climbing strength pays off fast.",
        chips: ["⛰️ hills", "💪 strength", "✅ done"],
    },
    "biggest-climb": {
        line1: "That climb was a statement.",
        line2: "Elevation work builds real power.",
        chips: ["⛰️ climb", "🦵 strength", "✅ done"],
    },
    "dominant-sport": {
        line1: "Clear focus — you leaned in.",
        line2: "Mix it up if you want balance.",
        chips: ["🎯 focus", "🧩 balance", "✅ done"],
    },
    "variety": {
        line1: "Nice mix — your engine’s well rounded.",
        line2: "Different stress, better gains.",
        chips: ["🧩 variety", "🌈 mix", "✅ done"],
    },
    "busiest-week": {
        line1: "That week was on fire.",
        line2: "Protect that momentum.",
        chips: ["📅 week", "🔥 surge", "✅ done"],
    },
    "fastest-pace": {
        line1: "That pace is cooking.",
        line2: "Speed shows up when consistency does.",
        chips: ["⚡ pace", "🏎️ fast", "✅ done"],
    },
    "best-5k": {
        line1: "Strong 5k rhythm.",
        line2: "Sharp speed work is paying off.",
        chips: ["🏁 5k", "⚡ pace", "✅ done"],
    },
    "best-10k": {
        line1: "That 10k pace is legit.",
        line2: "Endurance + speed = results.",
        chips: ["🏁 10k", "⚡ pace", "✅ done"],
    },
    "most-active-day": {
        line1: "That day was stacked.",
        line2: "When you roll, you roll.",
        chips: ["📅 day", "📈 volume", "✅ done"],
    },
    "time-of-day": {
        line1: "Your body clock is dialed in.",
        line2: "Keep leaning into that rhythm.",
        chips: ["🕒 timing", "🌙 habit", "✅ done"],
    },
    "avg-hr": {
        line1: "That effort pushed the engine.",
        line2: "Respect the recovery.",
        chips: ["❤️ avg HR", "🧠 control", "✅ done"],
    },
    "max-hr": {
        line1: "You hit the red zone.",
        line2: "Big efforts demand big recovery.",
        chips: ["❤️ max HR", "🔥 peak", "✅ done"],
    },
};

export default function WowMetric(props: { item: WowItem }) {
    const { item } = props;
    const theme = THEMES[item.id] ?? THEMES["avg-pace"];
    const copy = COPY[item.id] ?? COPY["avg-pace"];

    const percentMatch = String(item.value || "").match(/(\d+)\s*%/);
    const percent = percentMatch ? Math.min(100, Math.max(0, Number(percentMatch[1] || 0))) : null;

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
                background: `radial-gradient(900px 260px at 50% 0%, ${theme.accent}, transparent 55%), rgba(255,255,255,0.03)`,
                boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
                overflow: "hidden",
            }}
        >
            <div
                aria-hidden
                style={{
                    position: "absolute",
                    inset: -60,
                    background: `conic-gradient(from 180deg at 50% 50%, ${theme.glow}, rgba(255,255,255,0.06), ${theme.glow})`,
                    opacity: 0.32,
                    filter: "blur(22px)",
                    animation: "recapSpin 12s linear infinite",
                    pointerEvents: "none",
                }}
            />

            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 14 }}>
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
                    title={item.title}
                >
                    {item.emoji}
                </div>

                <div style={{ fontSize: "clamp(11px, 2.6vw, 12px)", fontWeight: 900, letterSpacing: 1.2, opacity: 0.75 }}>
                    {String(item.title || "WOW").toUpperCase()}
                </div>

                <div
                    style={{
                        fontSize: "clamp(28px, 7.2vw, 36px)",
                        fontWeight: 950,
                        letterSpacing: -0.8,
                        lineHeight: 1.05,
                        background: `linear-gradient(90deg, ${theme.solid}, rgba(255,255,255,0.92))`,
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                        textShadow: `0 0 18px ${theme.glow}`,
                    }}
                >
                    {item.value || "—"}
                </div>

                {item.secondaryValue && (
                    <div style={{ fontSize: "clamp(12px, 3vw, 13px)", fontWeight: 800, opacity: 0.75 }}>
                        {item.secondaryValue}
                    </div>
                )}

                {percent !== null && (
                    <div style={{ display: "grid", placeItems: "center", marginTop: 2 }}>
                        <div
                            style={{
                                width: "min(88%, 220px)",
                                height: 10,
                                borderRadius: 999,
                                background: "rgba(255,255,255,0.07)",
                                border: "1px solid rgba(255,255,255,0.10)",
                                overflow: "hidden",
                            }}
                            aria-label="Percent meter"
                        >
                            <div
                                style={{
                                    height: "100%",
                                    width: `${percent}%`,
                                    borderRadius: 999,
                                    background: theme.solid,
                                    boxShadow: `0 0 14px ${theme.glow}`,
                                    transition: "width 400ms ease",
                                }}
                            />
                        </div>
                        <div style={{ marginTop: 6, fontSize: "clamp(11px, 2.8vw, 12px)", opacity: 0.75, fontWeight: 850 }}>
                            {percent}% share
                        </div>
                    </div>
                )}

                {item.subtitle && (
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
                            title={item.subtitle}
                        >
                            {item.subtitle}
                        </div>
                    </div>
                )}

                <div style={{ fontSize: "clamp(14px, 3.2vw, 15px)", fontWeight: 750, lineHeight: 1.35, opacity: 0.95 }}>
                    {copy.line1}
                    <div style={{ marginTop: 6, opacity: 0.85 }}>{copy.line2}</div>
                </div>

                <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
                    {copy.chips.map((text) => (
                        <Chip key={text} text={text} />
                    ))}
                </div>

                <div style={{ fontSize: "clamp(11px, 2.6vw, 12px)", opacity: 0.65 }}>
                    Keep stacking the basics.
                </div>
            </div>

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
