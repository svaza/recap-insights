export type WowItem = {
  id: string;
  emoji: string;
  title: string;
  value: string;
  subtitle?: string;
};

export default function WowItemCard(props: { item: WowItem }) {
  const { item } = props;

  return (
    <div
      style={{
        minWidth: 260,
        maxWidth: 260,
        padding: 14,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.04)",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontSize: 20, lineHeight: 1 }}>{item.emoji}</div>
        <div style={{ fontWeight: 900 }}>{item.title}</div>
      </div>

      <div style={{ marginTop: 10, fontSize: 24, fontWeight: 900, letterSpacing: -0.3 }}>
        {item.value}
      </div>

      {item.subtitle && (
        <div style={{ marginTop: 6, opacity: 0.75, fontSize: 13, lineHeight: 1.35 }}>
          {item.subtitle}
        </div>
      )}
    </div>
  );
}
