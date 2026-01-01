import type { WowItem } from "../WowItemCard";

export default function WowBiggestEffort(props: { item: WowItem }) {
    // value is like "2h 34m 12s", subtitle like "🏃‍♂️ Morning Run"
    const duration = props.item.value || "—";
    const activityRaw = props.item.subtitle ?? "activity";

    const seconds = parseDurationSeconds(duration);
    const tier = getEffortTier(seconds);

    // keep activity readable (subtitle often already includes emoji)
    const activity = String(activityRaw).trim();

    const line1 =
        seconds >= 2 * 3600
            ? "That’s a serious endurance block."
            : seconds >= 60 * 60
                ? "That’s a solid long session."
                : seconds >= 30 * 60
                    ? "Nice sustained effort."
                    : "Good work getting it done.";

    const line2 =
        seconds >= 2 * 3600
            ? "Recover well — this is where fitness compounds."
            : seconds >= 60 * 60
                ? "Stack a few like this and your base jumps."
                : seconds >= 30 * 60
                    ? "Consistency + sessions like this = progress."
                    : "Keep building. One step at a time.";

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
                    "radial-gradient(800px 240px at 50% 0%, rgba(42,127,255,0.22), transparent 55%), rgba(255,255,255,0.03)",
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
                    BIGGEST EFFORT
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

                {/* duration highlight */}
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
                    {duration}
                </div>

                {/* activity line (keeps long names sane) */}
                <div
                    style={{
                        fontSize: "clamp(12px, 3vw, 13px)",
                        fontWeight: 850,
                        opacity: 0.78,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "100%",
                    }}
                    title={activity}
                >
                    {activity}
                </div>

                {/* microcopy */}
                <div style={{ fontSize: "clamp(14px, 3.2vw, 15px)", fontWeight: 750, lineHeight: 1.35, opacity: 0.95 }}>
                    {line1}
                    <div style={{ marginTop: 6, opacity: 0.85 }}>{line2}</div>
                </div>

                {/* chips */}
                <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
                    <Chip text={seconds >= 3600 ? "🚀 long session" : "⚡ effort"} />
                    <Chip text={seconds >= 2 * 3600 ? "🧠 patience" : "🧠 discipline"} />
                    <Chip text="✅ done" />
                </div>

                {/* tiny footer hint */}
                <div style={{ fontSize: "clamp(11px, 2.6vw, 12px)", opacity: 0.65 }}>
                    Keep stacking sessions like this.
                </div>
            </div>

            {/* local keyframes (no libs) */}
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

/** Parses strings like "2h 34m 12s", "1h 4m", "45m 12s", "12m" into seconds. */
function parseDurationSeconds(s: string) {
    const str = (s || "").toLowerCase();

    const h = matchNum(str, /(\d+)\s*h/);
    const m = matchNum(str, /(\d+)\s*m/);
    const sec = matchNum(str, /(\d+)\s*s/);

    // If the string is something unexpected, just return 0 (keeps UI stable)
    if (h === 0 && m === 0 && sec === 0) return 0;

    return h * 3600 + m * 60 + sec;
}

function matchNum(str: string, re: RegExp) {
    const m = str.match(re);
    return m ? Number(m[1] || 0) : 0;
}

function getEffortTier(seconds: number) {
    if (seconds >= 3 * 3600)
        return {
            label: "MONSTER",
            emoji: "🦍",
            message: "That’s a huge session.",
            bg: "rgba(255,255,255,0.10)",
            fg: "#e9eef5",
        };
    if (seconds >= 2 * 3600)
        return {
            label: "ULTRA",
            emoji: "🏔️",
            message: "Endurance for days.",
            bg: "rgba(42,127,255,0.20)",
            fg: "#e9eef5",
        };
    if (seconds >= 60 * 60)
        return {
            label: "STRONG",
            emoji: "🔥",
            message: "Solid long effort.",
            bg: "rgba(42,127,255,0.16)",
            fg: "#e9eef5",
        };
    if (seconds >= 30 * 60)
        return {
            label: "SOLID",
            emoji: "✅",
            message: "Nice sustained work.",
            bg: "rgba(255,255,255,0.08)",
            fg: "#e9eef5",
        };
    return {
        label: "BUILDING",
        emoji: "🌱",
        message: "Momentum starts here.",
        bg: "rgba(255,255,255,0.06)",
        fg: "#e9eef5",
    };
}
