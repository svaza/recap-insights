import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toPng } from "html-to-image";

import { parseRecapQuery } from "../utils/recapQuery";
import { formatRangeLabel, num, secondsToHms } from "../utils/format";
import { possessive } from "../utils/helper";
import { getActivityEmoji, getActivityDescription } from "../utils/activityTypes";
import { useAthleteProfile } from "../hooks/useAthleteProfile";
import { useFetchRecap } from "../hooks/useFetchRecap";

import PageShell from "../ui/PageShell";
import type { NavItem, NavGroup, ProviderBadgeInfo } from "../ui/PageShell";
import Stat from "../ui/Stat";
import WowCarousel from "../ui/WowCarousel";
import type { WowItem } from "../ui/WowItemCard";
import { StravaConnectButton } from "../ui/StravaConnectButton";

type UnitSystem = "km" | "mi";

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

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function metersToKm(m: number) {
    return m / 1000;
}

function metersToMiles(m: number) {
    return m / 1609.344;
}

function metersToFeet(m: number) {
    return m * 3.28084;
}

function getHeaderTitle(q: ReturnType<typeof parseRecapQuery>) {
    if (!q) return "Your Recap Insights";
    if (q.type === "rolling") return `Last ${q.days} days`;
    if (q.unit === "month") return "This month";
    if (q.unit === "year" && q.offset === -1) return "Last year";
    return "This year";
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
    const { athleteProfile } = useAthleteProfile();
    const { loading, connected, error, providerDisplayName, highlights, total, breakdown, range, activeDays } = useFetchRecap(searchParams.toString());

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
        }
    }, [query, navigate]);

    const connectProvider = (providerType: string = "strava") => {
        const returnTo = location.pathname + location.search;
        window.location.href = `/api/provider/connect?provider=${providerType}&returnTo=${encodeURIComponent(returnTo)}`;
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
        info: { distanceM: number; movingTimeSec: number; elevationM: number }
    ) => {
        if (isDistanceType(type) && info.distanceM > 0) {
            const parts: string[] = [
                `${formatters.formatDistance(info.distanceM, 1)}`,
                `${secondsToHms(info.movingTimeSec)}`,
            ];
            if (shouldShowElevation(type, info.elevationM)) parts.push(formatters.formatElevation(info.elevationM));
            return parts.join(" • ");
        }

        if (isTimeOnlyType(type)) {
            return `${secondsToHms(info.movingTimeSec)}`;
        }

        if (info.distanceM > 0) return `${formatters.formatDistance(info.distanceM, 1)}`;
        return `${secondsToHms(info.movingTimeSec)}`;
    };

    const wowItems: WowItem[] = useMemo(() => {
        if (!total || !range) return [];

        const items: WowItem[] = [];

        const start = new Date(range.startUtc);
        const end = new Date(range.endUtc);
        const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / MS_PER_DAY));

        // Active days
        if (activeDays.length > 0) {
            const pct = Math.round((activeDays.length / totalDays) * 100);
            items.push({
                id: "active-days",
                emoji: "📆",
                title: "Active days",
                value: `${activeDays.length}/${totalDays}`,
                subtitle: `${pct}% consistency`,
            });
        }

        // Longest streak
        const longestStreak = computeLongestStreak(activeDays);
        if (longestStreak > 1) {
            items.push({
                id: "streak",
                emoji: "🔥",
                title: "Longest streak",
                value: `${longestStreak} days`,
                subtitle: `keep it rolling`,
            });
        }

        // Longest activity by duration
        if (highlights?.longestActivity && (highlights.longestActivity.movingTimeSec ?? 0) > 0) {
            items.push({
                id: "biggest-effort",
                emoji: "🚀",
                title: "Biggest effort",
                value: secondsToHms(highlights.longestActivity.movingTimeSec),
                subtitle: `${getActivityEmoji(highlights.longestActivity.type)} ${highlights.longestActivity.name}`,
            });
        }

        // Farthest activity by distance
        if (highlights?.farthestActivity && (highlights.farthestActivity.distanceM ?? 0) > 0) {
            items.push({
                id: "farthest",
                emoji: "🏆",
                title: "Farthest session",
                value: formatters.formatDistance(highlights.farthestActivity.distanceM, 2),
                subtitle: `${getActivityEmoji(highlights.farthestActivity.type)} ${highlights.farthestActivity.name}`,
            });
        }

        const elevationM = total.elevationM;
        const distanceM = total.distanceM;

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
    }, [total, range, activeDays, highlights, formatters]);

    const navGroups: NavGroup[] = [
        {
            id: "units",
            items: [
                { emoji: "🌍", label: "km", active: units === "km", onClick: () => setUnits("km") },
                { emoji: "🇺🇸", label: "mi", active: units === "mi", onClick: () => setUnits("mi") },
            ],
        },
    ];

    const navItems: NavItem[] = [
        {
            id: "change-period",
            emoji: "📅",
            label: "Change period",
            onClick: () => navigate("/select"),
        },
        ...(connected === true
            ? [
                  {
                      id: "download",
                      emoji: "📸",
                      label: exporting ? "Exporting…" : "Download",
                      onClick: downloadShareImage,
                      disabled: !total || exporting,
                      variant: "info" as const,
                  },
              ]
            : []),
    ];

    const providerBadge: ProviderBadgeInfo | undefined = connected !== null
        ? {
              connected,
              provider: providerDisplayName,
          }
        : undefined;

    return (
        <PageShell
            title={`${athleteProfile?.firstName ? possessive(athleteProfile.firstName) : "Your"} Recap Insights`}
            navGroups={navGroups}
            navItems={navItems}
            providerBadge={providerBadge}
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
                            </div>

                            {loading && <div className="text-info mt-3">Fetching activities… computing recap…</div>}
                            {error && <div className="text-danger mt-3">Error: {error}</div>}

                            {connected === false && (
                                <div className="mt-3">
                                    <p className="mb-3">Connect a provider (read-only) to generate this recap.</p>
                                    <div className="d-flex flex-column flex-sm-row gap-2">
                                        <StravaConnectButton onClick={() => connectProvider("strava")} />
                                        <button type="button" className="btn btn-outline-secondary flex-fill" onClick={() => navigate("/select")}>
                                            Back
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {total && (
                        <div className="card mb-4" ref={shareRef}>
                            <div className="card-body">
                                <div>
                                    <div className="text-uppercase small text-secondary fw-semibold mb-2">Totals</div>
                                    <div className="row g-3">
                                        <div className="col-6 col-md-3"><Stat label="🎯 Activities" value={String(total.activities)} /></div>
                                        <div className="col-6 col-md-3"><Stat label="📏 Distance" value={formatters.formatDistance(total.distanceM, 1)} /></div>
                                        <div className="col-6 col-md-3"><Stat label="⏱️ Time" value={secondsToHms(total.movingTimeSec)} /></div>
                                        <div className="col-6 col-md-3"><Stat label="⛰️ Elevation" value={formatters.formatElevation(total.elevationM)} /></div>
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
                                    <p className="text-body-secondary small mb-2">Contextual summary by activity type</p>
                                    <div className="row g-0">
                                        {breakdown.map((item) => (
                                            <div key={item.type} className="col-12 col-md-6">
                                                <div className="border p-2 ps-3">
                                                    <div className="d-flex align-items-center gap-2 mb-1">
                                                        <span className="fs-4" aria-hidden="true">{getActivityEmoji(item.type)}</span>
                                                        <div className="fw-semibold text-truncate">{getActivityDescription(item.type)}</div>
                                                    </div>
                                                    <div className="text-body-secondary small">{formatBreakdownLine(item.type, item)}</div>
                                                </div>
                                            </div>
                                        ))}
                                        {breakdown.length === 0 && (
                                            <div className="col-12">
                                                <div className="border p-3 text-body-secondary">No activities in this range.</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PageShell>
    );
}

