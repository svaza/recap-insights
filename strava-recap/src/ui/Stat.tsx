import type { ReactNode } from "react";

type StatProps = {
    label: string;
    value: string;
    subLabel?: string;
    action?: ReactNode;
};

export default function Stat(props: StatProps) {
    return (
        <div className="recap-stat h-100">
            <div className="recap-stat__head">
                <div className="recap-stat__label">{props.label}</div>
                {props.action && <div className="recap-stat__action-wrap">{props.action}</div>}
            </div>
            <div className="recap-stat__value">{props.value}</div>
            {props.subLabel && <div className="recap-stat__sub">{props.subLabel}</div>}
        </div>
    );
}
