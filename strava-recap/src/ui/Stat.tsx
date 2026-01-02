export default function Stat(props: { label: string; value: string }) {
    return (
        <div className="border rounded-3 p-3 h-100">
            <div className="text-secondary text-uppercase small fw-semibold">{props.label}</div>
            <div className="fw-bold fs-5 mt-1">{props.value}</div>
        </div>
    );
}
