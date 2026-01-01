export default function PageShell(props: {
    title: string;
    children: React.ReactNode;
    right?: React.ReactNode;
}) {
    return (
        <div
            style={{
                minHeight: "100vh",
                width: "100%",
                background: "#0b0f14",
                color: "#e9eef5",
                display: "flex",
                justifyContent: "center",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: 1240,
                    padding: "24px 16px",
                    margin: "0 auto",
                    boxSizing: "border-box",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div>
                        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>{props.title}</div>
                    </div>
                    {props.right}
                </div>

                <div style={{ marginTop: 20 }}>{props.children}</div>
            </div>
        </div>
    );
}
