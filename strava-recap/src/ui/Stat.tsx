type StatProps = {
    label: string;
    value: string;
    subLabel?: string;
};

export default function Stat(props: StatProps) {
    return (
        <div className="recap-stat h-100">
            <div className="recap-stat__label">{props.label}</div>
            <div className="recap-stat__value">{props.value}</div>
            {props.subLabel && <div className="recap-stat__sub">{props.subLabel}</div>}
        </div>
    );
}
