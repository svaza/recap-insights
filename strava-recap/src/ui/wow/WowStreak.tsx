import type { WowItem } from "../WowItemCard";

export default function WowStreak(props: { item: WowItem }) {
    const title = props.item.title || "Longest streak";
    const value = props.item.value || "0 days";
    const subtitle = props.item.subtitle || "";

    // Parse "7 days" / "12" / "12 days"
    const days = parseInt(String(value).replace(/[^\d]/g, ""), 10) || 0;

    // Simple meter: 0..14 days saturates (weekly habits)
    const fillPct = clampInt(Math.round((days / 14) * 100), 0, 100);

    const tier = getStreakTier(days);

    const line1 =
        days >= 21
            ? "This is identity-level consistency."
            : days >= 10
                ? "That streak is doing damage (in a good way)."
                : days >= 3
                    ? "Keep the chain alive — next one gets easier."
                    : "Start small, then protect the streak.";

    const line2 =
        days >= 21
            ? "When you show up like this, results become inevitable."
            : days >= 10
                ? "Don’t overcook it — consistency beats hero days."
                : days >= 3
                    ? "One more day is the only goal."
                    : "Make it easy to repeat tomorrow.";

    // chain links: 1 per day (cap 14)
    const links = clampInt(days, 0, 14);

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
                    "radial-gradient(900px 260px at 50% 0%, rgba(255,140,0,0.18), transparent 55%), rgba(255,255,255,0.03)",
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
                        "conic-gradient(from 180deg at 50% 50%, rgba(255,140,0,0.12), rgba(255,255,255,0.05), rgba(255,70,70,0.10))",
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
                        background: "linear-gradient(90deg, rgba(255,140,0,0.95), rgba(255,255,255,0.92))",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                        textShadow: "0 0 18px rgba(255,140,0,0.18)",
                    }}
                >
                    {value}
                </div>

                {/* streak meter + chain visual */}
                <div style={{ display: "grid", placeItems: "center", marginTop: 2 }}>
                    <div
                        style={{
                            width: "min(92%, 260px)",
                            height: 12,
                            borderRadius: 999,
                            background: "rgba(255,255,255,0.07)",
                            border: "1px solid rgba(255,255,255,0.10)",
                            overflow: "hidden",
                        }}
                        aria-label="Streak meter"
                    >
                        <div
                            style={{
                                height: "100%",
                                width: `${fillPct}%`,
                                borderRadius: 999,
                                background: "linear-gradient(90deg, rgba(255,140,0,0.85), rgba(255,70,70,0.75))",
                                boxShadow: "0 0 14px rgba(255,140,0,0.22)",
                                transition: "width 400ms ease",
                            }}
                        />
                    </div>

                    {/* chain links */}
                    <div
                        style={{
                            marginTop: 10,
                            width: "min(92%, 260px)",
                            display: "flex",
                            justifyContent: "center",
                            gap: 6,
                            flexWrap: "wrap",
                        }}
                        aria-label="Streak chain"
                        title="Each link represents a day in the streak (capped at 14 visually)"
                    >
                        {Array.from({ length: Math.max(1, Math.min(14, links || 1)) }).map((_, i) => {
                            const active = i < links;
                            return (
                                <div
                                    key={i}
                                    aria-hidden
                                    style={{
                                        width: 14,
                                        height: 10,
                                        borderRadius: 999,
                                        border: "1px solid rgba(255,255,255,0.14)",
                                        background: active ? "rgba(255,140,0,0.45)" : "rgba(255,255,255,0.06)",
                                        boxShadow: active ? "0 0 10px rgba(255,140,0,0.16)" : "none",
                                        opacity: active ? 0.95 : 0.6,
                                    }}
                                />
                            );
                        })}
                    </div>

                    <div style={{ marginTop: 8, fontSize: "clamp(11px, 2.8vw, 12px)", opacity: 0.75, fontWeight: 850 }}>
                        {fillPct}% streak power ⚡
                    </div>
                </div>

                {/* subtitle chip (if any) */}
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
                    <Chip text="🔥 habit" />
                    <Chip text={days >= 10 ? "🧠 discipline" : "🌱 building"} />
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

function getStreakTier(days: number) {
    if (days >= 21)
        return {
            label: "ELITE",
            emoji: "🏆",
            message: "This is identity-level consistency.",
            bg: "rgba(255,255,255,0.10)",
            fg: "#e9eef5",
        };
    if (days >= 10)
        return {
            label: "STRONG",
            emoji: "🔥",
            message: "That streak is doing damage (in a good way).",
            bg: "rgba(255,140,0,0.18)",
            fg: "#e9eef5",
        };
    if (days >= 3)
        return {
            label: "SOLID",
            emoji: "✅",
            message: "Keep the chain alive — next one gets easier.",
            bg: "rgba(255,255,255,0.08)",
            fg: "#e9eef5",
        };
    return {
        label: "STARTING",
        emoji: "🌱",
        message: "Start small, then protect the streak.",
        bg: "rgba(255,255,255,0.06)",
        fg: "#e9eef5",
    };
}

function clampInt(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}
