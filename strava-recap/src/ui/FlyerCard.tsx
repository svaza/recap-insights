import { useRef, useState, useEffect } from "react";
import { toPng } from "html-to-image";
import Card from "./Card";
import Button from "./Button";
import RecapFlyerPanel from "./RecapFlyerPanel";
import { ScaledFlyerPreview } from "./ScaledFlyerPreview";

type Badge = { emoji: string; label: string; value: string };

interface FlyerCardProps {
    activities: any[] | null;
    totals: {
        activities: number;
        distanceM: number;
        movingTimeSec: number;
        elevationM: number;
    } | null;
    athleteName: string | null;
    longestValue: string;
    longestSubtitle: string;
    farthestValue: string;
    farthestSubtitle: string;
    streakValue: string;
    streakSubtitle: string;
    flyerBadges: Badge[];
    flyerSubtitle: string;
    formattedTime: string;
    units: "km" | "mi";
    formatDistance: (meters: number, digits?: number) => string;
    formatElevation: (meters: number) => string;
}

const FLYER_W = 1080;
const FLYER_H = 1350;

export function FlyerCard(props: FlyerCardProps) {
    const flyerRef = useRef<HTMLDivElement | null>(null);
    const [flyerExporting, setFlyerExporting] = useState(false);
    const flyerPreviewRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const el = flyerPreviewRef.current;
        if (!el) return;

        const ro = new ResizeObserver(() => {
            // Preview scales responsively via CSS
        });
        ro.observe(el);

        return () => ro.disconnect();
    }, []);

    const downloadFlyer = async () => {
        if (!flyerRef.current) return;
        try {
            setFlyerExporting(true);
            const dataUrl = await toPng(flyerRef.current, {
                cacheBust: true,
                pixelRatio: 2,
                backgroundColor: "#0b0f14",
            });
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = `recap-flyer-${props.units}.png`;
            a.click();
        } finally {
            setFlyerExporting(false);
        }
    };

    if (!props.activities || !props.totals) return null;

    return (
        <>
            {/* Flyer card (separate – cleaner UI + no export interference) */}
            <Card style={{ width: "100%", maxWidth: 900 }}>
                <div style={{ fontSize: "clamp(12px, 3vw, 14px)", fontWeight: 900, opacity: 0.85, letterSpacing: 0.8 }}>
                    Flyer (share)
                </div>

                <div className="flyerHeaderRow">
                    <div className="flyerText">Download a clean poster for social sharing</div>

                    <Button
                        variant="ghost"
                        onClick={downloadFlyer}
                        disabled={flyerExporting}
                        style={{ whiteSpace: "nowrap" }}
                    >
                        {flyerExporting ? "Exporting…" : "Download flyer"}
                    </Button>
                </div>

                <div className="flyerPreview" ref={flyerPreviewRef}>
                    <ScaledFlyerPreview designW={1080} designH={1350} maxWidth={540}>
                        <RecapFlyerPanel
                            title={`${props.athleteName ? `${props.athleteName}'s` : "My"} Recap`}
                            subtitle={props.flyerSubtitle}
                            totals={{
                                activities: props.totals.activities,
                                distance: props.formatDistance(props.totals.distanceM, 1),
                                time: props.formattedTime,
                                elevation: props.formatElevation(props.totals.elevationM),
                            }}
                            highlights={[
                                { title: "Longest activity", emoji: "⏱️", value: props.longestValue, subtitle: props.longestSubtitle },
                                { title: "Farthest distance", emoji: "🏆", value: props.farthestValue, subtitle: props.farthestSubtitle },
                                { title: "Best streak", emoji: "🔥", value: props.streakValue, subtitle: props.streakSubtitle },
                            ]}
                            badges={props.flyerBadges}
                            footerLeft="Powered by Recap"
                            footerRight={`Generated • ${new Date().toLocaleDateString()}`}
                        />
                    </ScaledFlyerPreview>
                </div>
            </Card>

            {/* Hidden full-size instance ONLY for flyer export (moved OUTSIDE shareRef) */}
            <div style={{ position: "fixed", left: -10000, top: 0, width: FLYER_W, height: FLYER_H }}>
                <RecapFlyerPanel
                    ref={flyerRef}
                    title={`${props.athleteName ? `${props.athleteName}'s` : "My"} Recap`}
                    subtitle={props.flyerSubtitle}
                    totals={{
                        activities: props.totals.activities,
                        distance: props.formatDistance(props.totals.distanceM, 1),
                        time: props.formattedTime,
                        elevation: props.formatElevation(props.totals.elevationM),
                    }}
                    highlights={[
                        { title: "Longest activity", emoji: "⏱️", value: props.longestValue, subtitle: props.longestSubtitle },
                        { title: "Farthest distance", emoji: "🏆", value: props.farthestValue, subtitle: props.farthestSubtitle },
                        { title: "Best streak", emoji: "🔥", value: props.streakValue, subtitle: props.streakSubtitle },
                    ]}
                    badges={props.flyerBadges}
                    footerLeft="Powered by Recap"
                    footerRight={`Generated • ${new Date().toLocaleDateString()}`}
                />
            </div>
        </>
    );
}
