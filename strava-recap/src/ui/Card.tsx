export default function Card(props: { children: React.ReactNode; style?: React.CSSProperties }) {
    return (
        <div
            style={{
                background: "#101723",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: 16,
                boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                ...(props.style ?? {}),
            }}
        >
            {props.children}
        </div>
    );
}
