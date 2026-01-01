import type { WowItem } from "../WowItemCard";

export default function WowEmpire(props: { item: WowItem }) {
  const title = props.item.title || "Empire State";
  const value = props.item.value || "—";            // usually "1.4×"
  const subtitle = props.item.subtitle || "roof ~381m";

  const x = parseTimes(value);
  const tier = getEmpireTier(x);

  const line1 =
    x >= 2
      ? "That’s a lot of vertical work."
      : x >= 1
      ? "You hit Empire State roof level. Respect."
      : x >= 0.5
      ? "Nice climbing — that adds up quickly."
      : "Every bit of elevation counts. Keep building.";

  const line2 =
    x >= 2
      ? "Recover well — elevation load is sneaky."
      : x >= 1
      ? "Consistent hills = durable legs."
      : x >= 0.5
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
          "radial-gradient(900px 260px at 50% 0%, rgba(255,190,90,0.16), transparent 55%), rgba(255,255,255,0.03)",
        boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
        overflow: "hidden",
      }}
    >
      {/* animated city glow layer */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: -60,
          background:
            "conic-gradient(from 180deg at 50% 50%, rgba(255,190,90,0.12), rgba(255,255,255,0.05), rgba(42,127,255,0.08))",
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

        {/* value highlight */}
        <div
          style={{
            fontSize: "clamp(26px, 7vw, 32px)",
            fontWeight: 950,
            letterSpacing: -0.6,
            background: "linear-gradient(90deg, rgba(255,190,90,0.95), rgba(255,255,255,0.92))",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            textShadow: "0 0 18px rgba(255,190,90,0.18)",
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
          <Chip text="🏙️ skyline" />
          <Chip text={x >= 1 ? "🦵 strength" : "🌱 building"} />
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

function parseTimes(v: string) {
  // "1.3×" -> 1.3
  const n = parseFloat(String(v).replace(/[^\d.]/g, ""));
  return isFinite(n) ? n : 0;
}

function getEmpireTier(x: number) {
  if (x >= 3)
    return {
      label: "SKYSCRAPER MODE",
      emoji: "🦍",
      message: "That’s massive vertical volume.",
      bg: "rgba(255,255,255,0.10)",
      fg: "#e9eef5",
    };
  if (x >= 2)
    return {
      label: "CITY CLIMBER",
      emoji: "🏙️",
      message: "You’re built for elevation days.",
      bg: "rgba(255,190,90,0.18)",
      fg: "#e9eef5",
    };
  if (x >= 1)
    return {
      label: "ROOF LEVEL",
      emoji: "🏆",
      message: "You hit Empire State roof level. Respect.",
      bg: "rgba(255,190,90,0.14)",
      fg: "#e9eef5",
    };
  if (x >= 0.5)
    return {
      label: "CLIMBING",
      emoji: "🌱",
      message: "Nice progress. Keep adding hills.",
      bg: "rgba(255,255,255,0.08)",
      fg: "#e9eef5",
    };
  return {
    label: "STARTER",
    emoji: "✅",
    message: "Every meter/foot counts. Build up steadily.",
    bg: "rgba(255,255,255,0.06)",
    fg: "#e9eef5",
  };
}
