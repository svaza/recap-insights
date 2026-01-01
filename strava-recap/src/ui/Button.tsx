export default function Button(
    props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }
) {
    const variant = props.variant ?? "primary";
    const base: React.CSSProperties = {
        padding: "10px 14px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.12)",
        cursor: "pointer",
        fontWeight: 700,
    };
    const styles =
        variant === "primary"
            ? { ...base, background: "#2a7fff", color: "#07121f" }
            : { ...base, background: "transparent", color: "#e9eef5" };

    return <button {...props} style={{ ...styles, ...(props.style ?? {}) }} />;
}
