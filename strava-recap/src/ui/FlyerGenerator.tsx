/**
 * FlyerGenerator component
 * Renders the flyer visual with background, overlays, and stats
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { toPng } from 'html-to-image';
import type { FlyerData } from '../models/flyer';
import './FlyerGenerator.css';

type FlyerGeneratorProps = {
    data: FlyerData;
};

/** Check if Web Share API supports file sharing */
function canShareFiles(): boolean {
    if (typeof navigator === "undefined" || !navigator.share || !navigator.canShare) {
        return false;
    }
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

/**
 * Converts an image URL to a base64 data URL for reliable PNG export
 */
async function toDataURL(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

export default function FlyerGenerator({ data }: FlyerGeneratorProps) {
    const [isExporting, setIsExporting] = useState(false);
    const [backgroundDataUrl, setBackgroundDataUrl] = useState<string | null>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const flyerRef = useRef<HTMLDivElement>(null);

    // Detect file sharing support once on mount
    const supportsShare = useMemo(() => canShareFiles(), []);

    // Pre-load background image as data URL for reliable export
    useEffect(() => {
        let cancelled = false;
        setImageLoaded(false);
        toDataURL(data.groupInfo.backgroundPath)
            .then((dataUrl) => {
                if (!cancelled) {
                    setBackgroundDataUrl(dataUrl);
                }
            })
            .catch((err) => {
                console.warn('Failed to pre-load background image:', err);
            });
        return () => {
            cancelled = true;
        };
    }, [data.groupInfo.backgroundPath]);

    const getFilename = () => `${data.athleteFirstName}-${data.groupInfo.label}-flyer.png`;

    /** Generate flyer PNG as data URL */
    const generateFlyerDataUrl = useCallback(async (): Promise<string> => {
        if (!flyerRef.current) throw new Error("Flyer element not available");
        
        // Wait for the DOM to fully render with the image
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return toPng(flyerRef.current, {
            pixelRatio: 2,
            cacheBust: true,
        });
    }, []);

    /** Download flyer as file (fallback) */
    const handleDownload = useCallback(async () => {
        if (isExporting) return;
        setIsExporting(true);
        try {
            const dataUrl = await generateFlyerDataUrl();
            const link = document.createElement('a');
            link.download = getFilename();
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Failed to export flyer:', error);
        } finally {
            setIsExporting(false);
        }
    }, [generateFlyerDataUrl, isExporting]);

    /** Share flyer via Web Share API (primary on mobile) */
    const handleShare = useCallback(async () => {
        if (isExporting) return;
        setIsExporting(true);
        try {
            const dataUrl = await generateFlyerDataUrl();
            const blob = dataUrlToBlob(dataUrl);
            const file = new File([blob], getFilename(), { type: "image/png" });

            if (navigator.canShare?.({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: `${data.athleteFirstName}'s ${data.groupInfo.label} Recap`,
                });
            } else {
                await handleDownload();
            }
        } catch (err) {
            // User cancelled share (AbortError) - do nothing
            if (err instanceof Error && err.name === "AbortError") {
                return;
            }
            console.warn("Share failed, falling back to download:", err);
            await handleDownload();
        } finally {
            setIsExporting(false);
        }
    }, [data.athleteFirstName, data.groupInfo.label, generateFlyerDataUrl, handleDownload, isExporting]);

    // Detect mobile device
    const isMobile = useMemo(() => {
        if (typeof navigator === "undefined") return false;
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }, []);

    // Button display logic:
    // Mobile: Show Share if supported (no Download), else Download only
    // Desktop: Show Download always, also Share if supported
    const showShareButton = supportsShare;
    const showDownloadButton = !isMobile || !supportsShare;

    return (
        <div className="flyer-container">
            {/* Controls */}
            <div className="flyer-controls mb-4">
                <div className="d-flex flex-wrap gap-2 justify-content-center align-items-center">
                    {/* Share button - shown if supported */}
                    {showShareButton && (
                        <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={handleShare}
                            disabled={isExporting || !backgroundDataUrl || !imageLoaded}
                            style={{ whiteSpace: 'nowrap' }}
                        >
                            {isExporting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Exporting...
                                </>
                            ) : !backgroundDataUrl || !imageLoaded ? (
                                <>Loading...</>
                            ) : (
                                <>📤 Save / Share</>
                            )}
                        </button>
                    )}
                    {/* Download button - shown on desktop always, on mobile only if share not supported */}
                    {showDownloadButton && (
                        <button
                            type="button"
                            className={`btn btn-sm ${showShareButton ? 'btn-outline-secondary' : 'btn-success'}`}
                            onClick={handleDownload}
                            disabled={isExporting || !backgroundDataUrl || !imageLoaded}
                            style={{ whiteSpace: 'nowrap' }}
                        >
                            {isExporting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Exporting...
                                </>
                            ) : !backgroundDataUrl || !imageLoaded ? (
                                <>Loading...</>
                            ) : (
                                <>📥 Download</>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Flyer Preview */}
            <div className="flyer-preview-wrapper">
                <div
                    ref={flyerRef}
                    className="flyer-preview"
                >
                    {/* Background image as <img> for reliable export - use data URL when available */}
                    {backgroundDataUrl && (
                        <img
                            src={backgroundDataUrl}
                            alt=""
                            className="flyer-background-img"
                            onLoad={() => setImageLoaded(true)}
                            crossOrigin="anonymous"
                        />
                    )}

                    {/* Gradient overlay for text readability */}
                    <div className="flyer-gradient-overlay"></div>

                    {/* Content overlay */}
                    <div className="flyer-content">
                        {/* Header - stays at top */}
                        <div className="flyer-header">
                            {/* Activity badge/pill */}
                            <div className="flyer-activity-badge">
                                <span className="flyer-activity-emoji">{data.groupInfo.emoji}</span>
                                <span className="flyer-activity-label">{data.groupInfo.label}</span>
                            </div>
                            {/* Athlete name + tagline */}
                            <div className="flyer-athlete-name">{data.athleteFirstName}'s</div>
                            <div className="flyer-tagline">{data.tagline}</div>
                            <div className="flyer-date-range">{data.rangeLabel}</div>
                        </div>

                        {/* Stats section - bottom aligned */}
                        <div className="flyer-stats-section">
                            {/* Best Effort highlight - at top of stats section */}
                            {data.bestEffort && (
                                <div className="flyer-best-effort">
                                    <div className="flyer-best-effort-badge">
                                        <span className="flyer-best-effort-icon">{data.bestEffort.type === 'longest' ? '🚀' : '🏆'}</span>
                                        <span className="flyer-best-effort-label">{data.bestEffort.label}</span>
                                    </div>
                                    <div className="flyer-best-effort-name">{data.bestEffort.name}</div>
                                    <div className="flyer-best-effort-value">{data.bestEffort.formattedDistance} · {data.bestEffort.formattedTime}</div>
                                </div>
                            )}

                            {/* Stats as badges */}
                            <div className="flyer-badges">
                                {data.stats.map((stat) => (
                                    <div key={stat.id} className="flyer-badge">
                                        <span className="flyer-badge-icon">{stat.emoji}</span>
                                        <span className="flyer-badge-value">{stat.formattedValue}</span>
                                        <span className="flyer-badge-label">{stat.label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Activity badges (Active Days & Streak) */}
                            <div className="flyer-badges">
                                {data.activeDaysCount > 0 && (
                                    <div className="flyer-badge">
                                        <span className="flyer-badge-icon">📆</span>
                                        <span className="flyer-badge-value">{data.activeDaysCount}</span>
                                        <span className="flyer-badge-label">Active Days</span>
                                    </div>
                                )}
                                {data.longestStreak > 1 && (
                                    <div className="flyer-badge">
                                        <span className="flyer-badge-icon">🔥</span>
                                        <span className="flyer-badge-value">{data.longestStreak}</span>
                                        <span className="flyer-badge-label">Day Streak</span>
                                    </div>
                                )}
                            </div>

                            {/* Footer branding */}
                            <div className="flyer-footer">
                                <span className="flyer-brand">generated using recapinsights.link</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Export info */}
            <p className="text-secondary small text-center mt-3">
                Preview shown at reduced size. Download exports at 1080×1920px.
            </p>
        </div>
    );
}
