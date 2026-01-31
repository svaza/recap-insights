import { useRef, useState, useEffect, useMemo } from "react";
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

/** Check if Web Share API supports file sharing */
function canShareFiles(): boolean {
    if (typeof navigator === "undefined" || !navigator.share || !navigator.canShare) {
        return false;
    }
    // Create a test file to check canShare support
    try {
        const testFile = new File(["test"], "test.png", { type: "image/png" });
        return navigator.canShare({ files: [testFile] });
    } catch {
        return false;
    }
}

/** Convert data URL to Blob */
function dataUrlToBlob(dataUrl: string): Blob {
    const [header, base64] = dataUrl.split(",");
    const mime = header.match(/:(.*?);/)?.[1] ?? "image/png";
    const binary = atob(base64);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
    }
    return new Blob([array], { type: mime });
}

export function FlyerCard(props: FlyerCardProps) {
    const flyerRef = useRef<HTMLDivElement | null>(null);
    const [flyerExporting, setFlyerExporting] = useState(false);
    const flyerPreviewRef = useRef<HTMLDivElement | null>(null);

    // Detect file sharing support once on mount
    const supportsShare = useMemo(() => canShareFiles(), []);

    useEffect(() => {
        const el = flyerPreviewRef.current;
        if (!el) return;

        const ro = new ResizeObserver(() => {
            // Preview scales responsively via CSS
        });
        ro.observe(el);

        return () => ro.disconnect();
    }, []);

    /** Generate flyer PNG as data URL */
    const generateFlyerDataUrl = async (): Promise<string> => {
        if (!flyerRef.current) throw new Error("Flyer element not available");
        return toPng(flyerRef.current, {
            cacheBust: true,
            pixelRatio: 2,
            backgroundColor: "#0b0f14",
        });
    };

    /** Download flyer as file (fallback) */
    const downloadFlyer = async () => {
        try {
            setFlyerExporting(true);
            const dataUrl = await generateFlyerDataUrl();
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = `recap-flyer-${props.units}.png`;
            a.click();
        } finally {
            setFlyerExporting(false);
        }
    };

    /** Share flyer via Web Share API (primary on mobile) */
    const shareFlyer = async () => {
        try {
            setFlyerExporting(true);
            const dataUrl = await generateFlyerDataUrl();
            const blob = dataUrlToBlob(dataUrl);
            const file = new File([blob], `recap-flyer-${props.units}.png`, { type: "image/png" });

            // Double-check canShare before calling share
            if (navigator.canShare?.({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: "My Activity Recap",
                });
            } else {
                // Fallback to download if share not supported
                await downloadFlyer();
            }
        } catch (err) {
            // User cancelled share (AbortError) - do nothing
            if (err instanceof Error && err.name === "AbortError") {
                return;
            }
            // Other errors - fallback to download
            console.warn("Share failed, falling back to download:", err);
            await downloadFlyer();
        } finally {
            setFlyerExporting(false);
        }
    };

    if (!props.activities || !props.totals) return null;

    // Primary action: Share on mobile (when supported), Download otherwise
    const primaryAction = supportsShare ? shareFlyer : downloadFlyer;
    const primaryLabel = supportsShare
        ? (flyerExporting ? "Exporting…" : "Save / Share")
        : (flyerExporting ? "Exporting…" : "Download flyer");

    return (
        <>
            {/* Flyer card (separate – cleaner UI + no export interference) */}
            <Card style={{ width: "100%", maxWidth: 900 }}>
                <div style={{ fontSize: "clamp(12px, 3vw, 14px)", fontWeight: 900, opacity: 0.85, letterSpacing: 0.8 }}>
                    Flyer (share)
                </div>

                <div className="flyerHeaderRow">
                    <div className="flyerText">
                        {supportsShare
                            ? "Share directly or save to your photos"
                            : "Download a clean poster for social sharing"}
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        <Button
                            variant="ghost"
                            onClick={primaryAction}
                            disabled={flyerExporting}
                            style={{ whiteSpace: "nowrap" }}
                        >
                            {primaryLabel}
                        </Button>
                        {/* Show download as secondary when share is primary */}
                        {supportsShare && (
                            <Button
                                variant="ghost"
                                onClick={downloadFlyer}
                                disabled={flyerExporting}
                                style={{ whiteSpace: "nowrap", opacity: 0.7 }}
                            >
                                Download
                            </Button>
                        )}
                    </div>
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
