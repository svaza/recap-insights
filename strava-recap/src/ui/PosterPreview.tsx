export default function PosterPreview(props: { children: React.ReactNode }) {
    return (
        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <div
                style={{
                    width: "min(540px, 100%)",
                    aspectRatio: "4 / 5",
                    borderRadius: 32,
                    overflow: "hidden",
                }}
            >
                <div style={{ transform: "scale(0.5)", transformOrigin: "top left" }}>
                    {props.children}
                </div>
            </div>
        </div>
    );
}
