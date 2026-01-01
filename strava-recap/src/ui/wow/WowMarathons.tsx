import type { WowItem } from "../WowItemCard";

export default function WowMarathons(props: { item: WowItem }) {
    const title = props.item.title || "Marathons";
    const value = props.item.value || "0×";          // like "1.7×" or "3×"
    const subtitle = props.item.subtitle || "42.195 km each";

    const x = parseFactor(value); // marathons equivalent
    const tier = getMarathonTier(x);

    const line1 =
        x >= 10
            ? "That’s a ridiculous amount of distance."
            : x >= 5
                ? "That’s a lot of marathon-equivalent volume."
                : x >= 2
                    ? "Solid mileage — that’s real endurance work."
                    : x >= 1
                        ? "You crossed the marathon-equivalent mark."
                        : "You’re building towards the first marathon-equivalent.";

    const line2 =
        x >= 10
            ? "This is compounding work. Recover well."
            : x >= 5
                ? "Keep it consistent and everything gets easier."
                : x >= 2
                    ? "A few blocks like this and fitness jumps."
                    : x >= 1
                        ? "That’s a milestone. Keep stacking."
                        : "One steady week at a time.";

    // checkpoint dots: 1 dot per 0.5× (cap 12)
    const dots = clampInt(Math.round(x / 0.5), 1, 12);
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
                    "radial-gradient(900px 260px at 50% 0%, rgba(255,210,70,0.14), transparent 55%), rgba(255,255,255,0.03)",
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
                        "conic-gradient(from 180deg at 50% 50%, rgba(255,210,70,0.12), rgba(255,255,255,0.05), rgba(42,127,255,0.08))",
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
                        background: "linear-gradient(90deg, rgba(255,210,70,0.95), rgba(255,255,255,0.92))",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                        textShadow: "0 0 18px rgba(255,210,70,0.18)",
                    }}
                >
                    {value}
                </div>

                {/* subtitle */}
                <div style={{ fontSize: "clamp(12px, 3vw, 13px)", fontWeight: 850, opacity: 0.78 }}>
                    {subtitle}
                </div>

                {/* route + checkpoints visual */}
                <div style={{ display: "grid", placeItems: "center", marginTop: 2 }}>
                    <div
                        style={{
                            width: "min(92%, 260px)",
                            height: "clamp(56px, 16vw, 72px)",
                            borderRadius: 16,
                            border: "1px solid rgba(255,255,255,0.10)",
                            background: "rgba(255,255,255,0.03)",
                            position: "relative",
                            overflow: "hidden",
                        }}
                        aria-label="Route with checkpoints"
                        title="Each dot ≈ 0.5× marathon"
                    >
                        {/* dashed route */}
                        <div
                            aria-hidden
                            style={{
                                position: "absolute",
                                left: 14,
                                right: 14,
                                top: "50%",
                                height: 2,
                                transform: "translateY(-50%)",
                                background:
                                    "linear-gradient(90deg, rgba(255,255,255,0.10), rgba(255,255,255,0.10))",
                                maskImage:
                                    "repeating-linear-gradient(90deg, #000 0 10px, transparent 10px 18px)",
                                opacity: 0.9,
                            }}
                        />

                        {/* progress overlay */}
                        <div
                            aria-hidden
                            style={{
                                position: "absolute",
                                left: 14,
                                top: "50%",
                                height: 2,
                                width: `calc((100% - 28px) * ${pct / 100})`,
                                transform: "translateY(-50%)",
                                background: "rgba(255,210,70,0.70)",
                                boxShadow: "0 0 14px rgba(255,210,70,0.16)",
                                borderRadius: 999,
                            }}
                        />

                        {/* start flag */}
                        <div
                            aria-hidden
                            style={{
                                position: "absolute",
                                left: 12,
                                top: "50%",
                                transform: "translate(-50%, -50%)",
                                fontSize: 14,
                                opacity: 0.8,
                            }}
                        >
                            🚩
                        </div>

                        {/* finish flag */}
                        <div
                            aria-hidden
                            style={{
                                position: "absolute",
                                right: 12,
                                top: "50%",
                                transform: "translate(50%, -50%)",
                                fontSize: 14,
                                opacity: 0.9,
                            }}
                        >
                            🏁
                        </div>

                        {/* checkpoint dots */}
                        {Array.from({ length: dots }).map((_, i) => {
                            const t = dots === 1 ? 0.6 : i / (dots - 1);
                            return (
                                <div
                                    key={i}
                                    aria-hidden
                                    style={{
                                        position: "absolute",
                                        left: `calc(14px + (100% - 28px) * ${t})`,
                                        top: "50%",
                                        transform: "translate(-50%, -50%)",
                                        width: 7,
                                        height: 7,
                                        borderRadius: 999,
                                        background: i === dots - 1 ? "rgba(255,210,70,0.90)" : "rgba(255,255,255,0.35)",
                                        boxShadow: "0 0 12px rgba(255,210,70,0.16)",
                                        opacity: 0.95,
                                    }}
                                />
                            );
                        })}
                    </div>

                    <div style={{ marginTop: 6, fontSize: "clamp(11px, 2.8vw, 12px)", opacity: 0.7, fontWeight: 850 }}>
                        route mode 🏁
                    </div>
                </div>

                {/* microcopy */}
                <div style={{ fontSize: "clamp(14px, 3.2vw, 15px)", fontWeight: 750, lineHeight: 1.35, opacity: 0.95 }}>
                    {line1}
                    <div style={{ marginTop: 6, opacity: 0.85 }}>{line2}</div>
                </div>

                {/* chips */}
                <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
                    <Chip text="🏁 endurance" />
                    <Chip text={x >= 2 ? "🧠 grit" : "🌱 building"} />
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

function getMarathonTier(x: number) {
    if (x >= 10)
        return {
            label: "LEGEND",
            emoji: "🏆",
            message: "That’s a wild amount of marathon-equivalent distance.",
            bg: "rgba(255,255,255,0.10)",
            fg: "#e9eef5",
        };
    if (x >= 5)
        return {
            label: "ULTRA VIBES",
            emoji: "🔥",
            message: "Big volume. Keep it consistent.",
            bg: "rgba(255,210,70,0.18)",
            fg: "#e9eef5",
        };
    if (x >= 2)
        return {
            label: "STRONG",
            emoji: "✅",
            message: "Solid endurance work. Keep stacking.",
            bg: "rgba(255,255,255,0.08)",
            fg: "#e9eef5",
        };
    if (x >= 1)
        return {
            label: "MILESTONE",
            emoji: "🚀",
            message: "Marathon-equivalent achieved. Nice.",
            bg: "rgba(255,210,70,0.12)",
            fg: "#e9eef5",
        };
    return {
        label: "BUILDING",
        emoji: "🌱",
        message: "Every run counts. The first marathon-equivalent is coming.",
        bg: "rgba(255,255,255,0.06)",
        fg: "#e9eef5",
    };
}

function parseFactor(v: string) {
    const n = parseFloat(String(v).replace(/[^\d.]/g, ""));
    return isFinite(n) ? n : 0;
}

function clampInt(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}
