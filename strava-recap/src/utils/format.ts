import type { RecapQuery } from "../models/models";

export function formatRangeLabel(q: RecapQuery): string {
    const now = new Date();

    const fmt = (d: Date) =>
        d.toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" });

    if (q.type === "rolling") {
        const start = new Date(now);
        start.setDate(now.getDate() - (q.days - 1));
        return `${fmt(start)} – ${fmt(now)}`;
    }

    if (q.unit === "month") {
        if (q.offset !== undefined && q.offset !== 0) {
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            start.setMonth(start.getMonth() + q.offset);
            const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
            return `${fmt(start)} – ${fmt(end)}`;
        }
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        return `${fmt(start)} – ${fmt(now)}`;
    }

    if (q.unit === "year" && q.offset !== undefined) {
        const start = new Date(now.getFullYear(), 0, 1);
        start.setFullYear(start.getFullYear() + q.offset);
        const end = new Date(start.getFullYear(), 11, 31);

        return `${fmt(start)} – ${fmt(end)}`;
    }

    const start = new Date(now.getFullYear(), 0, 1);
    return `${fmt(start)} – ${fmt(now)}`;
}

export function secondsToHms(seconds: number) {
    const s = Math.max(0, Math.floor(seconds));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const r = s % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${r}s`;
    return `${r}s`;
}

export function num(n: number, digits = 1) {
    return Number.isFinite(n) ? n.toFixed(digits) : "0.0";
}
