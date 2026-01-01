import type { CalendarUnit, RangeType, RecapQuery } from "../models/models";

export function buildRecapUrl(q: RecapQuery) {
    const p = new URLSearchParams();
    p.set("type", q.type);
    if (q.type === "rolling") p.set("days", String(q.days));
    if (q.type === "calendar") {
        p.set("unit", q.unit);
        if (q.offset !== undefined) p.set("offset", String(q.offset));
    }
    return `/recap?${p.toString()}`;
}

export function parseRecapQuery(params: URLSearchParams): RecapQuery | null {
    const type = params.get("type") as RangeType | null;

    if (type === "rolling") {
        const days = Number(params.get("days"));
        if (!Number.isFinite(days) || days <= 0 || days > 366) return null;
        return { type: "rolling", days };
    }

    if (type === "calendar") {
        const unit = params.get("unit") as CalendarUnit | null;
        if (unit !== "month" && unit !== "year") return null;
        return { type: "calendar", unit, offset: params.get("offset") ? Number(params.get("offset")) : undefined };
    }

    return null;
}
