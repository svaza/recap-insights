import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams, Link } from "react-router-dom";

import { parseRecapQuery } from "../utils/recapQuery";
import { formatRangeLabel, num, secondsToHms } from "../utils/format";
import { possessive } from "../utils/helper";
import { getActivityEmoji, getActivityDescription } from "../utils/activityTypes";
import { getActivityGroup } from "../utils/activityGroups";
import { getDisplayStatsForType } from "../utils/activityStatsConfig";
import { useAthleteProfile } from "../hooks/useAthleteProfile";
import { useFetchRecap } from "../hooks/useFetchRecap";

import PageShell from "../ui/PageShell";
import type { NavItem, NavGroup, ProviderBadgeInfo } from "../ui/PageShell";
import Stat from "../ui/Stat";
import WowGrid from "../ui/WowGrid";
import type { WowItem } from "../ui/WowItemCard";
import ConnectProviderPrompt from "../ui/ConnectProviderPrompt";

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
const PACE_MIN_DISTANCE_M = 3000;
const PACE_MIN_TIME_SEC = 15 * 60;
const CLIMB_MIN_DISTANCE_M = 5000;
const CLIMB_MIN_ELEVATION_M = 200;
const AVG_SESSION_MIN_ACTIVITIES = 2;
const DOMINANT_SHARE_MIN_PCT = 40;
const BUSIEST_WEEK_MIN_DAYS = 3;

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
    if (q.unit === "month" && q.offset === -1) return "Last month";
    if (q.unit === "month") return "This month";
    if (q.unit === "year" && q.offset === -1) return "Last year";
    return "This year";
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

function formatPace(secondsPerUnit: number) {
    if (!isFinite(secondsPerUnit) || secondsPerUnit <= 0) return "0:00";
    const totalSeconds = Math.round(secondsPerUnit);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatActivityPace(
    activity: { distanceM: number; movingTimeSec: number },
    units: UnitSystem
) {
    if (!activity || activity.distanceM <= 0 || activity.movingTimeSec <= 0) return null;
    if (units === "km") {
        const paceSecPerKm = activity.movingTimeSec / Math.max(0.001, metersToKm(activity.distanceM));
        return `${formatPace(paceSecPerKm)} /km`;
    }
    const paceSecPerMi = activity.movingTimeSec / Math.max(0.001, metersToMiles(activity.distanceM));
    return `${formatPace(paceSecPerMi)} /mi`;
}

function computeBestSevenDayWindow(activeDayKeys: string[]) {
    if (activeDayKeys.length === 0) return 0;
    const uniqueDays = Array.from(new Set(activeDayKeys));
    const dates = uniqueDays
        .map((k) => new Date(`${k}T00:00:00`).getTime())
        .sort((a, b) => a - b);

    let best = 1;
    let left = 0;
    const windowMs = 6 * MS_PER_DAY;

    for (let right = 0; right < dates.length; right++) {
        while (dates[right] - dates[left] > windowMs) {
            left += 1;
        }
        best = Math.max(best, right - left + 1);
    }

    return best;
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

    useEffect(() => {
        if (!query) {
            navigate("/select", { replace: true });
        }
    }, [query, navigate]);

    const connectProvider = (providerType: string = "strava") => {
        const returnTo = location.pathname + location.search;
        window.location.href = `/api/provider/connect?provider=${providerType}&returnTo=${encodeURIComponent(returnTo)}`;
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
        const displayStats = getDisplayStatsForType(type, info);
        const parts: string[] = [];

        for (const stat of displayStats) {
            if (stat === 'distance') {
                parts.push(formatters.formatDistance(info.distanceM, 1));
            } else if (stat === 'time') {
                parts.push(secondsToHms(info.movingTimeSec));
            } else if (stat === 'elevation') {
                parts.push(formatters.formatElevation(info.elevationM));
            }
        }

        return parts.join(" • ") || secondsToHms(info.movingTimeSec);
    };

    const totalDays = useMemo(() => {
        if (!range) return null;
        const start = new Date(range.startUtc);
        const end = new Date(range.endUtc);
        return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / MS_PER_DAY));
    }, [range]);

    const getBreakdownShare = (
        type: string,
        info: { distanceM: number; movingTimeSec: number; elevationM: number }
    ) => {
        if (!total) return null;
        const displayStats = getDisplayStatsForType(type, info);

        const calc = (value: number, totalValue: number, basis: "distance" | "time" | "elevation") => {
            if (totalValue <= 0 || value <= 0) return null;
            const rawPct = (value / totalValue) * 100;
            const widthPct = Math.min(100, Math.max(0, rawPct));
            const label = rawPct > 0 && rawPct < 1 ? "<1%" : `${Math.round(rawPct)}%`;
            return { widthPct, label, basis };
        };

        if (displayStats.includes("distance")) {
            const share = calc(info.distanceM, total.distanceM, "distance");
            if (share) return share;
        }
        if (displayStats.includes("time")) {
            const share = calc(info.movingTimeSec, total.movingTimeSec, "time");
            if (share) return share;
        }
        if (displayStats.includes("elevation")) {
            const share = calc(info.elevationM, total.elevationM, "elevation");
            if (share) return share;
        }

        return null;
    };

    const wowItems: WowItem[] = useMemo(() => {
        if (!total || !range) return [];

        const items: WowItem[] = [];

        const start = new Date(range.startUtc);
        const end = new Date(range.endUtc);
        const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / MS_PER_DAY));
        const elevationM = total.elevationM;
        const distanceM = total.distanceM;
        const movingTimeSec = total.movingTimeSec;

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

        // Average pace or speed
        if (distanceM >= PACE_MIN_DISTANCE_M && movingTimeSec >= PACE_MIN_TIME_SEC) {
            const hours = movingTimeSec / 3600;
            if (units === "km") {
                const distanceKm = metersToKm(distanceM);
                const speedKph = distanceKm / Math.max(0.01, hours);
                const paceSecPerKm = movingTimeSec / Math.max(0.001, distanceKm);
                items.push({
                    id: "avg-pace",
                    emoji: "⚡",
                    title: "Average speed",
                    value: `${num(speedKph, 1)} kph`,
                    secondaryValue: `${formatPace(paceSecPerKm)} /km pace`,
                    subtitle: `across ${formatters.formatDistance(distanceM, 1)}`,
                });
            } else {
                const distanceMi = metersToMiles(distanceM);
                const speedMph = distanceMi / Math.max(0.01, hours);
                const paceSecPerMi = movingTimeSec / Math.max(0.001, distanceMi);
                items.push({
                    id: "avg-pace",
                    emoji: "⚡",
                    title: "Average speed",
                    value: `${num(speedMph, 1)} mph`,
                    secondaryValue: `${formatPace(paceSecPerMi)} /mi pace`,
                    subtitle: `across ${formatters.formatDistance(distanceM, 1)}`,
                });
            }
        }

        // Average per activity
        if (total.activities >= AVG_SESSION_MIN_ACTIVITIES && distanceM > 0) {
            const avgDistanceM = distanceM / total.activities;
            const avgTimeSec = movingTimeSec / Math.max(1, total.activities);
            items.push({
                id: "avg-session",
                emoji: "📊",
                title: "Avg session",
                value: formatters.formatDistance(avgDistanceM, 1),
                subtitle: `${secondsToHms(avgTimeSec)} avg time`,
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

        // Biggest climb session
        if (highlights?.biggestClimbActivity && (highlights.biggestClimbActivity.elevationM ?? 0) > 0) {
            items.push({
                id: "biggest-climb",
                emoji: "⛰️",
                title: "Biggest climb",
                value: formatters.formatElevation(highlights.biggestClimbActivity.elevationM),
                secondaryValue: secondsToHms(highlights.biggestClimbActivity.movingTimeSec),
                subtitle: `${getActivityEmoji(highlights.biggestClimbActivity.type)} ${highlights.biggestClimbActivity.name}`,
            });
        }

        // Fastest pace session
        if (highlights?.fastestPaceActivity) {
            const pace = formatActivityPace(highlights.fastestPaceActivity, units);
            if (pace) {
                items.push({
                    id: "fastest-pace",
                    emoji: "⚡",
                    title: "Fastest pace",
                    value: pace,
                    secondaryValue: formatters.formatDistance(highlights.fastestPaceActivity.distanceM, 1),
                    subtitle: `${getActivityEmoji(highlights.fastestPaceActivity.type)} ${highlights.fastestPaceActivity.name}`,
                });
            }
        }

        // Best 5k pace (session)
        if (highlights?.best5kActivity) {
            const pace = formatActivityPace(highlights.best5kActivity, units);
            if (pace) {
                items.push({
                    id: "best-5k",
                    emoji: "🏁",
                    title: "Best 5k pace",
                    value: pace,
                    secondaryValue: formatters.formatDistance(highlights.best5kActivity.distanceM, 1),
                    subtitle: `${getActivityEmoji(highlights.best5kActivity.type)} ${highlights.best5kActivity.name}`,
                });
            }
        }

        // Best 10k pace (session)
        if (highlights?.best10kActivity) {
            const pace = formatActivityPace(highlights.best10kActivity, units);
            if (pace) {
                items.push({
                    id: "best-10k",
                    emoji: "🏁",
                    title: "Best 10k pace",
                    value: pace,
                    secondaryValue: formatters.formatDistance(highlights.best10kActivity.distanceM, 1),
                    subtitle: `${getActivityEmoji(highlights.best10kActivity.type)} ${highlights.best10kActivity.name}`,
                });
            }
        }

        // Most active day
        if (highlights?.mostActiveDay) {
            const day = highlights.mostActiveDay;
            const value = day.distanceM > 0
                ? formatters.formatDistance(day.distanceM, 1)
                : secondsToHms(day.movingTimeSec);
            const secondary = day.distanceM > 0
                ? secondsToHms(day.movingTimeSec)
                : `${day.activities} activities`;
            items.push({
                id: "most-active-day",
                emoji: "📅",
                title: "Most active day",
                value,
                secondaryValue: secondary,
                subtitle: `${day.date} · ${day.activities} activities`,
            });
        }

        // Time of day persona
        if (highlights?.timeOfDayPersona) {
            const persona = highlights.timeOfDayPersona;
            items.push({
                id: "time-of-day",
                emoji: "🕒",
                title: "Time of day",
                value: persona.persona,
                secondaryValue: `${persona.percent}% of starts`,
                subtitle: persona.bucket,
            });
        }

        // Highest average heart rate
        if (highlights?.highestAvgHeartrateActivity && (highlights.highestAvgHeartrateActivity.averageHeartrate ?? 0) > 0) {
            const avgHr = Math.round(highlights.highestAvgHeartrateActivity.averageHeartrate ?? 0);
            items.push({
                id: "avg-hr",
                emoji: "❤️",
                title: "Avg HR record",
                value: `${avgHr} bpm`,
                subtitle: `${getActivityEmoji(highlights.highestAvgHeartrateActivity.type)} ${highlights.highestAvgHeartrateActivity.name}`,
            });
        }

        // Highest max heart rate
        if (highlights?.highestMaxHeartrateActivity && (highlights.highestMaxHeartrateActivity.maxHeartrate ?? 0) > 0) {
            const maxHr = Math.round(highlights.highestMaxHeartrateActivity.maxHeartrate ?? 0);
            items.push({
                id: "max-hr",
                emoji: "💥",
                title: "Max HR record",
                value: `${maxHr} bpm`,
                subtitle: `${getActivityEmoji(highlights.highestMaxHeartrateActivity.type)} ${highlights.highestMaxHeartrateActivity.name}`,
            });
        }

        // Climb density
        if (distanceM >= CLIMB_MIN_DISTANCE_M && elevationM >= CLIMB_MIN_ELEVATION_M) {
            if (units === "km") {
                const perKm = elevationM / Math.max(0.001, metersToKm(distanceM));
                items.push({
                    id: "climb-density",
                    emoji: "⛰️",
                    title: "Climb density",
                    value: `${Math.round(perKm)} m/km`,
                    subtitle: `from ${formatters.formatElevation(elevationM)} gain`,
                });
            } else {
                const perMi = metersToFeet(elevationM) / Math.max(0.001, metersToMiles(distanceM));
                items.push({
                    id: "climb-density",
                    emoji: "⛰️",
                    title: "Climb density",
                    value: `${Math.round(perMi)} ft/mi`,
                    subtitle: `from ${formatters.formatElevation(elevationM)} gain`,
                });
            }
        }

        // Dominant sport share
        if (breakdown.length > 0 && distanceM > 0) {
            const top = breakdown.reduce(
                (best, item) => (item.distanceM > best.distanceM ? item : best),
                breakdown[0]
            );
            if (top.distanceM > 0) {
                const pct = Math.round((top.distanceM / distanceM) * 100);
                if (pct >= DOMINANT_SHARE_MIN_PCT) {
                    items.push({
                        id: "dominant-sport",
                        emoji: getActivityEmoji(top.type),
                        title: "Dominant sport",
                        value: `${pct}%`,
                        subtitle: `${getActivityDescription(top.type)} distance`,
                    });
                }
            }
        }

        // Variety score
        if (breakdown.length >= 2) {
            items.push({
                id: "variety",
                emoji: "🎛️",
                title: "Variety",
                value: `${breakdown.length} types`,
                subtitle: `across ${total.activities} activities`,
            });
        }

        // Busiest week
        const bestWeek = computeBestSevenDayWindow(activeDays);
        if (bestWeek >= BUSIEST_WEEK_MIN_DAYS) {
            items.push({
                id: "busiest-week",
                emoji: "🗓️",
                title: "Busiest week",
                value: `${bestWeek}/7 days`,
                subtitle: "best 7-day stretch",
            });
        }

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
    }, [total, range, activeDays, highlights, formatters, breakdown, units]);

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
                    
                    {(loading || error || connected === false) && (
                        <div className="card mb-4">
                            <div className="card-body">
                                {loading && <div className="text-info mt-3">Fetching activities… computing recap…</div>}
                                {error && <div className="text-danger mt-3">Error: {error}</div>}

                                {connected === false && (
                                    <div className="mt-3">
                                        <ConnectProviderPrompt
                                            message="Connect a provider (read-only) to generate this recap."
                                            onConnectStrava={() => connectProvider("strava")}
                                            onConnectIntervalsIcu={() => connectProvider("intervalsicu")}
                                            backButton={{
                                                label: "Back",
                                                onClick: () => navigate("/select"),
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {total && (
                        <div className="card mb-4">
                            <div className="card-body">
                                <div>
                                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                                        <div className="text-uppercase small text-secondary fw-semibold">
                                            Totals · {headerTitle}
                                        </div>
                                        <div className="text-body-secondary small">{rangeLabel}</div>
                                    </div>
                                    <div className="row g-3">
                                        <div className="col-6 col-md-3">
                                            <Stat
                                                label="🎯 Activities"
                                                value={String(total.activities)}
                                                subLabel={totalDays ? `${num(total.activities / totalDays, 1)} avg/day` : undefined}
                                            />
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <Stat
                                                label="📏 Distance"
                                                value={formatters.formatDistance(total.distanceM, 1)}
                                                subLabel={totalDays ? `${formatters.formatDistance(total.distanceM / totalDays, 1)} avg/day` : undefined}
                                            />
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <Stat
                                                label="⏱️ Time"
                                                value={secondsToHms(total.movingTimeSec)}
                                                subLabel={totalDays ? `${secondsToHms(Math.round(total.movingTimeSec / totalDays))} avg/day` : undefined}
                                            />
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <Stat
                                                label="⛰️ Elevation"
                                                value={formatters.formatElevation(total.elevationM)}
                                                subLabel={totalDays ? `${formatters.formatElevation(total.elevationM / totalDays)} avg/day` : undefined}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {wowItems.length > 0 && (
                                    <div className="mt-4">
                                        <div className="d-flex justify-content-between align-items-center mb-2 gap-2">
                                            <div className="text-uppercase small text-secondary fw-semibold">Wow highlights</div>
                                        </div>
                                        <WowGrid items={wowItems} />
                                    </div>
                                )}

                                <div className="mt-4">
                                    <div className="text-uppercase small text-secondary fw-semibold mb-2">Breakdown</div>
                                    <p className="text-body-secondary small mb-2">Contextual summary by activity type</p>
                                    <div className="row g-0">
                                        {breakdown.map((item) => {
                                            const activityGroup = getActivityGroup(item.type);
                                            const flyerParams = new URLSearchParams(location.search);
                                            flyerParams.set("activityGroup", activityGroup);
                                            const flyerUrl = `/flyer?${flyerParams.toString()}`;
                                            const share = getBreakdownShare(item.type, item);
                                            return (
                                                <div key={item.type} className="col-12 col-md-6">
                                                    <div className="border p-2 ps-3">
                                                        <div className="d-flex align-items-center justify-content-between gap-2 mb-1 flex-wrap">
                                                            <div className="d-flex align-items-center gap-2 min-w-0 breakdown-title-wrap">
                                                                <span className="fs-4" aria-hidden="true">{getActivityEmoji(item.type)}</span>
                                                                <div className="fw-semibold text-truncate breakdown-title">{getActivityDescription(item.type)}</div>
                                                            </div>
                                                            <Link
                                                                to={flyerUrl}
                                                                className="btn btn-outline-secondary btn-sm flex-shrink-0 breakdown-flyer-btn"
                                                                title="Generate flyer for this activity"
                                                            >
                                                                🖼️ Flyer
                                                            </Link>
                                                        </div>
                                                        <div className="text-body-secondary small">{formatBreakdownLine(item.type, item)}</div>
                                                        {share && (
                                                            <div className="breakdown-share text-body-secondary small mt-2">
                                                                <div className="breakdown-share__track" aria-hidden="true">
                                                                    <div
                                                                        className="breakdown-share__fill"
                                                                        style={{ width: `${share.widthPct}%` }}
                                                                    />
                                                                </div>
                                                                <div className="breakdown-share__label">
                                                                    {share.label} of total {share.basis}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
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
