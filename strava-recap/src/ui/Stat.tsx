export default function Stat(props: { label: string; value: string }) {
    return (
        <div
            style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                padding: 12,
            }}
        >
            <div style={{ fontSize: 12, opacity: 0.7 }}>{props.label}</div>
            <div style={{ fontSize: 18, fontWeight: 900, marginTop: 4 }}>{props.value}</div>
        </div>
    );
}
