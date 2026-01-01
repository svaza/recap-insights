import { useEffect, useRef, useState } from "react";

export function ScaledFlyerPreview(props: {
    designW: number;
    designH: number;
    maxWidth?: number;
    children: React.ReactNode;
}) {
    const { designW, designH, maxWidth = 540, children } = props;
    const hostRef = useRef<HTMLDivElement | null>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const el = hostRef.current;
        if (!el) return;

        const calc = () => {
            const w = el.getBoundingClientRect().width || maxWidth;
            setScale(w / designW);
        };

        calc();
        const ro = new ResizeObserver(calc);
        ro.observe(el);
        return () => ro.disconnect();
    }, [designW, maxWidth]);

    return (
        <div
            ref={hostRef}
            style={{
                width: "100%",
                maxWidth,
                margin: "14px auto 0",
                borderRadius: 22,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.02)",
                position: "relative",
                aspectRatio: `${designW} / ${designH}`,
            }}
        >
            {/* Center horizontally to avoid “cut off on the right” issues */}
            <div
                style={{
                    position: "absolute",
                    left: "50%",
                    top: 0,
                    width: designW,
                    height: designH,
                    transform: `translateX(-50%) scale(${scale})`,
                    transformOrigin: "top center",
                }}
            >
                {children}
            </div>
        </div>
    );
}
