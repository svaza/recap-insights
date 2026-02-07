import { useMemo, useState, useCallback, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import "./ActivityHeatmap.css";

// ── Mock data types (self-contained for dummy/presentation mode) ──

type EffortMetric = "distance" | "time" | "none";

type HeatmapDay = {
    date: string;          // YYYY-MM-DD
    count: number;         // number of activities
    totalMinutes: number;  // total moving time in minutes
    distanceMiles: number; // total distance in miles for that day
    effortScore: number;   // 0..100 (from API when available, otherwise derived)
    effortMetric: EffortMetric;
    effortValue: number;
    effortType: string | null;
    types: string[];       // activity type labels
};

type HeatmapDayWithLevel = HeatmapDay & {
    level: 0 | 1 | 2 | 3 | 4;
};

type HeatmapActivityDayInput = {
    date: string;
    activities: number;
    distanceM: number;
    movingTimeSec: number;
    effortScore?: number;
    effortMetric?: string;
    effortValue?: number;
    effortType?: string | null;
    types: string[];
};

type HeatmapProps = {
    /** If provided, restrict the heatmap to this date range. */
    startDate?: string;
    endDate?: string;
    /** If provided, heatmap uses this real activity-day data (no mock fallback). */
    activityDays?: HeatmapActivityDayInput[];
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const METERS_PER_MILE = 1609.344;
const HEATMAP_TOOLTIP_ID = "activity-heatmap-tooltip";
const HEATMAP_HELP_DIALOG_ID = "activity-heatmap-help-dialog";
const TIME_BASED_TYPES = new Set([
    "Crossfit",
    "HighIntensityIntervalTraining",
    "Pilates",
    "StrengthTraining",
    "WeightTraining",
    "Workout",
    "Yoga",
]);

function startOfLocalDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDateKey(date: Date): string {
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function parseDateKey(dateStr?: string): Date | null {
    if (!dateStr) return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(year, month - 1, day);

    if (
        date.getFullYear() !== year
        || date.getMonth() !== month - 1
        || date.getDate() !== day
    ) {
        return null;
    }

    return date;
}

function hashStringSeed(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        hash = (hash * 31 + input.charCodeAt(i)) % 2147483647;
    }
    return hash <= 0 ? 1 : hash;
}

function normalizeTypes(types: unknown): string[] {
    if (!Array.isArray(types)) return [];
    return [...new Set(types.map((type) => String(type ?? "").trim()).filter(Boolean))];
}

function metersToMiles(meters: number): number {
    return meters / METERS_PER_MILE;
}

function isTimeBasedType(type: string): boolean {
    return TIME_BASED_TYPES.has(type);
}

function resolveDailyEffort(count: number, distanceMiles: number, totalMinutes: number, types: string[]): {
    metric: EffortMetric;
    value: number;
} {
    const normalizedTypes = normalizeTypes(types);
    const hasDistanceStyleType = normalizedTypes.some((type) => !isTimeBasedType(type));
    const hasOnlyTimeStyleTypes = normalizedTypes.length > 0 && normalizedTypes.every((type) => isTimeBasedType(type));

    if (hasDistanceStyleType && distanceMiles > 0) {
        return { metric: "distance", value: distanceMiles };
    }

    if (hasOnlyTimeStyleTypes && totalMinutes > 0) {
        return { metric: "time", value: totalMinutes };
    }

    if (distanceMiles > 0) {
        return { metric: "distance", value: distanceMiles };
    }

    if (totalMinutes > 0) {
        return { metric: "time", value: totalMinutes };
    }

    if (count > 0) {
        return { metric: "time", value: 1 };
    }

    return { metric: "none", value: 0 };
}

function createHeatmapDay(params: {
    date: string;
    count: number;
    totalMinutes: number;
    distanceMiles: number;
    effortScore?: number;
    effortMetric?: EffortMetric;
    effortValue?: number;
    effortType?: string | null;
    types: string[];
}): HeatmapDay {
    const count = Math.max(0, Math.round(params.count || 0));
    const totalMinutes = Math.max(0, Math.round(params.totalMinutes || 0));
    const distanceMiles = Math.max(0, params.distanceMiles || 0);
    const types = normalizeTypes(params.types);
    const effort = resolveDailyEffort(count, distanceMiles, totalMinutes, types);
    const effortMetric = params.effortMetric ?? effort.metric;
    const effortValue = typeof params.effortValue === "number" ? Math.max(0, params.effortValue) : effort.value;
    const effortScore = typeof params.effortScore === "number"
        ? Math.max(0, Math.min(100, Math.round(params.effortScore)))
        : -1;
    const effortType = typeof params.effortType === "string" && params.effortType.trim().length > 0
        ? params.effortType.trim()
        : null;

    return {
        date: params.date,
        count,
        totalMinutes,
        distanceMiles,
        effortScore,
        effortMetric,
        effortValue,
        effortType,
        types,
    };
}

function toEffortLevelFromScore(score: number): 0 | 1 | 2 | 3 | 4 {
    if (score <= 0) return 0;
    if (score <= 25) return 1;
    if (score <= 50) return 2;
    if (score <= 75) return 3;
    return 4;
}

function addEffortLevels(days: HeatmapDay[]): HeatmapDayWithLevel[] {
    const maxDistanceEffort = days.reduce((max, day) => {
        if (day.effortMetric !== "distance") return max;
        return Math.max(max, day.effortValue);
    }, 0);

    const maxTimeEffort = days.reduce((max, day) => {
        if (day.effortMetric !== "time") return max;
        return Math.max(max, day.effortValue);
    }, 0);

    return days.map((day) => {
        if (day.effortScore >= 0) {
            return {
                ...day,
                level: toEffortLevelFromScore(day.effortScore),
            };
        }

        let derivedScore = 0;
        if (day.effortMetric === "distance" && maxDistanceEffort > 0) {
            derivedScore = Math.round((day.effortValue / maxDistanceEffort) * 100);
        } else if (day.effortMetric === "time" && maxTimeEffort > 0) {
            derivedScore = Math.round((day.effortValue / maxTimeEffort) * 100);
        }

        return {
            ...day,
            effortScore: derivedScore,
            level: toEffortLevelFromScore(derivedScore),
        };
    });
}

// ── Mock data generator ──

const MOCK_ACTIVITY_TYPES = ["Run", "Ride", "Swim", "Hike", "Workout", "Walk", "Yoga"];

function seededRandom(seed: number) {
    let s = seed;
    return () => {
        s = (s * 16807 + 0) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

function estimateMockDistanceMiles(types: string[], totalMinutes: number, rand: () => number): number {
    if (types.length === 0) return 0;
    const hasDistanceType = types.some((type) => !isTimeBasedType(type));
    if (!hasDistanceType) return 0;

    const primaryType = types[0];
    const paceMiPerMinute =
        primaryType === "Ride" ? 0.28 :
            primaryType === "Swim" ? 0.03 :
                primaryType === "Walk" || primaryType === "Hike" ? 0.045 :
                    0.1;
    const jitter = 0.82 + rand() * 0.36;
    return Number(Math.max(0, totalMinutes * paceMiPerMinute * jitter).toFixed(2));
}

function generateMockData(start: Date, end: Date): HeatmapDay[] {
    const days: HeatmapDay[] = [];
    const cursor = startOfLocalDay(start);
    const endDay = startOfLocalDay(end);

    while (cursor <= endDay) {
        const dateStr = formatDateKey(cursor);
        const dayOfWeek = cursor.getDay();
        const absoluteWeekNum = Math.floor(cursor.getTime() / (7 * MS_PER_DAY));
        const rand = seededRandom(hashStringSeed(dateStr));

        // Create realistic training patterns:
        // - Higher activity on weekdays, especially Tue/Thu/Sat
        // - Rest days on some Mondays/Fridays
        // - Occasional double days
        // - Training blocks that ebb and flow
        const blockPhase = Math.sin(absoluteWeekNum * 0.6) * 0.3 + 0.5;
        const dayBias =
            dayOfWeek === 0 ? 0.35 :   // Sunday — moderate
            dayOfWeek === 1 ? 0.25 :    // Monday — rest-ish
            dayOfWeek === 2 ? 0.72 :    // Tuesday — key session
            dayOfWeek === 3 ? 0.55 :    // Wednesday — moderate
            dayOfWeek === 4 ? 0.7 :     // Thursday — key session
            dayOfWeek === 5 ? 0.3 :     // Friday — rest-ish
            0.65;                        // Saturday — long session

        const probability = Math.min(0.92, dayBias * blockPhase + 0.1);
        const roll = rand();

        if (roll < probability) {
            const isDouble = rand() < 0.12;
            const count = isDouble ? 2 : 1;
            const baseMinutes = 30 + Math.floor(rand() * 60);
            const totalMinutes = count === 2 ? baseMinutes + 20 + Math.floor(rand() * 40) : baseMinutes;

            // Pick activity types
            const types: string[] = [];
            const primaryIdx = Math.floor(rand() * 3); // bias toward Run/Ride/Swim
            types.push(MOCK_ACTIVITY_TYPES[primaryIdx]);
            if (count === 2) {
                const secondIdx = Math.floor(rand() * MOCK_ACTIVITY_TYPES.length);
                if (secondIdx !== primaryIdx) {
                    types.push(MOCK_ACTIVITY_TYPES[secondIdx]);
                }
            }

            const distanceMiles = estimateMockDistanceMiles(types, totalMinutes, rand);
            days.push(createHeatmapDay({ date: dateStr, count, totalMinutes, distanceMiles, types }));
        } else {
            days.push(createHeatmapDay({ date: dateStr, count: 0, totalMinutes: 0, distanceMiles: 0, types: [] }));
        }

        cursor.setDate(cursor.getDate() + 1);
    }

    return days;
}

// ── Helpers ──

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatTooltipDate(dateStr: string): string {
    const d = parseDateKey(dateStr);
    if (!d) return dateStr;
    return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function buildDataFromProvidedDays(start: Date, end: Date, dayMap: Map<string, HeatmapDay>): HeatmapDay[] {
    const days: HeatmapDay[] = [];
    const cursor = startOfLocalDay(start);
    const endDay = startOfLocalDay(end);

    while (cursor <= endDay) {
        const dateStr = formatDateKey(cursor);
        const existing = dayMap.get(dateStr);

        days.push(existing ?? createHeatmapDay({
            date: dateStr,
            count: 0,
            totalMinutes: 0,
            distanceMiles: 0,
            types: [],
        }));

        cursor.setDate(cursor.getDate() + 1);
    }

    return days;
}

function formatEffort(day: HeatmapDay): string {
    if (day.effortMetric === "distance") {
        return `${day.effortValue.toFixed(day.effortValue >= 10 ? 0 : 1)} mi`;
    }
    if (day.effortMetric === "time") {
        return `${Math.round(day.effortValue)} min`;
    }
    return "n/a";
}

function formatMaxEffort(day: HeatmapDay): string {
    const typePrefix = day.effortType ? `${day.effortType} · ` : "";
    const scoreSuffix = day.effortScore > 0 ? ` (${day.effortScore}/100)` : "";
    return `${typePrefix}${formatEffort(day)}${scoreSuffix}`;
}

function describeDayForA11y(day: HeatmapDay): string {
    const dateLabel = formatTooltipDate(day.date);
    if (day.count <= 0) return `${dateLabel}. No activities.`;

    const activityLabel = day.count === 1 ? "activity" : "activities";
    const effortLabel = `Max effort ${formatMaxEffort(day)}`;
    const typesLabel = day.types.length > 0 ? `. Types: ${day.types.join(", ")}.` : ".";
    return `${dateLabel}. ${day.count} ${activityLabel}. ${effortLabel}${typesLabel}`;
}

type WeekColumn = {
    weekIndex: number;
    monthLabel: string | null;
    cells: (HeatmapDayWithLevel & { outside?: boolean })[];
};

function buildWeeks(data: HeatmapDayWithLevel[], start: Date, end: Date): WeekColumn[] {
    const dayMap = new Map<string, HeatmapDayWithLevel>();
    for (const d of data) dayMap.set(d.date, d);

    // Find the Monday on or before `start`
    const startDay = start.getDay(); // 0=Sun
    const mondayOffset = startDay === 0 ? -6 : 1 - startDay;
    const gridStart = startOfLocalDay(start);
    gridStart.setDate(gridStart.getDate() + mondayOffset);
    const endDay = startOfLocalDay(end);

    // Build grid until we pass `end`
    const weeks: WeekColumn[] = [];
    const cursor = new Date(gridStart);
    let currentWeek: WeekColumn["cells"] = [];
    let weekIndex = 0;
    let lastMonth = -1;

    while (true) {
        const dateStr = formatDateKey(cursor);
        const dayOfWeekMondayBased = (cursor.getDay() + 6) % 7; // 0=Mon ... 6=Sun
        const isOutside = cursor < start || cursor > endDay;
        const existing = dayMap.get(dateStr);

        currentWeek.push({
            date: dateStr,
            count: existing?.count ?? 0,
            totalMinutes: existing?.totalMinutes ?? 0,
            distanceMiles: existing?.distanceMiles ?? 0,
            effortScore: existing?.effortScore ?? 0,
            effortMetric: existing?.effortMetric ?? "none",
            effortValue: existing?.effortValue ?? 0,
            effortType: existing?.effortType ?? null,
            types: existing?.types ?? [],
            level: existing?.level ?? 0,
            outside: isOutside,
        });

        if (dayOfWeekMondayBased === 6 || cursor >= endDay) {
            // Determine month label — show it on the first week of each month
            const firstVisibleCell = currentWeek.find((c) => !c.outside && c.date !== "");
            const firstVisibleDate = firstVisibleCell ? parseDateKey(firstVisibleCell.date) : null;
            const monthNum = firstVisibleCell
                ? firstVisibleDate?.getMonth() ?? -1
                : -1;
            const showMonthLabel = monthNum !== -1 && monthNum !== lastMonth;
            if (showMonthLabel) lastMonth = monthNum;

            // Pad week to 7 cells if incomplete
            while (currentWeek.length < 7) {
                currentWeek.push({
                    date: "",
                    count: 0,
                    totalMinutes: 0,
                    distanceMiles: 0,
                    effortScore: 0,
                    effortMetric: "none",
                    effortValue: 0,
                    effortType: null,
                    types: [],
                    level: 0,
                    outside: true,
                });
            }

            weeks.push({
                weekIndex,
                monthLabel: showMonthLabel ? SHORT_MONTHS[monthNum] : null,
                cells: currentWeek,
            });

            weekIndex++;
            currentWeek = [];

            if (cursor >= endDay) break;
        }

        cursor.setDate(cursor.getDate() + 1);
    }

    return weeks;
}

// ── Tooltip ──

type TooltipData = {
    day: HeatmapDay;
    x: number;
    y: number;
};

function Tooltip({ id, data }: { id: string; data: TooltipData }) {
    const { day, x, y } = data;
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const [style, setStyle] = useState<React.CSSProperties>({
        left: x,
        top: y - 8,
        transform: "translate(-50%, -100%)",
        visibility: "hidden",
    });

    useLayoutEffect(() => {
        const tooltipEl = tooltipRef.current;
        if (!tooltipEl) return;

        const margin = 8;
        const rect = tooltipEl.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const halfWidth = rect.width / 2;
        const clampedX = Math.max(
            margin + halfWidth,
            Math.min(x, viewportWidth - margin - halfWidth)
        );

        const canPlaceAbove = y - rect.height - margin >= 0;
        const top = canPlaceAbove
            ? y - 8
            : Math.min(viewportHeight - margin - rect.height, y + 10);
        const transform = canPlaceAbove ? "translate(-50%, -100%)" : "translate(-50%, 0)";

        setStyle({
            left: clampedX,
            top,
            transform,
            visibility: "visible",
        });
    }, [x, y, day.date]);

    return createPortal(
        <div id={id} ref={tooltipRef} className="heatmap__tooltip" style={style}>
            <div className="heatmap__tooltip-date">{formatTooltipDate(day.date)}</div>
            <div className="heatmap__tooltip-count">
                {day.count === 0
                    ? "No activities"
                    : day.count === 1
                      ? "1 activity"
                      : `${day.count} activities`}
                {day.count > 0 && ` · Max effort: ${formatMaxEffort(day)}`}
            </div>
            {day.types.length > 0 && (
                <div className="heatmap__tooltip-types">{day.types.join(", ")}</div>
            )}
        </div>,
        document.body
    );
}

// ── Component ──

export default function ActivityHeatmap({ startDate, endDate, activityDays }: HeatmapProps) {
    const resolvedRange = useMemo(() => {
        const today = startOfLocalDay(new Date());
        const defaultStart = new Date(today.getFullYear(), 0, 1);

        let rangeStart = parseDateKey(startDate) ?? defaultStart;
        let rangeEnd = parseDateKey(endDate) ?? today;

        if (rangeStart > rangeEnd) {
            [rangeStart, rangeEnd] = [rangeEnd, rangeStart];
        }

        return {
            start: rangeStart,
            end: rangeEnd,
        };
    }, [startDate, endDate]);

    const hasProvidedActivityDays = Array.isArray(activityDays);
    const providedDayMap = useMemo(() => {
        const map = new Map<string, HeatmapDay>();
        if (!activityDays) return map;

        for (const day of activityDays) {
            const parsedDate = parseDateKey(day.date);
            if (!parsedDate) continue;

            const date = formatDateKey(parsedDate);
            const count = Math.max(0, Math.round(Number(day.activities) || 0));
            const movingTimeSec = Math.max(0, Number(day.movingTimeSec) || 0);
            const totalMinutes = movingTimeSec > 0 ? Math.max(1, Math.round(movingTimeSec / 60)) : 0;
            const distanceM = Math.max(0, Number(day.distanceM) || 0);
            const distanceMiles = metersToMiles(distanceM);
            const effortMetric: EffortMetric =
                day.effortMetric === "distance" || day.effortMetric === "time"
                    ? day.effortMetric
                    : "none";

            map.set(date, createHeatmapDay({
                date,
                count,
                totalMinutes,
                distanceMiles,
                effortScore: day.effortScore,
                effortMetric,
                effortValue: day.effortValue,
                effortType: day.effortType,
                types: day.types,
            }));
        }

        return map;
    }, [activityDays]);

    const data = useMemo(
        () => hasProvidedActivityDays
            ? buildDataFromProvidedDays(resolvedRange.start, resolvedRange.end, providedDayMap)
            : generateMockData(resolvedRange.start, resolvedRange.end),
        [hasProvidedActivityDays, providedDayMap, resolvedRange.start, resolvedRange.end]
    );
    const dataWithLevels = useMemo(() => addEffortLevels(data), [data]);
    const weeks = useMemo(
        () => buildWeeks(dataWithLevels, resolvedRange.start, resolvedRange.end),
        [dataWithLevels, resolvedRange.start, resolvedRange.end]
    );

    // Compute dynamic cell sizing based on period length
    const gridStyle = useMemo((): React.CSSProperties => {
        const weekCount = weeks.length;
        // Scale cells to fill space for short periods, cap at reasonable max
        if (weekCount <= 2) {
            return {
                "--cell-size": "36px",
                "--cell-gap": "5px",
                "--cell-radius": "5px",
                "--day-label-font": "0.72rem",
                "--month-label-font": "0.72rem",
                "--month-label-height": "22px",
                "--date-label-width": "18px",
                "--date-font": "0.62rem",
            } as React.CSSProperties;
        }
        if (weekCount <= 5) {
            return {
                "--cell-size": "28px",
                "--cell-gap": "4px",
                "--cell-radius": "4px",
                "--day-label-font": "0.66rem",
                "--month-label-font": "0.66rem",
                "--month-label-height": "20px",
                "--date-label-width": "16px",
                "--date-font": "0.58rem",
            } as React.CSSProperties;
        }
        if (weekCount <= 9) {
            return {
                "--cell-size": "20px",
                "--cell-gap": "3px",
                "--cell-radius": "3px",
                "--day-label-font": "0.6rem",
                "--month-label-font": "0.6rem",
                "--month-label-height": "18px",
                "--date-label-width": "14px",
                "--date-font": "0.52rem",
            } as React.CSSProperties;
        }
        // 10+ weeks (quarter/year): default small, hide date labels
        return {
            "--date-label-width": "0px",
            "--date-font": "0px",
        } as React.CSSProperties;
    }, [weeks.length]);

    const activeDayCount = data.filter((d) => d.count > 0).length;
    const totalActivities = data.reduce((sum, d) => sum + d.count, 0);
    const totalDays = data.length;

    const [tooltip, setTooltip] = useState<TooltipData | null>(null);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const tooltipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearTooltipTimeout = useCallback(() => {
        if (tooltipTimeout.current) {
            clearTimeout(tooltipTimeout.current);
            tooltipTimeout.current = null;
        }
    }, []);

    const showTooltipFromTarget = useCallback((day: HeatmapDay, target: HTMLElement) => {
        if (!day.date) return;
        clearTooltipTimeout();
        const rect = target.getBoundingClientRect();
        setTooltip({
            day,
            x: rect.left + rect.width / 2,
            y: rect.top,
        });
    }, [clearTooltipTimeout]);

    const toggleTooltipFromTarget = useCallback((day: HeatmapDay, target: HTMLElement) => {
        if (!day.date) return;
        clearTooltipTimeout();
        const rect = target.getBoundingClientRect();

        setTooltip((current) => {
            if (current?.day.date === day.date) {
                return null;
            }

            return {
                day,
                x: rect.left + rect.width / 2,
                y: rect.top,
            };
        });
    }, [clearTooltipTimeout]);

    const hideTooltip = useCallback((delayMs = 80) => {
        clearTooltipTimeout();
        if (delayMs <= 0) {
            setTooltip(null);
            return;
        }

        tooltipTimeout.current = setTimeout(() => {
            setTooltip(null);
            tooltipTimeout.current = null;
        }, delayMs);
    }, [clearTooltipTimeout]);

    const handleCellEnter = useCallback((day: HeatmapDay, event: React.MouseEvent<HTMLDivElement>) => {
        showTooltipFromTarget(day, event.currentTarget);
    }, [showTooltipFromTarget]);

    const handleCellLeave = useCallback(() => {
        hideTooltip(80);
    }, [hideTooltip]);

    const handleCellFocus = useCallback((day: HeatmapDay, event: React.FocusEvent<HTMLDivElement>) => {
        showTooltipFromTarget(day, event.currentTarget);
    }, [showTooltipFromTarget]);

    const handleCellBlur = useCallback(() => {
        hideTooltip(0);
    }, [hideTooltip]);

    const handleCellClick = useCallback((day: HeatmapDay, event: React.MouseEvent<HTMLDivElement>) => {
        toggleTooltipFromTarget(day, event.currentTarget);
    }, [toggleTooltipFromTarget]);

    const handleCellKeyDown = useCallback((day: HeatmapDay, event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        toggleTooltipFromTarget(day, event.currentTarget);
    }, [toggleTooltipFromTarget]);

    useEffect(() => {
        return () => {
            clearTooltipTimeout();
        };
    }, [clearTooltipTimeout]);

    useEffect(() => {
        if (!tooltip) return undefined;

        const dismissTooltip = () => {
            setTooltip(null);
        };

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                dismissTooltip();
            }
        };

        window.addEventListener("resize", dismissTooltip);
        window.addEventListener("scroll", dismissTooltip, true);
        window.addEventListener("keydown", onKeyDown);

        return () => {
            window.removeEventListener("resize", dismissTooltip);
            window.removeEventListener("scroll", dismissTooltip, true);
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [tooltip]);

    useEffect(() => {
        if (!showHelpModal) return undefined;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setShowHelpModal(false);
            }
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [showHelpModal]);

    const isCompact = weeks.length <= 5;

    return (
        <div className={`heatmap${isCompact ? " heatmap--compact" : ""}`} style={gridStyle}>
            <div className="heatmap__header">
                <div className="heatmap__header-top">
                    <div className="recap-section-label">Activity frequency</div>
                    <button
                        type="button"
                        className="heatmap__help-btn"
                        onClick={() => setShowHelpModal(true)}
                        aria-label="Explain heatmap effort scoring"
                        aria-haspopup="dialog"
                        aria-controls={HEATMAP_HELP_DIALOG_ID}
                    >
                        ?
                    </button>
                </div>
                <div className="heatmap__summary">
                    <strong>{totalActivities}</strong> activities across <strong>{activeDayCount}</strong>/{totalDays} days · intensity shows relative effort
                </div>
            </div>

            <div className="heatmap__scroll">
                <div className="heatmap__grid">
                    {/* Day-of-week labels */}
                    <div className="heatmap__day-labels">
                        {DAY_LABELS.map((label, i) => (
                            <div key={i} className="heatmap__day-label">
                                {label}
                            </div>
                        ))}
                    </div>

                    {/* Week columns */}
                    <div className="heatmap__weeks">
                        {weeks.map((week) => (
                            <div key={week.weekIndex} className="heatmap__week">
                                {/* Month label row */}
                                <div className="heatmap__month-label">
                                    {week.monthLabel ?? "\u00A0"}
                                </div>

                                {/* Day cells */}
                                {week.cells.map((cell, cellIdx) => {
                                    const dayNum = cell.date && !cell.outside
                                        ? Number(cell.date.slice(8, 10))
                                        : null;
                                    const isInteractive = cell.date !== "" && !cell.outside;
                                    const isTooltipActive = tooltip?.day.date === cell.date;
                                    return (
                                        <div
                                            key={cellIdx}
                                            className={[
                                                "heatmap__cell-row",
                                                cell.outside ? "heatmap__cell-row--outside" : "",
                                                cell.date === "" ? "heatmap__cell-row--empty" : "",
                                            ]
                                                .filter(Boolean)
                                                .join(" ")}
                                        >
                                            <div
                                                className={[
                                                    "heatmap__cell",
                                                    `heatmap__cell--L${cell.level}`,
                                                    isTooltipActive ? "heatmap__cell--active" : "",
                                                ]
                                                    .filter(Boolean)
                                                    .join(" ")}
                                                role={isInteractive ? "button" : undefined}
                                                tabIndex={isInteractive ? 0 : undefined}
                                                aria-label={isInteractive ? describeDayForA11y(cell) : undefined}
                                                aria-describedby={isInteractive && isTooltipActive ? HEATMAP_TOOLTIP_ID : undefined}
                                                onMouseEnter={isInteractive ? (event) => handleCellEnter(cell, event) : undefined}
                                                onMouseLeave={isInteractive ? handleCellLeave : undefined}
                                                onFocus={isInteractive ? (event) => handleCellFocus(cell, event) : undefined}
                                                onBlur={isInteractive ? handleCellBlur : undefined}
                                                onClick={isInteractive ? (event) => handleCellClick(cell, event) : undefined}
                                                onKeyDown={isInteractive ? (event) => handleCellKeyDown(cell, event) : undefined}
                                            />
                                            {dayNum !== null && (
                                                <span className="heatmap__cell-date">{dayNum}</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="heatmap__legend">
                <span className="heatmap__legend-label">Less effort</span>
                {([0, 1, 2, 3, 4] as const).map((level) => (
                    <div
                        key={level}
                        className={`heatmap__legend-cell heatmap__cell--L${level}`}
                    />
                ))}
                <span className="heatmap__legend-label">More effort</span>
            </div>

            {showHelpModal && (
                <div
                    className="heatmap-help-backdrop"
                    role="presentation"
                    onClick={() => setShowHelpModal(false)}
                >
                    <section
                        id={HEATMAP_HELP_DIALOG_ID}
                        className="heatmap-help-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="heatmap-help-title"
                        aria-describedby="heatmap-help-desc"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="heatmap-help-modal__close"
                            onClick={() => setShowHelpModal(false)}
                            aria-label="Close"
                        >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                        </button>

                        <header className="heatmap-help-modal__header">
                            <div className="heatmap-help-modal__eyebrow">Heatmap Guide</div>
                            <h2 id="heatmap-help-title" className="heatmap-help-modal__title">
                                How effort colors are calculated
                            </h2>
                            <p id="heatmap-help-desc" className="heatmap-help-modal__desc">
                                The heatmap is contextual by sport type in your selected range. It compares each activity only against others of the same type.
                            </p>
                        </header>

                        <div className="heatmap-help-modal__divider" />

                        <div className="heatmap-help-modal__content">
                            <article className="heatmap-help-modal__card">
                                <h3>1) Metric per sport type</h3>
                                <p>
                                    Distance-based types (Run, Ride, Walk, TrailRun, Swim, etc.) use distance.
                                    Time-based types (Yoga, StrengthTraining, WeightTraining, Workout, Crossfit, HIIT, Pilates) use duration.
                                </p>
                            </article>
                            <article className="heatmap-help-modal__card">
                                <h3>2) Relative score (0-100)</h3>
                                <p>
                                    For each sport type, every activity gets an effort score from 0 to 100 using the min and max effort in the selected period.
                                    This applies to all activity types (for example: Run, TrailRun, Ride, Swim, Walk, Yoga, StrengthTraining), and each type is scored independently.
                                </p>
                            </article>
                            <article className="heatmap-help-modal__card">
                                <h3>3) Daily color level</h3>
                                <p>
                                    A day can have multiple activities. The cell color uses that day&apos;s highest effort-scored activity.
                                    Higher score means stronger color.
                                </p>
                            </article>
                            <article className="heatmap-help-modal__card">
                                <h3>4) Tooltip value</h3>
                                <p>
                                    Clicking a day shows: max-effort sport type, effort value (miles or minutes), and the score used for color mapping.
                                </p>
                            </article>
                        </div>
                    </section>
                </div>
            )}

            {tooltip && <Tooltip id={HEATMAP_TOOLTIP_ID} data={tooltip} />}
        </div>
    );
}
