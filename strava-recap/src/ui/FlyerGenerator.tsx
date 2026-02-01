/**
 * FlyerGenerator component
 * Renders the flyer visual with background, overlays, and stats
 */

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { toBlob, toSvg } from "html-to-image";
import type { FlyerData } from "../models/flyer";
import "./FlyerGenerator.css";

type FlyerGeneratorProps = {
  data: FlyerData;
};

/** Check if Web Share API supports file sharing */
function canShareFiles(): boolean {
  if (typeof navigator === "undefined" || !navigator.share || !navigator.canShare) return false;
  try {
    const testFile = new File(["test"], "test.png", { type: "image/png" });
    return navigator.canShare({ files: [testFile] });
  } catch {
    return false;
  }
}

function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOS = /iP(ad|hone|od)/.test(ua);
  const isSafari = /Safari/i.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS/i.test(ua);
  return isIOS && isSafari;
}

/** Convert image URL to base64 data URL for reliable export */
async function toDataURL(url: string): Promise<string> {
  if (!url) throw new Error("Missing background url");
  if (url.startsWith("data:")) return url;

  const response = await fetch(url, { cache: "force-cache" });
  if (!response.ok) throw new Error(`Failed to fetch background: ${response.status}`);
  const blob = await response.blob();

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function nextPaint(): Promise<void> {
  await new Promise<void>((r) => requestAnimationFrame(() => r()));
  await new Promise<void>((r) => requestAnimationFrame(() => r()));
}

async function waitForImages(node: HTMLElement): Promise<void> {
  const imgs = Array.from(node.querySelectorAll("img"));

  // Wait for load
  await Promise.all(
    imgs.map(
      (img) =>
        img.complete && img.naturalWidth > 0
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              const done = () => resolve();
              img.addEventListener("load", done, { once: true });
              img.addEventListener("error", done, { once: true });
            })
    )
  );

  // Decode (helps iOS)
  await Promise.all(
    imgs.map((img) => {
      const anyImg = img as any;
      if (typeof anyImg.decode === "function") {
        return anyImg.decode().catch(() => {});
      }
      return Promise.resolve();
    })
  );
}

async function svgDataUrlToSvgText(svgDataUrl: string): Promise<string> {
  const commaIdx = svgDataUrl.indexOf(",");
  const encoded = commaIdx >= 0 ? svgDataUrl.slice(commaIdx + 1) : svgDataUrl;
  try {
    return decodeURIComponent(encoded);
  } catch {
    return encoded;
  }
}

/**
 * iOS Safari fallback:
 * toSvg(node) -> Blob URL -> Image -> Canvas -> PNG Blob
 */
async function toPngBlobViaSvgBlobUrl(
  node: HTMLElement,
  options: Parameters<typeof toSvg>[1],
  width: number,
  height: number
): Promise<Blob> {
  const svgDataUrl = await toSvg(node, options);
  const svgText = await svgDataUrlToSvgText(svgDataUrl);

  const svgBlob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
  const svgBlobUrl = URL.createObjectURL(svgBlob);

  try {
    const img = new Image();
    img.src = svgBlobUrl;

    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
    });

    const anyImg = img as any;
    if (typeof anyImg.decode === "function") {
      await anyImg.decode().catch(() => {});
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context not available");

    ctx.drawImage(img, 0, 0, width, height);

    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("canvas.toBlob failed"))), "image/png");
    });

    return pngBlob;
  } finally {
    URL.revokeObjectURL(svgBlobUrl);
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function FlyerGenerator({ data }: FlyerGeneratorProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [backgroundDataUrl, setBackgroundDataUrl] = useState<string | null>(null);

  const [previewBgReady, setPreviewBgReady] = useState(false);
  const [exportBgReady, setExportBgReady] = useState(false);

  const exportRef = useRef<HTMLDivElement>(null);

  const supportsShare = useMemo(() => canShareFiles(), []);
  const iosSafari = useMemo(() => isIosSafari(), []);

  const isMobile = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    const uaData = (navigator as any).userAgentData;
    if (uaData?.mobile != null) return Boolean(uaData.mobile);
    return /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }, []);

  useEffect(() => {
    let cancelled = false;

    setBackgroundDataUrl(null);
    setPreviewBgReady(false);
    setExportBgReady(false);

    toDataURL(data.groupInfo.backgroundPath)
      .then((dataUrl) => {
        if (!cancelled) setBackgroundDataUrl(dataUrl);
      })
      .catch((err) => console.warn("Failed to pre-load background image:", err));

    return () => {
      cancelled = true;
    };
  }, [data.groupInfo.backgroundPath]);

  const getFilename = () => `${data.athleteFirstName}-${data.groupInfo.label}-flyer.png`;

  const EXPORT_W = 1080;
  const EXPORT_H = 1920;

  const generateFlyerBlob = useCallback(async (): Promise<Blob> => {
    if (!exportRef.current) throw new Error("Export element not available");

    // Ensure fonts ready (prevents layout drift)
    await (document as any).fonts?.ready?.catch?.(() => {});

    // Ensure images loaded & decoded
    await waitForImages(exportRef.current);

    // iOS needs a bit more "settle"
    if (iosSafari) {
      await new Promise((r) => setTimeout(r, 150));
    }

    await nextPaint();

    const node = exportRef.current;

    const options = {
      cacheBust: true,
      pixelRatio: 1, // we already force 1080×1920, don’t overscale memory on mobile
      width: EXPORT_W,
      height: EXPORT_H,
      canvasWidth: EXPORT_W,
      canvasHeight: EXPORT_H,
      style: {
        width: `${EXPORT_W}px`,
        height: `${EXPORT_H}px`,
        transform: "none",
      },
      backgroundColor: "#1a1a2e",
    } as const;

    const doCapture = async () => {
      if (iosSafari) return await toPngBlobViaSvgBlobUrl(node, options, EXPORT_W, EXPORT_H);
      const b = await toBlob(node, options);
      if (!b) throw new Error("toBlob returned null");
      return b;
    };

    // Retry once on iOS Safari because first attempt often misses background
    // (your observed behavior: second time works)
    try {
      const first = await doCapture();
      // If it’s suspiciously tiny, retry. (Missing background often shrinks output.)
      if (iosSafari && first.size < 40_000) {
        await new Promise((r) => setTimeout(r, 200));
        await nextPaint();
        return await doCapture();
      }
      return first;
    } catch {
      if (iosSafari) {
        await new Promise((r) => setTimeout(r, 250));
        await nextPaint();
        return await doCapture();
      }
      throw new Error("Capture failed");
    }
  }, [iosSafari]);

  const handleDownload = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const blob = await generateFlyerBlob();
      downloadBlob(blob, getFilename());
    } catch (err) {
      console.error("Failed to export flyer:", err);
    } finally {
      setIsExporting(false);
    }
  }, [generateFlyerBlob, isExporting]);

  const handleShare = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const blob = await generateFlyerBlob();
      const file = new File([blob], getFilename(), { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${data.athleteFirstName}'s ${data.groupInfo.label} Recap`,
        });
      } else {
        downloadBlob(blob, getFilename());
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      console.warn("Share failed, falling back to download:", err);
      try {
        const blob = await generateFlyerBlob();
        downloadBlob(blob, getFilename());
      } catch (e) {
        console.error("Fallback download failed:", e);
      }
    } finally {
      setIsExporting(false);
    }
  }, [data.athleteFirstName, data.groupInfo.label, generateFlyerBlob, isExporting]);

  const showShareButton = supportsShare;
  const showDownloadButton = !isMobile || !supportsShare;

  const canExport = !!backgroundDataUrl && previewBgReady && exportBgReady && !isExporting;

  const heroStats = useMemo(() => {
    const heroOrder = ["totalDistanceMeters", "totalMovingTimeSeconds"];
    const byId = new Map(data.stats.map((stat) => [stat.id, stat]));
    const ordered = heroOrder.map((id) => byId.get(id)).filter(Boolean) as typeof data.stats;
    if (ordered.length > 0) return ordered;
    return data.stats.slice(0, 1);
  }, [data.stats]);

  const supportStats = useMemo(() => {
    const heroIds = new Set(["totalDistanceMeters", "totalMovingTimeSeconds"]);
    return data.stats.filter((stat) => !heroIds.has(stat.id));
  }, [data.stats]);

  const FlyerVisual = ({ onBgReady }: { onBgReady: () => void }) => (
    <div className="flyer-preview">
      {backgroundDataUrl && (
        <img
          src={backgroundDataUrl}
          alt=""
          className="flyer-background-img"
          onLoad={onBgReady}
        />
      )}

      <div className="flyer-gradient-overlay"></div>

      <div className="flyer-content">
        <div className="flyer-header">
          <div className="flyer-activity-badge">
            <span className="flyer-activity-emoji">{data.groupInfo.emoji}</span>
            <span className="flyer-activity-label">{data.groupInfo.label}</span>
          </div>

          <div className="flyer-athlete-name">{data.athleteFirstName}'s</div>
          <div className="flyer-tagline">{data.tagline}</div>
          <div className="flyer-date-range">{data.rangeLabel}</div>
        </div>

        <div className="flyer-stats-section">
          <div className="flyer-hero">
            {heroStats.map((stat) => (
              <div key={stat.id} className="flyer-hero-card">
                <div className="flyer-hero-icon">{stat.emoji}</div>
                <div className="flyer-hero-value">{stat.formattedValue}</div>
                <div className="flyer-hero-label">{stat.label}</div>
              </div>
            ))}
          </div>

          {data.bestEffort && (
            <div className="flyer-best-effort">
              <div className="flyer-best-effort-badge">
                <span className="flyer-best-effort-icon">
                  {data.bestEffort.type === "longest" ? "🚀" : "🏆"}
                </span>
                <span className="flyer-best-effort-label">{data.bestEffort.label}</span>
              </div>
              <div className="flyer-best-effort-name">{data.bestEffort.name}</div>
              <div className="flyer-best-effort-value">
                {data.bestEffort.formattedDistance} · {data.bestEffort.formattedTime}
              </div>
            </div>
          )}

          {supportStats.length > 0 && (
            <div className="flyer-support">
              {supportStats.map((stat) => (
                <div key={stat.id} className="flyer-support-pill">
                  <span className="flyer-support-emoji">{stat.emoji}</span>
                  <span className="flyer-support-value">{stat.formattedValue}</span>
                  <span className="flyer-support-label">{stat.label}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flyer-consistency">
            {data.activeDaysCount > 0 && (
              <div className="flyer-support-pill">
                <span className="flyer-support-emoji">📆</span>
                <span className="flyer-support-value">{data.activeDaysCount}</span>
                <span className="flyer-support-label">Active Days</span>
              </div>
            )}
            {data.longestStreak > 1 && (
              <div className="flyer-support-pill">
                <span className="flyer-support-emoji">🔥</span>
                <span className="flyer-support-value">{data.longestStreak}</span>
                <span className="flyer-support-label">Day Streak</span>
              </div>
            )}
          </div>

          <div className="flyer-footer">
            <span className="flyer-brand">generated using recapinsights.link</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flyer-container">
      {/* Controls */}
      <div className="flyer-controls mb-4">
        <div className="d-flex flex-wrap gap-2 justify-content-center align-items-center">
          {showShareButton && (
            <button
              type="button"
              className="btn btn-success btn-sm"
              onClick={handleShare}
              disabled={!canExport}
              style={{ whiteSpace: "nowrap" }}
            >
              {isExporting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Exporting...
                </>
              ) : !backgroundDataUrl || !previewBgReady || !exportBgReady ? (
                <>Loading...</>
              ) : (
                <>📤 Save / Share</>
              )}
            </button>
          )}

          {showDownloadButton && (
            <button
              type="button"
              className={`btn btn-sm ${showShareButton ? "btn-outline-secondary" : "btn-success"}`}
              onClick={handleDownload}
              disabled={!canExport}
              style={{ whiteSpace: "nowrap" }}
            >
              {isExporting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Exporting...
                </>
              ) : !backgroundDataUrl || !previewBgReady || !exportBgReady ? (
                <>Loading...</>
              ) : (
                <>📥 Download</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="flyer-preview-wrapper w-100 mw-md-400">
        <div className="flyer-preview-host">
          <FlyerVisual onBgReady={() => setPreviewBgReady(true)} />
        </div>
      </div>

      {/* Export node at fixed 1080×1920 (keep near viewport; do NOT display:none) */}
      <div className="flyer-export-host" aria-hidden="true">
        <div ref={exportRef} className="flyer-export">
          <FlyerVisual onBgReady={() => setExportBgReady(true)} />
        </div>
      </div>

      <p className="text-secondary small text-center mt-3">
        Preview shown at reduced size. Download exports at 1080×1920px.
      </p>
    </div>
  );
}
