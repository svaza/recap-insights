import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import "./RecapPage.css";
import WowGrid from "../ui/WowGrid";
import type { WowItem } from "../ui/WowItemCard";
import ConnectProviderPrompt from "../ui/ConnectProviderPrompt";
import PulseLoader from "../ui/PulseLoader";
import BreakdownActionButton from "../ui/BreakdownActionButton";
import TotalsBreakdownModal, { type TotalsBreakdownItem } from "../ui/TotalsBreakdownModal";
import ActivityHeatmap from "../ui/ActivityHeatmap";

type UnitSystem = "km" | "mi";
type TrainingInsightTone = "up" | "steady" | "caution";

type TrainingInsight = {
    id: string;
    emoji: string;
    title: string;
    value: string;
    secondary: string;
    summary: string;
    hintLine1: string;
    hintLine2: string;
    tone: TrainingInsightTone;
};

type TrainingInsightsSection = {
    summary: string;
    cards: TrainingInsight[];
};

type TotalsBreakdownMetric = "activities" | "distance" | "time" | "elevation";

type TotalsBreakdownModalConfig = {
    sectionLabel: string;
    title: string;
    description: string;
    items: TotalsBreakdownItem[];
    emptyMessage: string;
};

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
const DEFAULT_TOP_WOW_COUNT = 3;
const TOTALS_BREAKDOWN_DIALOG_ID = "totals-breakdown-dialog";
const ACTIVITY_TYPE_STORAGE_KEY = "recap.activityType";
const ALL_ACTIVITIES_FILTER_VALUE = "__all__";

// Base importance by wow type. Final ranking also includes data magnitude per card.
const WOW_TYPE_WEIGHTS: Record<string, number> = {
    "biggest-effort": 100,
    "farthest": 98,
    "biggest-climb": 96,
    "fastest-pace": 95,
    "best-10k": 94,
    "best-5k": 94,
    "longest-week": 92,
    "streak": 90,
    "active-days": 90,
    "busiest-week": 88,
    "avg-pace": 86,
    "avg-session": 85,
    "climb-density": 84,
    "most-active-day": 83,
    "variety": 80,
    "dominant-sport": 79,
    "time-of-day": 77,
    "avg-hr": 76,
    "max-hr": 76,
    "marathons": 74,
    "earth": 73,
    "moon": 72,
    "ebc": 71,
    "burj": 70,
    "empire": 69,
    "eiffel": 68,
    "floors": 67,
    "laps": 66,
    "fields": 65,
};

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

function formatActivityTypeName(type: string): string {
    return type
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/\s+/g, " ")
        .trim();
}

function formatShortDateRange(start: string, end: string) {
    const startDate = new Date(`${start}T00:00:00`);
    const endDate = new Date(`${end}T00:00:00`);
    if (!isFinite(startDate.getTime()) || !isFinite(endDate.getTime())) {
        return `${start} – ${end}`;
    }

    const fmtShort = (d: Date) =>
        d.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
    const fmtLong = (d: Date) =>
        d.toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" });

    if (startDate.getFullYear() !== endDate.getFullYear()) {
        return `${fmtLong(startDate)} – ${fmtLong(endDate)}`;
    }

    return `${fmtShort(startDate)} – ${fmtShort(endDate)}`;
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

function pct(value: number, total: number): number {
    if (!isFinite(value) || !isFinite(total) || total <= 0) return 0;
    return (value / total) * 100;
}

function clampPct(value: number): number {
    if (!isFinite(value)) return 0;
    return Math.max(0, Math.min(100, value));
}

function formatShareLabel(rawPct: number): string {
    if (!isFinite(rawPct) || rawPct <= 0) return "0%";
    if (rawPct < 1) return "<1%";
    return `${Math.round(rawPct)}%`;
}

function parseDurationMinutes(text: string): number | null {
    const normalized = text.toLowerCase();
    const hours = Number(normalized.match(/(\d+(?:\.\d+)?)\s*h/)?.[1] ?? 0);
    const minutes = Number(normalized.match(/(\d+(?:\.\d+)?)\s*m/)?.[1] ?? 0);
    const seconds = Number(normalized.match(/(\d+(?:\.\d+)?)\s*s/)?.[1] ?? 0);
    const totalMinutes = hours * 60 + minutes + seconds / 60;
    return totalMinutes > 0 ? totalMinutes : null;
}

function parseDistanceKm(text: string): number | null {
    const match = text.toLowerCase().match(/(\d+(?:\.\d+)?)\s*(km|mi|m|ft)\b/);
    if (!match) return null;

    const value = Number(match[1]);
    if (!isFinite(value) || value <= 0) return null;

    const unit = match[2];
    if (unit === "km") return value;
    if (unit === "mi") return value * 1.609344;
    if (unit === "m") return value / 1000;
    if (unit === "ft") return value * 0.0003048;
    return null;
}

function extractWowMagnitude(item: WowItem): number {
    const source = [item.value, item.secondaryValue, item.subtitle]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    const pct = source.match(/(\d+(?:\.\d+)?)\s*%/);
    if (pct) return Number(pct[1]);

    const ratio = source.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
    if (ratio) {
        const a = Number(ratio[1]);
        const b = Number(ratio[2]);
        if (b > 0) return (a / b) * 100;
    }

    const multiplier = source.match(/(\d+(?:\.\d+)?)\s*[x×]/);
    if (multiplier) return Number(multiplier[1]) * 100;

    const pace = source.match(/(\d{1,2}):(\d{2})\s*\/\s*(km|mi)/);
    if (pace) {
        const paceMin = Number(pace[1]) + Number(pace[2]) / 60;
        if (paceMin > 0) return 100 / paceMin;
    }

    const durationMin = parseDurationMinutes(source);
    if (durationMin) return durationMin;

    const distanceKm = parseDistanceKm(source);
    if (distanceKm) return distanceKm;

    const bpm = source.match(/(\d+(?:\.\d+)?)\s*bpm/);
    if (bpm) return Number(bpm[1]);

    const firstNumber = source.match(/(\d+(?:\.\d+)?)/);
    return firstNumber ? Number(firstNumber[1]) : 0;
}

function getWowScore(item: WowItem): number {
    const baseWeight = WOW_TYPE_WEIGHTS[item.id] ?? 60;
    const magnitude = Math.max(0, extractWowMagnitude(item));
    const magnitudeBonus = Math.log10(magnitude + 1) * 12;
    return baseWeight + magnitudeBonus;
}

function rankWowItemsByScore(items: WowItem[]): WowItem[] {
    return items
        .map((item, originalIndex) => ({
            item,
            originalIndex,
            score: getWowScore(item),
        }))
        .sort((a, b) => b.score - a.score || a.originalIndex - b.originalIndex)
        .map((x) => x.item);
}

function selectTopWowItems(items: WowItem[], topCount = DEFAULT_TOP_WOW_COUNT): WowItem[] {
    return rankWowItemsByScore(items).slice(0, topCount);
}

export default function RecapPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const query = useMemo(() => parseRecapQuery(searchParams), [searchParams]);
    const { athleteProfile } = useAthleteProfile();
    const { loading, isFetching, connected, error, providerDisplayName, highlights, total, availableActivityTypes, breakdown, range, activeDays, activityDays } = useFetchRecap(searchParams.toString());
    const selectedActivityType = useMemo(() => {
        const raw = searchParams.get("activityType");
        if (!raw) return null;
        const trimmed = raw.trim();
        return trimmed ? trimmed : null;
    }, [searchParams]);
    const hasActivityTypeFilter = availableActivityTypes.length > 1;
    const showTotalsBreakdownActions = !selectedActivityType;
    const showOverallTrainingInsights = !selectedActivityType;

    const [units, setUnits] = useState<UnitSystem>(() => {
        const v = localStorage.getItem("recap.units");
        return v === "mi" ? "mi" : "km";
    });
    const [showAllWow, setShowAllWow] = useState(false);
    const [showBreakdownFab, setShowBreakdownFab] = useState(false);
    const [showWowFab, setShowWowFab] = useState(false);
    const [activeTotalsBreakdown, setActiveTotalsBreakdown] = useState<TotalsBreakdownMetric | null>(null);
    const [isActivityFilterMenuOpen, setIsActivityFilterMenuOpen] = useState(false);
    const [pendingActivityFilter, setPendingActivityFilter] = useState<string | null>(null);
    const breakdownRef = useRef<HTMLDivElement | null>(null);
    const wowHeaderRef = useRef<HTMLDivElement | null>(null);
    const activityFilterDropdownRef = useRef<HTMLDivElement | null>(null);
    const isTotalsBreakdownOpen = activeTotalsBreakdown !== null;

    useEffect(() => {
        localStorage.setItem("recap.units", units);
    }, [units]);

    useEffect(() => {
        if (!query) {
            navigate("/select", { replace: true });
        }
    }, [query, navigate]);

    const setActivityTypeFilter = useCallback((nextType: string | null, replace = false) => {
        const normalized = nextType?.trim() ? nextType.trim() : null;
        const currentRaw = searchParams.get("activityType");
        const current = currentRaw?.trim() ? currentRaw.trim() : null;
        if (current === normalized) return;

        const params = new URLSearchParams(searchParams);
        if (normalized) {
            params.set("activityType", normalized);
        } else {
            params.delete("activityType");
        }

        const nextSearch = params.toString();
        navigate(
            {
                pathname: location.pathname,
                search: nextSearch ? `?${nextSearch}` : "",
            },
            { replace }
        );
    }, [location.pathname, navigate, searchParams]);

    useEffect(() => {
        if (selectedActivityType) {
            localStorage.setItem(ACTIVITY_TYPE_STORAGE_KEY, selectedActivityType);
        } else {
            localStorage.removeItem(ACTIVITY_TYPE_STORAGE_KEY);
        }
    }, [selectedActivityType]);

    useEffect(() => {
        if (!query || selectedActivityType) return;
        const storedType = localStorage.getItem(ACTIVITY_TYPE_STORAGE_KEY)?.trim();
        if (!storedType) return;
        setActivityTypeFilter(storedType, true);
    }, [query, selectedActivityType, setActivityTypeFilter]);

    useEffect(() => {
        if (!total || !selectedActivityType) return;

        if (availableActivityTypes.length <= 1) {
            setActivityTypeFilter(null, true);
            return;
        }

        const selectedNormalized = selectedActivityType.toLowerCase();
        const isValid = availableActivityTypes.some(
            (type) => type.toLowerCase() === selectedNormalized
        );

        if (!isValid) {
            setActivityTypeFilter(null, true);
        }
    }, [availableActivityTypes, selectedActivityType, setActivityTypeFilter, total]);

    useEffect(() => {
        if (!hasActivityTypeFilter) {
            setIsActivityFilterMenuOpen(false);
        }
    }, [hasActivityTypeFilter]);

    useEffect(() => {
        if (!pendingActivityFilter) return undefined;
        if (loading || isFetching) return undefined;

        const timeout = window.setTimeout(() => {
            setPendingActivityFilter(null);
        }, 220);

        return () => window.clearTimeout(timeout);
    }, [isFetching, loading, pendingActivityFilter]);

    useEffect(() => {
        if (selectedActivityType) {
            setActiveTotalsBreakdown(null);
        }
    }, [selectedActivityType]);

    useEffect(() => {
        if (!isActivityFilterMenuOpen) return undefined;

        const onDocumentMouseDown = (event: MouseEvent) => {
            const target = event.target;
            if (!(target instanceof Node)) return;
            if (activityFilterDropdownRef.current?.contains(target)) return;
            setIsActivityFilterMenuOpen(false);
        };

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsActivityFilterMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", onDocumentMouseDown);
        window.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onDocumentMouseDown);
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [isActivityFilterMenuOpen]);

    useEffect(() => {
        if (!isTotalsBreakdownOpen) return undefined;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setActiveTotalsBreakdown(null);
            }
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        window.addEventListener("keydown", onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [isTotalsBreakdownOpen]);

    useEffect(() => {
        if (!total) {
            setActiveTotalsBreakdown(null);
        }
    }, [total]);

    const connectProvider = (providerType: string = "strava") => {
        const returnTo = location.pathname + location.search;
        window.location.href = `/api/provider/connect?provider=${providerType}&returnTo=${encodeURIComponent(returnTo)}`;
    };
    const scrollToBreakdown = () => {
        breakdownRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const scrollToWow = () => {
        wowHeaderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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

    const selectedActivityFilterLabel = useMemo(() => {
        if (!selectedActivityType) return "All activities";
        const matchedType =
            availableActivityTypes.find((type) => type.toLowerCase() === selectedActivityType.toLowerCase()) ??
            selectedActivityType;
        return `${getActivityEmoji(matchedType)} ${formatActivityTypeName(matchedType)}`;
    }, [availableActivityTypes, selectedActivityType]);
    const isActivityFilterLoading = pendingActivityFilter !== null;

    const selectActivityTypeFromMenu = (nextType: string | null) => {
        const normalized = nextType?.trim() ? nextType.trim() : null;
        const current = selectedActivityType?.trim() ? selectedActivityType.trim() : null;
        if (normalized === current) {
            setIsActivityFilterMenuOpen(false);
            return;
        }

        setPendingActivityFilter(normalized ?? ALL_ACTIVITIES_FILTER_VALUE);
        setShowAllWow(false);
        setActiveTotalsBreakdown(null);
        setActivityTypeFilter(normalized);
        setIsActivityFilterMenuOpen(false);
    };

    const totalDays = useMemo(() => {
        if (!range) return null;
        const start = new Date(range.startUtc);
        const end = new Date(range.endUtc);
        return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / MS_PER_DAY));
    }, [range]);

    const distanceBreakdownItems: TotalsBreakdownItem[] = useMemo(() => {
        if (!total || total.distanceM <= 0) return [];

        return breakdown
            .filter((item) => item.distanceM > 0)
            .slice()
            .sort((a, b) => b.distanceM - a.distanceM)
            .map((item) => {
                const rawPct = pct(item.distanceM, total.distanceM);
                return {
                    id: item.type,
                    emoji: getActivityEmoji(item.type),
                    label: getActivityDescription(item.type),
                    valueLabel: formatters.formatDistance(item.distanceM, 1),
                    widthPct: clampPct(rawPct),
                    pctLabel: formatShareLabel(rawPct),
                };
            });
    }, [breakdown, formatters, total]);

    const activitiesBreakdownItems: TotalsBreakdownItem[] = useMemo(() => {
        if (!total || total.activities <= 0) return [];

        return breakdown
            .filter((item) => item.activities > 0)
            .slice()
            .sort((a, b) => b.activities - a.activities)
            .map((item) => {
                const rawPct = pct(item.activities, total.activities);
                const valueLabel = `${item.activities} ${item.activities === 1 ? "activity" : "activities"}`;
                return {
                    id: item.type,
                    emoji: getActivityEmoji(item.type),
                    label: getActivityDescription(item.type),
                    valueLabel,
                    widthPct: clampPct(rawPct),
                    pctLabel: formatShareLabel(rawPct),
                };
            });
    }, [breakdown, total]);

    const timeBreakdownItems: TotalsBreakdownItem[] = useMemo(() => {
        if (!total || total.movingTimeSec <= 0) return [];

        return breakdown
            .filter((item) => item.movingTimeSec > 0)
            .slice()
            .sort((a, b) => b.movingTimeSec - a.movingTimeSec)
            .map((item) => {
                const rawPct = pct(item.movingTimeSec, total.movingTimeSec);
                return {
                    id: item.type,
                    emoji: getActivityEmoji(item.type),
                    label: getActivityDescription(item.type),
                    valueLabel: secondsToHms(item.movingTimeSec),
                    widthPct: clampPct(rawPct),
                    pctLabel: formatShareLabel(rawPct),
                };
            });
    }, [breakdown, total]);

    const elevationBreakdownItems: TotalsBreakdownItem[] = useMemo(() => {
        if (!total || total.elevationM <= 0) return [];

        return breakdown
            .filter((item) => item.elevationM > 0)
            .slice()
            .sort((a, b) => b.elevationM - a.elevationM)
            .map((item) => {
                const rawPct = pct(item.elevationM, total.elevationM);
                return {
                    id: item.type,
                    emoji: getActivityEmoji(item.type),
                    label: getActivityDescription(item.type),
                    valueLabel: formatters.formatElevation(item.elevationM),
                    widthPct: clampPct(rawPct),
                    pctLabel: formatShareLabel(rawPct),
                };
            });
    }, [breakdown, formatters, total]);

    const activeTotalsBreakdownConfig: TotalsBreakdownModalConfig | null = useMemo(() => {
        if (!total || !activeTotalsBreakdown) return null;

        if (activeTotalsBreakdown === "activities") {
            return {
                sectionLabel: "Totals · Activities breakdown",
                title: `${total.activities} total activities`,
                description: `Activity-type contribution for ${rangeLabel}`,
                items: activitiesBreakdownItems,
                emptyMessage: "No activity-count data available in this range.",
            };
        }

        if (activeTotalsBreakdown === "distance") {
            return {
                sectionLabel: "Totals · Distance breakdown",
                title: `${formatters.formatDistance(total.distanceM, 1)} total`,
                description: `Activity-type contribution for ${rangeLabel}`,
                items: distanceBreakdownItems,
                emptyMessage: "No distance data available in this range.",
            };
        }

        if (activeTotalsBreakdown === "time") {
            return {
                sectionLabel: "Totals · Time breakdown",
                title: `${secondsToHms(total.movingTimeSec)} total moving time`,
                description: `Activity-type contribution for ${rangeLabel}`,
                items: timeBreakdownItems,
                emptyMessage: "No moving-time data available in this range.",
            };
        }

        return {
            sectionLabel: "Totals · Elevation breakdown",
            title: `${formatters.formatElevation(total.elevationM)} total elevation`,
            description: `Activity-type contribution for ${rangeLabel}`,
            items: elevationBreakdownItems,
            emptyMessage: "No elevation data available in this range.",
        };
    }, [
        activeTotalsBreakdown,
        activitiesBreakdownItems,
        distanceBreakdownItems,
        elevationBreakdownItems,
        formatters,
        rangeLabel,
        timeBreakdownItems,
        total,
    ]);

    const trainingInsights: TrainingInsightsSection | null = useMemo(() => {
        if (!total) return null;

        const dayCount = Math.max(1, totalDays ?? 1);
        const activePct = pct(activeDays.length, dayCount);
        const longestStreak = computeLongestStreak(activeDays);
        const busiestWeek = computeBestSevenDayWindow(activeDays);
        const consistencyScore = Math.min(
            100,
            Math.round(
                activePct * 0.6 +
                    Math.min(100, (longestStreak / 14) * 100) * 0.25 +
                    Math.min(100, (busiestWeek / 7) * 100) * 0.15
            )
        );

        let consistencyTone: TrainingInsightTone = "caution";
        let consistencySummary = "Inconsistent training pattern this block.";
        let consistencyHintLine1 = "Set a minimum-day routine to protect momentum.";
        let consistencyHintLine2 = "Keep easy days truly easy so consistency can hold.";
        if (consistencyScore >= 80) {
            consistencyTone = "up";
            consistencySummary = "Strong consistency across the block.";
            consistencyHintLine1 = "Keep the rhythm repeatable instead of pushing every day.";
            consistencyHintLine2 = "Protect recovery so this consistency can compound.";
        } else if (consistencyScore >= 60) {
            consistencyTone = "steady";
            consistencySummary = "Good routine with some uneven patches.";
            consistencyHintLine1 = "Add one extra easy day each week to raise consistency.";
            consistencyHintLine2 = "Use short minimum sessions when schedule gets tight.";
        }

        const useDistanceBasis = total.distanceM > 0;
        const weekLoadValue = highlights?.longestWeeklyDistance
            ? (useDistanceBasis
                  ? highlights.longestWeeklyDistance.distanceM
                  : highlights.longestWeeklyDistance.movingTimeSec)
            : 0;
        const weekLoadTotal = useDistanceBasis ? total.distanceM : total.movingTimeSec;
        const weekLoadShare = pct(weekLoadValue, weekLoadTotal);

        const dayLoadValue = highlights?.mostActiveDay
            ? (useDistanceBasis
                  ? highlights.mostActiveDay.distanceM
                  : highlights.mostActiveDay.movingTimeSec)
            : 0;
        const dayLoadTotal = useDistanceBasis ? total.distanceM : total.movingTimeSec;
        const dayLoadShare = pct(dayLoadValue, dayLoadTotal);

        let loadTone: TrainingInsightTone = "up";
        let loadSummary = "Load distribution looks steady.";
        let loadHintLine1 = "Keep spreading key sessions through the week.";
        let loadHintLine2 = "Avoid stacking your two biggest sessions back-to-back.";
        if (weekLoadShare > 55 || dayLoadShare > 30) {
            loadTone = "caution";
            loadSummary = "Load is concentrated into a few big spikes.";
            loadHintLine1 = "Distribute hard sessions across more days to reduce spike risk.";
            loadHintLine2 = "Add a low-stress day after every peak session.";
        } else if (weekLoadShare > 45 || dayLoadShare > 22) {
            loadTone = "steady";
            loadSummary = "Moderate concentration in key days.";
            loadHintLine1 = "Keep one lighter day after big sessions to absorb load.";
            loadHintLine2 = "Use steady aerobic work between hard efforts.";
        }

        const topType = breakdown[0];
        const typeCount = breakdown.length;
        const topTimeShare = topType ? pct(topType.movingTimeSec, total.movingTimeSec) : 0;
        let mixTone: TrainingInsightTone = "up";
        let mixSummary = "Well-balanced training mix.";
        let mixHintLine1 = "Keep one anchor sport and one support mode.";
        let mixHintLine2 = "Rotate stress types so your overall load stays durable.";
        if (typeCount <= 1 || topTimeShare >= 75) {
            mixTone = "caution";
            mixSummary = "Training is very concentrated in one modality.";
            mixHintLine1 = "Add a low-stress support activity to improve durability.";
            mixHintLine2 = "Keep it easy so it complements, not competes.";
        } else if (topTimeShare >= 55) {
            mixTone = "steady";
            mixSummary = "Focused block with some variety support.";
            mixHintLine1 = "Keep the main sport priority while rotating support work.";
            mixHintLine2 = "Support sessions should feel easy, not like extra hard days.";
        }

        const avgHr = Math.round(highlights?.highestAvgHeartrateActivity?.averageHeartrate ?? 0);
        const maxHr = Math.round(highlights?.highestMaxHeartrateActivity?.maxHeartrate ?? 0);
        const hasPaceSignal = Boolean(
            highlights?.fastestPaceActivity || highlights?.best5kActivity || highlights?.best10kActivity
        );

        let intensityLevel = 0;
        if (maxHr >= 188 || avgHr >= 168) {
            intensityLevel = 2;
        } else if (maxHr >= 178 || avgHr >= 154) {
            intensityLevel = 1;
        }
        if (hasPaceSignal && intensityLevel < 2) intensityLevel += 1;

        const intensityLabel = intensityLevel === 2 ? "High" : intensityLevel === 1 ? "Moderate" : "Low";
        const intensityTone: TrainingInsightTone =
            intensityLevel === 2 ? "caution" : intensityLevel === 1 ? "steady" : "up";
        const intensitySummary =
            intensityLevel === 2
                ? "Block included repeated high-intensity signals."
                : intensityLevel === 1
                    ? "Intensity is present but generally controlled."
                    : "Mostly lower-intensity training signals.";
        const intensityHintLine1 =
            intensityLevel === 2
                ? "Prioritize sleep and easy sessions after hard efforts."
                : intensityLevel === 1
                    ? "Keep intensity polarized: hard days hard, easy days easy."
                    : "Add one controlled quality session each week if goals are performance-based.";
        const intensityHintLine2 =
            intensityLevel === 2
                ? "Treat the next day as recovery, not another test."
                : intensityLevel === 1
                    ? "Keep one full recovery slot before the next intensity touch."
                    : "Build gradually so quality work stays repeatable.";

        const intensitySecondaryParts: string[] = [];
        if (avgHr > 0) intensitySecondaryParts.push(`${avgHr} avg bpm`);
        if (maxHr > 0) intensitySecondaryParts.push(`${maxHr} max bpm`);
        if (hasPaceSignal) intensitySecondaryParts.push("pace efforts detected");

        const cards: TrainingInsight[] = [
            {
                id: "consistency",
                emoji: "📆",
                title: "Consistency",
                value: `${consistencyScore}/100`,
                secondary: `${Math.round(activePct)}% active days • ${longestStreak}d streak • ${busiestWeek}/7 busiest`,
                summary: consistencySummary,
                hintLine1: consistencyHintLine1,
                hintLine2: consistencyHintLine2,
                tone: consistencyTone,
            },
            {
                id: "load-balance",
                emoji: "⚖️",
                title: "Load balance",
                value: `${Math.round(weekLoadShare)}%`,
                secondary: `Top 7-day block • peak day ${Math.round(dayLoadShare)}%`,
                summary: loadSummary,
                hintLine1: loadHintLine1,
                hintLine2: loadHintLine2,
                tone: loadTone,
            },
            {
                id: "mix",
                emoji: "🎛️",
                title: "Training mix",
                value: `${Math.round(topTimeShare)}%`,
                secondary: topType
                    ? `${getActivityDescription(topType.type)} leads • ${typeCount} types`
                    : "No activity type mix available",
                summary: mixSummary,
                hintLine1: mixHintLine1,
                hintLine2: mixHintLine2,
                tone: mixTone,
            },
            {
                id: "intensity",
                emoji: "❤️‍🔥",
                title: "Intensity signal",
                value: intensityLabel,
                secondary: intensitySecondaryParts.join(" • ") || "No strong HR/pace intensity markers",
                summary: intensitySummary,
                hintLine1: intensityHintLine1,
                hintLine2: intensityHintLine2,
                tone: intensityTone,
            },
        ];

        const cautionCount = cards.filter((c) => c.tone === "caution").length;
        const upCount = cards.filter((c) => c.tone === "up").length;
        const summary =
            cautionCount >= 2
                ? "Training trend: strong workload, but concentration and intensity need careful recovery management."
                : cautionCount === 1
                    ? "Training trend: mostly solid progression with one area to monitor closely."
                    : upCount >= 3
                        ? "Training trend: consistent, balanced, and sustainable progression signals."
                        : "Training trend: steady block with clear forward momentum.";

        return {
            summary,
            cards,
        };
    }, [total, totalDays, activeDays, highlights, breakdown]);

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
                activityType: highlights.longestActivity.type,
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
                activityType: highlights.farthestActivity.type,
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
                activityType: highlights.biggestClimbActivity.type,
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
                    activityType: highlights.fastestPaceActivity.type,
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
                    activityType: highlights.best5kActivity.type,
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
                    activityType: highlights.best10kActivity.type,
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
                activityType: highlights.highestAvgHeartrateActivity.type,
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
                activityType: highlights.highestMaxHeartrateActivity.type,
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
                        activityType: top.type,
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

        // Longest weekly distance
        if (highlights?.longestWeeklyDistance && (highlights.longestWeeklyDistance.distanceM ?? 0) > 0) {
            const week = highlights.longestWeeklyDistance;
            items.push({
                id: "longest-week",
                emoji: "📈",
                title: "Longest week",
                value: formatters.formatDistance(week.distanceM, 1),
                secondaryValue: secondsToHms(week.movingTimeSec),
                subtitle: `${formatShortDateRange(week.startDate, week.endDate)} · ${week.activities} activities`,
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

        return items;
    }, [total, range, activeDays, highlights, formatters, breakdown, units]);

    const rankedWowItems = rankWowItemsByScore(wowItems);
    const topWowItems = selectTopWowItems(wowItems, DEFAULT_TOP_WOW_COUNT);
    const hasMoreWowItems = rankedWowItems.length > topWowItems.length;
    const visibleWowItems = showAllWow && hasMoreWowItems ? rankedWowItems : topWowItems;

    useEffect(() => {
        if (!total) {
            setShowBreakdownFab(false);
            setShowWowFab(false);
            return;
        }

        const getViewportHeight = () =>
            window.visualViewport?.height ?? window.innerHeight;

        const updateVisibility = () => {
            const viewportHeight = getViewportHeight();

            const target = breakdownRef.current;
            if (!target) {
                setShowBreakdownFab(false);
            } else {
                const rect = target.getBoundingClientRect();
                const shouldShow = rect.top > viewportHeight;
                setShowBreakdownFab(shouldShow);
            }

            const wowHeader = wowHeaderRef.current;
            if (wowItems.length === 0 || !wowHeader) {
                setShowWowFab(false);
            } else {
                const rect = wowHeader.getBoundingClientRect();
                const inView = rect.top < viewportHeight && rect.bottom > 0;
                const shouldShow = !inView;
                setShowWowFab(shouldShow);
            }
        };

        updateVisibility();
        window.addEventListener("scroll", updateVisibility, { passive: true });
        window.addEventListener("resize", updateVisibility);
        window.visualViewport?.addEventListener("resize", updateVisibility);
        window.visualViewport?.addEventListener("scroll", updateVisibility);
        return () => {
            window.removeEventListener("scroll", updateVisibility);
            window.removeEventListener("resize", updateVisibility);
            window.visualViewport?.removeEventListener("resize", updateVisibility);
            window.visualViewport?.removeEventListener("scroll", updateVisibility);
        };
    }, [total, wowItems.length]);

    const navGroups: NavGroup[] = [
        {
            id: "units",
            items: [
                { emoji: "🌍", label: "km", active: units === "km", onClick: () => setUnits("km") },
                { emoji: "🇺🇸", label: "mi", active: units === "mi", onClick: () => setUnits("mi") },
            ],
        },
    ];

    const navItems: NavItem[] = [];

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
                        <div className="recap-status-card mb-4">
                                {loading && (
                                    <div className="recap-status-loading mt-3">
                                        <PulseLoader label="Fetching activities… computing recap…" />
                                    </div>
                                )}
                                {error && <div className="recap-error-text mt-3">Error: {error}</div>}

                                {connected === false && (
                                    <div className="mt-3">
                                        <ConnectProviderPrompt
                                            message="Connect a provider (read-only) to generate your recap."
                                            onConnectStrava={() => connectProvider("strava")}
                                            onConnectIntervalsIcu={() => connectProvider("intervalsicu")}
                                            backButton={{
                                                label: "Back to select",
                                                onClick: () => navigate("/select"),
                                            }}
                                        />
                                    </div>
                                )}
                        </div>
                    )}

                    {total && (
                        <>
                            {/* Period selector — always visible */}
                            <div className="recap-period-bar mb-3">
                                <div className="recap-period-bar__info">
                                    <svg className="recap-period-bar__icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                    <span className="recap-period-bar__label">{headerTitle}</span>
                                    <span className="recap-period-bar__range">{rangeLabel}</span>
                                </div>
                                <button
                                    type="button"
                                    className="recap-period-bar__change"
                                    onClick={() => navigate("/select")}
                                >
                                    Change
                                </button>
                            </div>

                            {hasActivityTypeFilter && (
                                <div className="recap-activity-filter-panel mb-3">
                                    <div className="recap-activity-filter__label">Activity filter</div>
                                    <div
                                        ref={activityFilterDropdownRef}
                                        className="dropdown recap-activity-filter mt-2"
                                    >
                                        <button
                                            type="button"
                                            className={`btn dropdown-toggle recap-activity-filter__toggle ${isActivityFilterMenuOpen ? "show" : ""}`}
                                            aria-expanded={isActivityFilterMenuOpen}
                                            aria-label="Choose activity type filter"
                                            onClick={() => setIsActivityFilterMenuOpen((prev) => !prev)}
                                        >
                                            {selectedActivityFilterLabel}
                                        </button>
                                        <ul className={`dropdown-menu recap-activity-filter__menu ${isActivityFilterMenuOpen ? "show" : ""}`}>
                                            <li>
                                                <button
                                                    type="button"
                                                    className={`dropdown-item recap-activity-filter__item ${selectedActivityType ? "" : "active"}`}
                                                    onClick={() => selectActivityTypeFromMenu(null)}
                                                >
                                                    All activities
                                                </button>
                                            </li>
                                            {availableActivityTypes.map((type) => (
                                                <li key={type}>
                                                    <button
                                                        type="button"
                                                        className={`dropdown-item recap-activity-filter__item ${selectedActivityType?.toLowerCase() === type.toLowerCase() ? "active" : ""}`}
                                                        onClick={() => selectActivityTypeFromMenu(type)}
                                                    >
                                                        {`${getActivityEmoji(type)} ${formatActivityTypeName(type)}`}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <p className="recap-activity-filter__hint mb-0">
                                        Pick a sport to focus on that activity only. Use “All activities” to return to your full recap.
                                    </p>
                                    {isActivityFilterLoading && (
                                        <PulseLoader
                                            label="Rebuilding recap…"
                                            className="recap-activity-filter__loading"
                                        />
                                    )}
                                </div>
                            )}

                            <div className="recap-card mb-4">
                                <div className="p-3 p-md-4">
                                    <div>
                                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                                            <div className="recap-section-label">
                                                Totals · {headerTitle}
                                            </div>
                                            <div className="recap-range-label">{rangeLabel}</div>
                                        </div>
                                    <div className="row g-3">
                                        <div className="col-6 col-md-3">
                                            <Stat
                                                label="🎯 Activities"
                                                value={String(total.activities)}
                                                subLabel={totalDays ? `${num(total.activities / totalDays, 1)} avg/day` : undefined}
                                                action={
                                                    showTotalsBreakdownActions && activitiesBreakdownItems.length > 0 ? (
                                                        <BreakdownActionButton
                                                            dialogId={TOTALS_BREAKDOWN_DIALOG_ID}
                                                            label="Show activities breakdown"
                                                            onClick={() => setActiveTotalsBreakdown("activities")}
                                                        />
                                                    ) : undefined
                                                }
                                            />
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <Stat
                                                label="📏 Distance"
                                                value={formatters.formatDistance(total.distanceM, 1)}
                                                subLabel={totalDays ? `${formatters.formatDistance(total.distanceM / totalDays, 1)} avg/day` : undefined}
                                                action={
                                                    showTotalsBreakdownActions && distanceBreakdownItems.length > 0 ? (
                                                        <BreakdownActionButton
                                                            dialogId={TOTALS_BREAKDOWN_DIALOG_ID}
                                                            label="Show distance breakdown"
                                                            onClick={() => setActiveTotalsBreakdown("distance")}
                                                        />
                                                    ) : undefined
                                                }
                                            />
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <Stat
                                                label="⏱️ Time"
                                                value={secondsToHms(total.movingTimeSec)}
                                                subLabel={totalDays ? `${secondsToHms(Math.round(total.movingTimeSec / totalDays))} avg/day` : undefined}
                                                action={
                                                    showTotalsBreakdownActions && timeBreakdownItems.length > 0 ? (
                                                        <BreakdownActionButton
                                                            dialogId={TOTALS_BREAKDOWN_DIALOG_ID}
                                                            label="Show time breakdown"
                                                            onClick={() => setActiveTotalsBreakdown("time")}
                                                        />
                                                    ) : undefined
                                                }
                                            />
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <Stat
                                                label="⛰️ Elevation"
                                                value={formatters.formatElevation(total.elevationM)}
                                                subLabel={totalDays ? `${formatters.formatElevation(total.elevationM / totalDays)} avg/day` : undefined}
                                                action={
                                                    showTotalsBreakdownActions && elevationBreakdownItems.length > 0 ? (
                                                        <BreakdownActionButton
                                                            dialogId={TOTALS_BREAKDOWN_DIALOG_ID}
                                                            label="Show elevation breakdown"
                                                            onClick={() => setActiveTotalsBreakdown("elevation")}
                                                        />
                                                    ) : undefined
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="recap-section-divider" />
                                <div>
                                    <ActivityHeatmap
                                        startDate={range?.startUtc?.slice(0, 10)}
                                        endDate={range?.endUtc?.slice(0, 10)}
                                        activityDays={activityDays}
                                    />
                                </div>

                                {showOverallTrainingInsights && trainingInsights && (
                                    <>
                                    <div className="recap-section-divider" />
                                    <div>
                                        <div className="recap-section-label mb-2">Overall training insights</div>
                                        <div className="recap-training-trend">
                                            <div className="recap-training-trend__label">Training trend</div>
                                            <div className="recap-training-trend__value">{trainingInsights.summary}</div>
                                        </div>
                                        <div className="row g-2">
                                            {trainingInsights.cards.map((insight) => (
                                                <div key={insight.id} className="col-12 col-md-6">
                                                    <article className={`recap-training-card recap-training-card--${insight.tone}`}>
                                                        <div className="recap-training-card__head">
                                                            <div className="recap-training-card__title-wrap">
                                                                <span className="recap-training-card__emoji" aria-hidden="true">{insight.emoji}</span>
                                                                <div className="recap-training-card__title">{insight.title}</div>
                                                            </div>
                                                            <div className="recap-training-card__value">{insight.value}</div>
                                                        </div>
                                                        <div className="recap-training-card__secondary">{insight.secondary}</div>
                                                        <div className="recap-training-card__summary">{insight.summary}</div>
                                                        <div className="recap-training-card__hint">
                                                            <div className="recap-training-card__hint-line1">{insight.hintLine1}</div>
                                                            <div className="recap-training-card__hint-line2">{insight.hintLine2}</div>
                                                        </div>
                                                    </article>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    </>
                                )}

                                {wowItems.length > 0 && (
                                    <>
                                    <div className="recap-section-divider" />
                                    <div>
                                        <div
                                            ref={wowHeaderRef}
                                            className="recap-wow-header mb-2"
                                        >
                                            <div className="recap-section-label">Wow highlights</div>
                                            <div className="recap-wow-actions">
                                                {hasMoreWowItems && (
                                                    <button
                                                        type="button"
                                                        className="recap-wow-toggle"
                                                        onClick={() => setShowAllWow((prev) => !prev)}
                                                        aria-expanded={showAllWow}
                                                    >
                                                        {showAllWow ? "Show less" : `Show all (${wowItems.length})`}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <WowGrid items={visibleWowItems} />
                                    </div>
                                    </>
                                )}

                                <div className="recap-section-divider" />
                                <div ref={breakdownRef}>
                                    <div className="recap-section-label mb-2">Breakdown</div>
                                    <p className="recap-breakdown-intro">Contextual summary by activity type</p>
                                    <div className="row g-2">
                                        {breakdown.map((item) => {
                                            const activityGroup = getActivityGroup(item.type);
                                            const flyerParams = new URLSearchParams(location.search);
                                            flyerParams.set("activityGroup", activityGroup);
                                            const flyerUrl = `/flyer?${flyerParams.toString()}`;
                                            const share = getBreakdownShare(item.type, item);
                                            return (
                                                <div key={item.type} className="col-12 col-md-6">
                                                    <div className="recap-breakdown-item">
                                                        <div className="d-flex align-items-center justify-content-between gap-2 mb-1 flex-wrap">
                                                            <div className="d-flex align-items-center gap-2 min-w-0 breakdown-title-wrap">
                                                                <span className="fs-4" aria-hidden="true">{getActivityEmoji(item.type)}</span>
                                                                <div className="breakdown-title text-truncate">{getActivityDescription(item.type)}</div>
                                                            </div>
                                                            <Link
                                                                to={flyerUrl}
                                                                className="recap-breakdown-flyer-link flex-shrink-0"
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
                                                <div className="recap-breakdown-empty">No activities in this range.</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {total && activeTotalsBreakdownConfig && (
                <TotalsBreakdownModal
                    open={true}
                    dialogId={TOTALS_BREAKDOWN_DIALOG_ID}
                    sectionLabel={activeTotalsBreakdownConfig.sectionLabel}
                    title={activeTotalsBreakdownConfig.title}
                    description={activeTotalsBreakdownConfig.description}
                    items={activeTotalsBreakdownConfig.items}
                    emptyMessage={activeTotalsBreakdownConfig.emptyMessage}
                    onClose={() => setActiveTotalsBreakdown(null)}
                />
            )}

            {total && (showBreakdownFab || showWowFab) && (
                <>
                    {showWowFab && (
                        <button
                            type="button"
                            className="recap-wow-fab recap-fab"
                            onClick={scrollToWow}
                            aria-label="Scroll to wow highlights section"
                            title="Jump to wow highlights"
                        >
                            ⬆️ WOW
                        </button>
                    )}
                    <button
                        type="button"
                        className="recap-breakdown-fab recap-fab"
                        onClick={scrollToBreakdown}
                        aria-label="Scroll to breakdown section"
                        title="Jump to breakdown"
                    >
                        ⬇️ Breakdown
                    </button>
                </>
            )}
        </PageShell>
    );
}
