import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toPng } from "html-to-image";

import type { ActivityItem } from "../models/models";
import { parseRecapQuery } from "../utils/recapQuery";
import { formatRangeLabel, num, secondsToHms } from "../utils/format";

import PageShell from "../ui/PageShell";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Stat from "../ui/Stat";

import WowCarousel from "../ui/WowCarousel";
import type { WowItem } from "../ui/WowItemCard";
import { possessive } from "../utils/helper";
import { FlyerCard } from "../ui/FlyerCard";
import { StravaConnectButton } from "../ui/StravaConnectButton";


type RecapApiResponseFlat =
    | { connected: false }
    | { connected: true; athleteName?: string; range: { startUtc: string; endUtc: string }; activities: ActivityItem[] }
    | { connected: true; error: string };


type ComputedTotals = {
    activities: number;
    distanceM: number;
    movingTimeSec: number;
    elevationM: number;
};

type UnitSystem = "km" | "mi";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Wow constants
const EIFFEL_TOWER_M = 324;
const FLOOR_M = 3;
const FOOTBALL_FIELD_M = 109.728;
const MARATHON_M = 42195;
const TRACK_LAP_M = 400;

const EARTH_CIRCUMFERENCE_KM = 40075;
const MOON_DISTANCE_KM = 384400;

const BURJ_KHALIFA_M = 828;
const EMPIRE_STATE_ROOF_M = 381;
const EVEREST_BASE_CAMP_SOUTH_M = 5364;

function computeTotals(activities: ActivityItem[]): ComputedTotals {
    return activities.reduce(
        (acc, a) => {
            acc.activities += 1;
            acc.distanceM += a.distanceM ?? 0;
            acc.movingTimeSec += a.movingTimeSec ?? 0;
            acc.elevationM += a.elevationM ?? 0;
            return acc;
        },
        { activities: 0, distanceM: 0, movingTimeSec: 0, elevationM: 0 }
    );
}

function metersToKm(m: number) {
    return m / 1000;
}

function metersToMiles(m: number) {
    return m / 1609.344;
}

function metersToFeet(m: number) {
    return m * 3.28084;
}

function groupByType(activities: ActivityItem[]) {
    const map = new Map<string, { count: number; distanceM: number; timeSec: number; elevationM: number }>();
    for (const a of activities) {
        const key = a.type || "Other";
        const prev = map.get(key) ?? { count: 0, distanceM: 0, timeSec: 0, elevationM: 0 };
        prev.count += 1;
        prev.distanceM += a.distanceM ?? 0;
        prev.timeSec += a.movingTimeSec ?? 0;
        prev.elevationM += a.elevationM ?? 0;
        map.set(key, prev);
    }
    return Array.from(map.entries()).sort(([, a], [, b]) => b.distanceM - a.distanceM);
}

function getHeaderTitle(q: ReturnType<typeof parseRecapQuery>) {
    if (!q) return "Your Recap Insights";
    if (q.type === "rolling") return `Last ${q.days} days`;
    if (q.unit === "month") return "This month";
    if (q.unit === "year" && q.offset === -1) return "Last year";
    return "This year";
}

function plural(n: number, one: string, many?: string) {
    const m = many ?? `${one}s`;
    return n === 1 ? `${n} ${one}` : `${n} ${m}`;
}

function activityEmoji(typeRaw: string) {
    const t = (typeRaw || "Other").toLowerCase();
    if (t.includes("run")) return "🏃‍♂️";
    if (t.includes("ride") || t.includes("bike") || t.includes("cycling")) return "🚴‍♂️";
    if (t.includes("walk")) return "🚶‍♂️";
    if (t.includes("hike")) return "🥾";
    if (t.includes("swim")) return "🏊‍♂️";
    if (t.includes("workout") || t.includes("strength") || t.includes("weight") || t.includes("hiit")) return "🏋️‍♂️";
    if (t.includes("yoga") || t.includes("pilates")) return "🧘‍♂️";
    if (t.includes("row")) return "🚣‍♂️";
    if (t.includes("ski")) return "⛷️";
    if (t.includes("snowboard")) return "🏂";
    return "✨";
}

function isDistanceType(typeRaw: string) {
    const t = (typeRaw || "").toLowerCase();
    return (
        t.includes("run") ||
        t.includes("ride") ||
        t.includes("walk") ||
        t.includes("hike") ||
        t.includes("swim") ||
        t.includes("row") ||
        t.includes("ski") ||
        t.includes("snowboard")
    );
}

function isTimeOnlyType(typeRaw: string) {
    const t = (typeRaw || "").toLowerCase();
    return (
        t.includes("workout") ||
        t.includes("strength") ||
        t.includes("weight") ||
        t.includes("hiit") ||
        t.includes("yoga") ||
        t.includes("pilates")
    );
}

function shouldShowElevation(typeRaw: string, elevationM: number) {
    const t = (typeRaw || "").toLowerCase();
    const meaningful = elevationM >= 50;
    return meaningful && (t.includes("hike") || t.includes("trail") || t.includes("run") || t.includes("ride"));
}

function UnitToggle(props: { value: UnitSystem; onChange: (v: UnitSystem) => void }) {
    const pill: CSSProperties = {
        display: "inline-flex",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 999,
        padding: 4,
        gap: 4,
    };

    const btn = (active: boolean): CSSProperties => ({
        border: "none",
        borderRadius: 999,
        padding: "6px 10px",
        cursor: "pointer",
        fontWeight: 800,
        background: active ? "rgba(42,127,255,0.75)" : "transparent",
        color: active ? "#07121f" : "#e9eef5",
    });

    return (
        <div style={pill} aria-label="Units">
            <button style={btn(props.value === "km")} onClick={() => props.onChange("km")}>
                km
            </button>
            <button style={btn(props.value === "mi")} onClick={() => props.onChange("mi")}>
                mi
            </button>
        </div>
    );
}

function dayKeyLocal(isoUtc: string) {
    const d = new Date(isoUtc);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function computeLongestStreak(activeDayKeys: string[]) {
    if (activeDayKeys.length === 0) return 0;

    const dates = activeDayKeys
        .map((k) => new Date(`${k}T00:00:00`))
        .sort((a, b) => a.getTime() - b.getTime());

    let best = 1;
    let cur = 1;

    for (let i = 1; i < dates.length; i++) {
        const diffDays = Math.round((dates[i].getTime() - dates[i - 1].getTime()) / MS_PER_DAY);
        if (diffDays === 1) {
            cur += 1;
            best = Math.max(best, cur);
        } else if (diffDays > 1) {
            cur = 1;
        }
    }

    return best;
}

function fmtX(x: number) {
    if (!isFinite(x)) return "0×";
    if (x < 10) return `${num(x, 1)}×`;
    return `${Math.round(x)}×`;
}

function slugify(s: string) {
    return (s || "recap")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export default function RecapPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const query = useMemo(() => parseRecapQuery(searchParams), [searchParams]);

    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [activities, setActivities] = useState<ActivityItem[] | null>(null);
    const [range, setRange] = useState<{ startUtc: string; endUtc: string } | null>(null);

    const [athleteName, setAthleteName] = useState<string | null>(null);

    const [units, setUnits] = useState<UnitSystem>(() => {
        const v = localStorage.getItem("recap.units");
        return v === "mi" ? "mi" : "km";
    });

    useEffect(() => {
        localStorage.setItem("recap.units", units);
    }, [units]);

    // --- Export refs ---
    const shareRef = useRef<HTMLDivElement | null>(null);
    const [exporting, setExporting] = useState(false);
    const hasRecapRun = useRef(false);

    useEffect(() => {
        if (hasRecapRun.current) return;
        hasRecapRun.current = true;

        if (!query) {
            navigate("/select", { replace: true });
            return;
        }

        const run = async () => {
            setLoading(true);
            setError(null);
            setActivities(null);
            setRange(null);

            try {
                const apiUrl = `/api/recap?${searchParams.toString()}`;
                const res = await fetch(apiUrl);
                const data = (await res.json()) as RecapApiResponseFlat;

                if ("connected" in data && data.connected === false) {
                    setConnected(false);
                    return;
                }

                if ("error" in data) {
                    setConnected(true);
                    setError(data.error);
                    return;
                }

                setConnected(true);
                setRange(data.range);
                setActivities(data.activities ?? []);
                setAthleteName((data as any).athleteName ?? null);
            } catch (e) {
                setError(String(e));
            } finally {
                setLoading(false);
                hasRecapRun.current = false;
            }
        };

        run();
    }, [query, navigate, searchParams]);

    const connectStrava = () => {
        const returnTo = location.pathname + location.search;
        window.location.href = `/api/provider/connect?returnTo=${encodeURIComponent(returnTo)}`;
    };

    const downloadShareImage = async () => {
        if (!shareRef.current) return;

        try {
            setExporting(true);

            const file = `recap-${slugify(formatRangeLabel(query!))}-${units}.png`;

            const dataUrl = await toPng(shareRef.current, {
                cacheBust: true,
                pixelRatio: 2,
                backgroundColor: "#0b0f14",
            });

            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = file;
            a.click();
        } finally {
            setExporting(false);
        }
    };


    if (!query) return null;

    const headerTitle = getHeaderTitle(query);
    const rangeLabel = formatRangeLabel(query);

    const totals = activities ? computeTotals(activities) : null;
    const byType = activities ? groupByType(activities) : [];

    const formatters = useMemo(() => {
        const formatDistance = (meters: number, digits = 1) => {
            const v = units === "mi" ? metersToMiles(meters) : metersToKm(meters);
            const suffix = units === "mi" ? "mi" : "km";
            return `${num(v, digits)} ${suffix}`;
        };

        const formatElevation = (meters: number) => {
            if (units === "mi") return `${Math.round(metersToFeet(meters))} ft`;
            return `${Math.round(meters)} m`;
        };

        return { formatDistance, formatElevation };
    }, [units]);

    const formatBreakdownLine = (
        type: string,
        info: { count: number; distanceM: number; timeSec: number; elevationM: number }
    ) => {
        if (isDistanceType(type) && info.distanceM > 0) {
            const parts: string[] = [
                `${plural(info.count, "activity")}`,
                `${formatters.formatDistance(info.distanceM, 1)}`,
                `${secondsToHms(info.timeSec)}`,
            ];
            if (shouldShowElevation(type, info.elevationM)) parts.push(formatters.formatElevation(info.elevationM));
            return parts.join(" • ");
        }

        if (isTimeOnlyType(type)) {
            return `${plural(info.count, "session")} • ${secondsToHms(info.timeSec)}`;
        }

        if (info.distanceM > 0) return `${info.count} • ${formatters.formatDistance(info.distanceM, 1)}`;
        return `${info.count} • ${secondsToHms(info.timeSec)}`;
    };

    const wowItems: WowItem[] = useMemo(() => {
        if (!activities || !totals || !range) return [];

        const items: WowItem[] = [];

        const longestByDuration =
            activities.length > 0 ? [...activities].sort((a, b) => (b.movingTimeSec ?? 0) - (a.movingTimeSec ?? 0))[0] : null;

        const farthestByDistance =
            activities.length > 0 ? [...activities].sort((a, b) => (b.distanceM ?? 0) - (a.distanceM ?? 0))[0] : null;

        const start = new Date(range.startUtc);
        const end = new Date(range.endUtc);
        const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / MS_PER_DAY));

        const activeDaySet = new Set<string>();
        for (const a of activities) activeDaySet.add(dayKeyLocal(a.startDateUtc));
        const activeDays = activeDaySet.size;

        if (activeDays > 0) {
            const pct = Math.round((activeDays / totalDays) * 100);
            items.push({
                id: "active-days",
                emoji: "📆",
                title: "Active days",
                value: `${activeDays}/${totalDays}`,
                subtitle: `${pct}% consistency`,
            });
        }

        if (longestByDuration && (longestByDuration.movingTimeSec ?? 0) > 0) {
            items.push({
                id: "biggest-effort",
                emoji: "🚀",
                title: "Biggest effort",
                value: secondsToHms(longestByDuration.movingTimeSec),
                subtitle: `${activityEmoji(longestByDuration.type)} ${longestByDuration.name}`,
            });
        }

        if (farthestByDistance && (farthestByDistance.distanceM ?? 0) > 0) {
            items.push({
                id: "farthest",
                emoji: "🏆",
                title: "Farthest session",
                value: formatters.formatDistance(farthestByDistance.distanceM, 2),
                subtitle: `${activityEmoji(farthestByDistance.type)} ${farthestByDistance.name}`,
            });
        }

        const longestStreak = computeLongestStreak(Array.from(activeDaySet));
        if (longestStreak > 1) {
            items.push({
                id: "streak",
                emoji: "🔥",
                title: "Longest streak",
                value: `${longestStreak} days`,
                subtitle: `keep it rolling`,
            });
        }

        const elevationM = totals.elevationM;
        const distanceM = totals.distanceM;

        const eiffel = elevationM / EIFFEL_TOWER_M;
        if (eiffel > 1) {
            items.push({
                id: "eiffel",
                emoji: "🗼",
                title: "Eiffel Towers",
                value: fmtX(eiffel),
                subtitle: `from ${formatters.formatElevation(elevationM)} gain`,
            });
        }

        const floors = elevationM / FLOOR_M;
        if (floors > 1) {
            items.push({
                id: "floors",
                emoji: "🧱",
                title: "Floors climbed",
                value: `${Math.round(floors)}`,
                subtitle: `~3m per floor`,
            });
        }

        const fields = distanceM / FOOTBALL_FIELD_M;
        if (fields > 1) {
            items.push({
                id: "fields",
                emoji: "🏟️",
                title: "Football fields",
                value: `${Math.round(fields)}`,
                subtitle: `distance equivalent`,
            });
        }

        const marathons = distanceM / MARATHON_M;
        if (marathons > 1) {
            items.push({
                id: "marathons",
                emoji: "🏁",
                title: "Marathons",
                value: fmtX(marathons),
                subtitle: `42.195 km each`,
            });
        }

        const trackLaps = distanceM / TRACK_LAP_M;
        if (trackLaps > 1) {
            items.push({
                id: "laps",
                emoji: "🏟️",
                title: "Track laps",
                value: `${Math.round(trackLaps)}`,
                subtitle: `400m laps`,
            });
        }

        const distanceKm = metersToKm(distanceM);

        const earthPct = (distanceKm / EARTH_CIRCUMFERENCE_KM) * 100;
        if (earthPct >= 1) {
            items.push({
                id: "earth",
                emoji: "🌍",
                title: "Around Earth",
                value: `${num(earthPct, 1)}%`,
                subtitle: `Earth circumference`,
            });
        }

        const moonPct = (distanceKm / MOON_DISTANCE_KM) * 100;
        if (moonPct >= 1) {
            items.push({
                id: "moon",
                emoji: "🌕",
                title: "To the Moon",
                value: `${num(moonPct, 1)}%`,
                subtitle: `Earth → Moon`,
            });
        }

        const burj = elevationM / BURJ_KHALIFA_M;
        if (burj > 1) {
            items.push({
                id: "burj",
                emoji: "🗻",
                title: "Burj Khalifa",
                value: fmtX(burj),
                subtitle: `828m tall`,
            });
        }

        const empire = elevationM / EMPIRE_STATE_ROOF_M;
        if (empire > 1) {
            items.push({
                id: "empire",
                emoji: "🗽",
                title: "Empire State",
                value: fmtX(empire),
                subtitle: `roof ~381m`,
            });
        }

        const ebc = elevationM / EVEREST_BASE_CAMP_SOUTH_M;
        if (ebc > 1) {
            items.push({
                id: "ebc",
                emoji: "🏔️",
                title: "Everest Base Camp",
                value: fmtX(ebc),
                subtitle: `~5,364m`,
            });
        }

        return items.slice(0, 12);
    }, [activities, totals, range, formatters]);

    const longestByDuration =
        activities && activities.length > 0
            ? [...activities].sort((a, b) => (b.movingTimeSec ?? 0) - (a.movingTimeSec ?? 0))[0]
            : null;

    const farthestByDistance =
        activities && activities.length > 0
            ? [...activities].sort((a, b) => (b.distanceM ?? 0) - (a.distanceM ?? 0))[0]
            : null;

    const flyerBadges = wowItems
        .filter((w) =>
            ["eiffel", "floors", "fields", "marathons", "laps", "earth", "moon", "burj", "empire", "ebc"].includes(w.id)
        )
        .slice(0, 12)
        .map((w) => ({ emoji: w.emoji, label: w.title, value: w.value }));

    const streakItem = wowItems.find((w) => w.id === "streak");
    const streakValue = streakItem?.value ?? "—";
    const streakSubtitle = streakItem?.subtitle ?? "build it up";

    const longestValue = longestByDuration ? secondsToHms(longestByDuration.movingTimeSec ?? 0) : "—";
    const longestSubtitle = longestByDuration
        ? `${activityEmoji(longestByDuration.type)} ${longestByDuration.name}`
        : "no activities yet";

    const farthestValue =
        farthestByDistance && (farthestByDistance.distanceM ?? 0) > 0
            ? formatters.formatDistance(farthestByDistance.distanceM, 2)
            : "—";
    const farthestSubtitle = farthestByDistance
        ? `${activityEmoji(farthestByDistance.type)} ${farthestByDistance.name}`
        : "no distance activities yet";

    const flyerSubtitle = rangeLabel;

    return (
        <PageShell
            title={`${athleteName ? possessive(athleteName) : "Your"} Recap Insights`}
            right={
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: 10,
                        flexWrap: "wrap",
                    }}
                >
                    <UnitToggle value={units} onChange={setUnits} />
                    <Button variant="ghost" onClick={() => navigate("/select")}>
                        Change period
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={downloadShareImage}
                        disabled={!activities || !totals || connected !== true || exporting}
                    >
                        {exporting ? "Exporting…" : "Download image"}
                    </Button>
                </div>
            }
        >
            {/* Responsive layout CSS (inline, drop-in) */}
            <style>{`
              .totalsGrid {
                display: grid;
                gap: clamp(8px, 2vw, 10px);
                margin-top: 12px;
                grid-template-columns: repeat(4, minmax(0, 1fr));
              }
              @media (max-width: 820px) {
                .totalsGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
              }
              @media (max-width: 420px) {
                .totalsGrid { grid-template-columns: 1fr; }
              }
              .statCell { min-width: 0; }

              .flyerHeaderRow {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                flex-wrap: wrap;
                margin-top: 8px;
              }
              .flyerText {
                min-width: 0;
                opacity: 0.7;
                font-size: clamp(11px, 3vw, 13px);
              }
              .flyerPreview {
                width: min(540px, 100%);
                margin: 14px auto 0;
                border-radius: 22px;
                overflow: hidden;
                border: 1px solid rgba(255,255,255,0.10);
                background: rgba(255,255,255,0.02);
                position: relative;
                aspect-ratio: 1080 / 1350;
              }
              .flyerInner {
                position: absolute;
                left: 0;
                top: 0;
                transform-origin: top left;
              }
              @media (max-width: 640px) {
                .flyerHeaderRow { flex-direction: column; align-items: stretch; }
              }
            `}</style>

            <div
                style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "0 clamp(12px, 3vw, 16px)",
                    boxSizing: "border-box",
                    gap: "clamp(12px, 3vw, 14px)",
                }}
            >
                {/* Connection / status */}
                <Card style={{ width: "100%", maxWidth: 900 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "clamp(8px, 2vw, 12px)", alignItems: "flex-start" }}>
                        <div>
                            <div style={{ fontSize: "clamp(16px, 4vw, 18px)", fontWeight: 900 }}>{headerTitle}</div>
                            <div style={{ opacity: 0.7, marginTop: 4, fontSize: "clamp(13px, 3vw, 14px)" }}>{rangeLabel}</div>
                        </div>

                        {connected === false && <div style={{ opacity: 0.75, fontSize: "clamp(12px, 3vw, 13px)" }}>Not connected</div>}
                        {connected === true && <div style={{ opacity: 0.75, fontSize: "clamp(12px, 3vw, 13px)" }}>Connected</div>}
                    </div>

                    {connected === false && (
                        <div style={{ marginTop: 14, width: "100%" }}>
                            <div style={{ opacity: 0.8, fontSize: "clamp(13px, 3vw, 14px)" }}>
                                Connect Strava (read-only) to generate this recap.
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
                                <StravaConnectButton onClick={connectStrava}>
                                </StravaConnectButton>
                                <Button variant="ghost" onClick={() => navigate("/select")} style={{ width: "100%" }}>
                                    Back
                                </Button>
                            </div>
                        </div>
                    )}

                    {loading && <div style={{ marginTop: 14, opacity: 0.85, fontSize: "clamp(13px, 3vw, 14px)" }}>Fetching activities… computing recap…</div>}
                    {error && <div style={{ marginTop: 14, color: "#ff6b6b", fontSize: "clamp(13px, 3vw, 14px)" }}>Error: {error}</div>}
                </Card>

                {/* Share panel (export this) */}
                {activities && totals && (
                    <Card style={{ width: "100%", maxWidth: 900 }}>
                        <div
                            ref={shareRef}
                            style={{
                                borderRadius: 22,
                                padding: "clamp(14px, 3vw, 18px)",
                                border: "1px solid rgba(255,255,255,0.10)",
                                background:
                                    "radial-gradient(900px 460px at 30% 0%, rgba(42,127,255,0.22), transparent 60%), rgba(255,255,255,0.03)",
                            }}
                        >
                            <div style={{ display: "flex", flexDirection: "column", gap: "clamp(8px, 2vw, 12px)", alignItems: "flex-start" }}>
                                <div>
                                    <div style={{ fontSize: "clamp(18px, 5vw, 22px)", fontWeight: 950, letterSpacing: -0.4 }}>
                                        {headerTitle}
                                    </div>
                                    <div style={{ opacity: 0.75, marginTop: 6, fontSize: "clamp(12px, 3vw, 14px)" }}>{rangeLabel}</div>
                                </div>

                                <div
                                    style={{
                                        padding: "6px 10px",
                                        borderRadius: 999,
                                        fontSize: "clamp(10px, 2vw, 12px)",
                                        fontWeight: 900,
                                        opacity: 0.85,
                                        border: "1px solid rgba(255,255,255,0.10)",
                                        background: "rgba(255,255,255,0.05)",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {units === "mi" ? "mi / ft" : "km / m"} • Strava
                                </div>
                            </div>

                            {/* TOTALS (fixed: now stretches properly) */}
                            <div style={{ marginTop: "clamp(12px, 3vw, 16px)" }}>
                                <div style={{ fontSize: "clamp(12px, 3vw, 14px)", fontWeight: 900, opacity: 0.75, letterSpacing: 0.8 }}>
                                    TOTALS
                                </div>

                                <div className="totalsGrid">
                                    <div className="statCell"><Stat label="🎯 Activities" value={String(totals.activities)} /></div>
                                    <div className="statCell"><Stat label="📏 Distance" value={formatters.formatDistance(totals.distanceM, 1)} /></div>
                                    <div className="statCell"><Stat label="⏱️ Time" value={secondsToHms(totals.movingTimeSec)} /></div>
                                    <div className="statCell"><Stat label="⛰️ Elevation" value={formatters.formatElevation(totals.elevationM)} /></div>
                                </div>
                            </div>

                            {/* WOW */}
                            {wowItems.length > 0 && (
                                <div style={{ marginTop: "clamp(12px, 3vw, 16px)" }}>
                                    <div style={{ fontSize: "clamp(12px, 3vw, 14px)", fontWeight: 900, opacity: 0.75, letterSpacing: 0.8 }}>
                                        WOW HIGHLIGHTS
                                    </div>

                                    <div style={{ marginTop: 12 }}>
                                        <WowCarousel items={wowItems} />
                                    </div>

                                    <div style={{ marginTop: 8, fontSize: "clamp(10px, 2vw, 12px)", opacity: 0.6 }}>
                                        Tip: swipe to your favorite wow card, then download.
                                    </div>
                                </div>
                            )}

                            {/* BREAKDOWN */}
                            <div style={{ marginTop: "clamp(12px, 3vw, 16px)" }}>
                                <div style={{ fontSize: "clamp(12px, 3vw, 14px)", fontWeight: 900, opacity: 0.75, letterSpacing: 0.8 }}>
                                    BREAKDOWN
                                </div>
                                <div style={{ opacity: 0.7, marginTop: 6, fontSize: "clamp(11px, 3vw, 13px)" }}>
                                    Contextual summary by activity type
                                </div>

                                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: "clamp(8px, 2vw, 10px)" }}>
                                    {byType.slice(0, 8).map(([type, info]) => (
                                        <div
                                            key={type}
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "flex-start",
                                                justifyContent: "flex-start",
                                                gap: "clamp(6px, 2vw, 8px)",
                                                padding: "clamp(10px, 2vw, 12px)",
                                                borderRadius: 14,
                                                border: "1px solid rgba(255,255,255,0.08)",
                                                background: "rgba(255,255,255,0.03)",
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                                                <div style={{ fontSize: "clamp(16px, 4vw, 18px)" }}>{activityEmoji(type)}</div>
                                                <div style={{ fontWeight: 850, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "clamp(13px, 3vw, 14px)" }}>
                                                    {type}
                                                </div>
                                            </div>

                                            <div
                                                style={{
                                                    opacity: 0.9,
                                                    textAlign: "left",
                                                    width: "100%",
                                                    overflowWrap: "anywhere",
                                                    fontSize: "clamp(11px, 3vw, 13px)",
                                                }}
                                            >
                                                {formatBreakdownLine(type, info)}
                                            </div>
                                        </div>
                                    ))}

                                    {byType.length === 0 && (
                                        <div style={{ opacity: 0.75, fontSize: "clamp(12px, 3vw, 13px)" }}>
                                            No activities in this range.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Flyer card component */}
                <FlyerCard
                    activities={activities}
                    totals={totals}
                    athleteName={athleteName}
                    longestValue={longestValue}
                    longestSubtitle={longestSubtitle}
                    farthestValue={farthestValue}
                    farthestSubtitle={farthestSubtitle}
                    streakValue={streakValue}
                    streakSubtitle={streakSubtitle}
                    flyerBadges={flyerBadges}
                    flyerSubtitle={flyerSubtitle}
                    formattedTime={totals ? secondsToHms(totals.movingTimeSec) : "—"}
                    units={units}
                    formatDistance={formatters.formatDistance}
                    formatElevation={formatters.formatElevation}
                />

                {/* footer watermark */}
                <div
                    style={{
                        marginTop: 16,
                        display: "flex",
                        justifyContent: "space-between",
                        opacity: 0.55,
                        fontSize: 12,
                        fontWeight: 800,
                    }}
                >
                    <div>Generated by Recap</div>
                    <div>{new Date().toLocaleDateString()}</div>
                </div>
            </div>
        </PageShell>
    );
}
