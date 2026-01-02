import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toPng } from "html-to-image";

import type { ActivityItem } from "../models/models";
import { parseRecapQuery } from "../utils/recapQuery";
import { formatRangeLabel, num, secondsToHms } from "../utils/format";
import { possessive } from "../utils/helper";

import PageShell from "../ui/PageShell";
import Stat from "../ui/Stat";
import WowCarousel from "../ui/WowCarousel";
import type { WowItem } from "../ui/WowItemCard";
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

    const shareRef = useRef<HTMLDivElement | null>(null);
    const wowRef = useRef<HTMLDivElement | null>(null);
    const [exporting, setExporting] = useState(false);
    const [exportingWow, setExportingWow] = useState(false);

    useEffect(() => {
        if (!query) {
            navigate("/select", { replace: true });
            return;
        }

        let cancelled = false;
        const run = async () => {
            setLoading(true);
            setError(null);
            setActivities(null);
            setRange(null);
            setConnected(null);

            try {
                const apiUrl = `/api/recap?${searchParams.toString()}`;
                const res = await fetch(apiUrl);
                const data = (await res.json()) as RecapApiResponseFlat;

                if (cancelled) return;

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
                if (!cancelled) setError(String(e));
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, [query, navigate, searchParams]);

    const connectStrava = () => {
        const returnTo = location.pathname + location.search;
        window.location.href = `/api/provider/connect?returnTo=${encodeURIComponent(returnTo)}`;
    };

    const downloadShareImage = async () => {
        if (!shareRef.current || !query) return;
        try {
            setExporting(true);
            const file = `recap-${slugify(formatRangeLabel(query))}-${units}.png`;
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

    const downloadWowImage = async () => {
        if (!wowRef.current || !query) return;
        try {
            setExportingWow(true);
            const file = `recap-wow-${slugify(formatRangeLabel(query))}-${units}.png`;
            const dataUrl = await toPng(wowRef.current, {
                cacheBust: true,
                pixelRatio: 2,
                backgroundColor: "#0b0f14",
            });
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = file;
            a.click();
        } finally {
            setExportingWow(false);
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

        const longestByDuration = activities.length > 0
            ? [...activities].sort((a, b) => (b.movingTimeSec ?? 0) - (a.movingTimeSec ?? 0))[0]
            : null;

        const farthestByDistance = activities.length > 0
            ? [...activities].sort((a, b) => (b.distanceM ?? 0) - (a.distanceM ?? 0))[0]
            : null;

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

    return (
        <PageShell
            title={`${athleteName ? possessive(athleteName) : "Your"} Recap Insights`}
            right={
                <div className="d-flex flex-wrap gap-2 justify-content-end align-items-center">
                    <div className="btn-group btn-group-sm" role="group" aria-label="Units">
                        <button type="button" className={`btn ${units === "km" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setUnits("km")}>
                            km
                        </button>
                        <button type="button" className={`btn ${units === "mi" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setUnits("mi")}>
                            mi
                        </button>
                    </div>
                    <button type="button" className="btn btn-outline-light btn-sm" onClick={() => navigate("/select")}>Change period</button>
                    <button
                        type="button"
                        className="btn btn-outline-info btn-sm"
                        onClick={downloadShareImage}
                        disabled={!activities || !totals || connected !== true || exporting}
                    >
                        {exporting ? "Exporting…" : "Download image"}
                    </button>
                </div>
            }
        >
            <div className="row justify-content-center">
                <div className="col-12 col-lg-10 col-xl-9">
                    <div className="card mb-4">
                        <div className="card-body">
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-2">
                                <div>
                                    <div className="fw-bold fs-5">{headerTitle}</div>
                                    <div className="text-body-secondary">{rangeLabel}</div>
                                </div>
                                <div className="d-flex flex-column align-items-start align-items-md-end gap-2">
                                    {connected === true && <span className="badge text-bg-success">Connected</span>}
                                    {connected === false && <span className="badge text-bg-warning">Not connected</span>}
                                    <span className="badge text-bg-secondary">{units === "mi" ? "mi / ft" : "km / m"} • Strava</span>
                                </div>
                            </div>

                            {loading && <div className="text-info mt-3">Fetching activities… computing recap…</div>}
                            {error && <div className="text-danger mt-3">Error: {error}</div>}

                            {connected === false && (
                                <div className="mt-3">
                                    <p className="mb-3">Connect Strava (read-only) to generate this recap.</p>
                                    <div className="d-flex flex-column flex-sm-row gap-2">
                                        <StravaConnectButton onClick={connectStrava} />
                                        <button type="button" className="btn btn-outline-secondary flex-fill" onClick={() => navigate("/select")}>
                                            Back
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {activities && totals && (
                        <div className="card mb-4" ref={shareRef}>
                            <div className="card-body">
                                <div>
                                    <div className="text-uppercase small text-secondary fw-semibold mb-2">Totals</div>
                                    <div className="row g-3">
                                        <div className="col-6 col-md-3"><Stat label="🎯 Activities" value={String(totals.activities)} /></div>
                                        <div className="col-6 col-md-3"><Stat label="📏 Distance" value={formatters.formatDistance(totals.distanceM, 1)} /></div>
                                        <div className="col-6 col-md-3"><Stat label="⏱️ Time" value={secondsToHms(totals.movingTimeSec)} /></div>
                                        <div className="col-6 col-md-3"><Stat label="⛰️ Elevation" value={formatters.formatElevation(totals.elevationM)} /></div>
                                    </div>
                                </div>

                                {wowItems.length > 0 && (
                                    <div className="mt-4">
                                        <div className="d-flex justify-content-between align-items-center mb-2 gap-2">
                                            <div className="text-uppercase small text-secondary fw-semibold">Wow highlights</div>
                                            <button
                                                type="button"
                                                className="btn"
                                                onClick={downloadWowImage}
                                                disabled={exportingWow}
                                                title="Download current wow carousel"
                                            >
                                                {exportingWow ? "…" : "⬇️"}
                                            </button>
                                        </div>
                                        <WowCarousel ref={wowRef} items={wowItems} />
                                        <div className="text-body-secondary small mt-2">Tip: swipe to your favorite wow card, then download.</div>
                                    </div>
                                )}

                                <div className="mt-4">
                                    <div className="text-uppercase small text-secondary fw-semibold mb-2">Breakdown</div>
                                    <p className="text-body-secondary small">Contextual summary by activity type</p>
                                    <div className="list-group">
                                        {byType.map(([type, info]) => (
                                            <div key={type} className="list-group-item">
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <span className="fs-4" aria-hidden="true">{activityEmoji(type)}</span>
                                                    <div className="fw-semibold text-truncate">{type}</div>
                                                </div>
                                                <div className="text-body-secondary small">{formatBreakdownLine(type, info)}</div>
                                            </div>
                                        ))}
                                        {byType.length === 0 && (
                                            <div className="list-group-item text-body-secondary">No activities in this range.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="d-flex justify-content-between text-body-secondary mt-3 small fw-semibold">
                        <div>Generated by Recap</div>
                        <div>{new Date().toLocaleDateString()}</div>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}

