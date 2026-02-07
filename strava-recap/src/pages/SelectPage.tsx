import { useMemo, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import type { RecapQuery } from "../models/models";
import { buildRecapUrl, parseRecapQuery } from "../utils/recapQuery";
import { formatRangeLabel } from "../utils/format";
import { possessive } from "../utils/helper";
import { useAthleteProfile } from "../hooks/useAthleteProfile";
import PageShell from "../ui/PageShell";
import type { ProviderBadgeInfo } from "../ui/PageShell";
import { useReleaseNotesDialog } from "../context/ReleaseNotesDialogContext";
import "./SelectPage.css";

type PeriodOption = {
    id: string;
    label: string;
    subtitle: string;
    emoji: string;
    query: RecapQuery;
};

const PERIOD_OPTIONS: PeriodOption[] = [
    { id: "last7", emoji: "🔥", label: "Last 7 days", subtitle: "This week's heat check", query: { type: "rolling", days: 7 } },
    { id: "last30", emoji: "💪", label: "Last 30 days", subtitle: "Monthly grind recap", query: { type: "rolling", days: 30 } },
    { id: "thisMonth", emoji: "🎯", label: "This month", subtitle: "Calendar month stats", query: { type: "calendar", unit: "month" } },
    { id: "lastMonth", emoji: "🗓️", label: "Last month", subtitle: "Previous calendar month", query: { type: "calendar", unit: "month", offset: -1 } },
    { id: "thisYear", emoji: "⏳", label: "This year", subtitle: "Your annual achievement", query: { type: "calendar", unit: "year" } },
    { id: "lastYear", emoji: "🏆", label: "Last year", subtitle: "Previous calendar year", query: { type: "calendar", unit: "year", offset: -1 } },
];

const PERIOD_STORAGE_KEY = "select.periodId";

/** Match a RecapQuery to a PERIOD_OPTIONS id */
function matchPeriodId(q: RecapQuery): string | null {
    return PERIOD_OPTIONS.find((opt) => {
        if (opt.query.type !== q.type) return false;
        if (q.type === "rolling" && opt.query.type === "rolling") return opt.query.days === q.days;
        if (q.type === "calendar" && opt.query.type === "calendar")
            return opt.query.unit === q.unit && (opt.query.offset ?? 0) === (q.offset ?? 0);
        return false;
    })?.id ?? null;
}

function resolveInitialPeriod(searchParams: URLSearchParams): string {
    // 1. Try to match from URL query params (e.g. coming from recap with params forwarded)
    const fromUrl = parseRecapQuery(searchParams);
    if (fromUrl) {
        const id = matchPeriodId(fromUrl);
        if (id) return id;
    }
    // 2. Try sessionStorage (last selected period)
    const stored = sessionStorage.getItem(PERIOD_STORAGE_KEY);
    if (stored && PERIOD_OPTIONS.some((o) => o.id === stored)) return stored;
    // 3. Default
    return PERIOD_OPTIONS[0].id;
}

export default function SelectPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [selectedId, setSelectedId] = useState(() => resolveInitialPeriod(searchParams));
    const { athleteProfile, connected, providerDisplayName } = useAthleteProfile();
    const { openReleaseNotes } = useReleaseNotesDialog();

    const selected = useMemo(
        () => PERIOD_OPTIONS.find((x) => x.id === selectedId) ?? PERIOD_OPTIONS[0],
        [selectedId]
    );

    const go = () => {
        sessionStorage.setItem(PERIOD_STORAGE_KEY, selectedId);
        navigate(buildRecapUrl(selected.query));
    };

    const pageTitle = athleteProfile?.firstName 
        ? `${possessive(athleteProfile.firstName)} Recap Insights`
        : "Recap Insights";

    const providerBadge: ProviderBadgeInfo | undefined = connected !== null
        ? {
            connected,
            provider: providerDisplayName,
        }
        : undefined;

    return (
        <PageShell
            title={pageTitle}
            providerBadge={providerBadge}
        >
            <div className="select-page">
                <div className="select-page__inner">
                    <div className="select-page__header">
                        <p className="select-kicker mb-2">Training Window</p>
                        <h3 className="select-page__heading mb-2">Choose your recap period</h3>
                        <p className="select-copy">
                            Pick a time window and we'll build your recap from{" "}
                            <span className="provider-name provider-name--strava">Strava</span> or{" "}
                            <span className="provider-name provider-name--intervals">Intervals.icu</span>.
                        </p>
                    </div>

                    {/* Rolling group */}
                    <div className="select-group">
                        <div className="select-group__label">Rolling</div>
                        <div className="row g-2">
                            {PERIOD_OPTIONS.filter((o) => o.query.type === "rolling").map((opt) => {
                                const active = opt.id === selectedId;
                                return (
                                    <div key={opt.id} className="col-12 col-md-6">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedId(opt.id)}
                                            aria-pressed={active}
                                            className={`btn select-option text-start p-3 h-100 w-100 ${active ? "select-option--active" : ""}`}
                                        >
                                            <div className="d-flex align-items-center justify-content-between gap-3 select-option__row">
                                                <div className="d-flex align-items-center gap-3 min-w-0 select-option__main">
                                                    <span className="select-option__emoji" aria-hidden="true">{opt.emoji}</span>
                                                    <div className="min-w-0">
                                                        <div className="fw-semibold text-truncate">{opt.label}</div>
                                                        <small className="d-block text-truncate select-option__subtitle">{opt.subtitle}</small>
                                                    </div>
                                                </div>
                                                <div className="select-option__range">{formatRangeLabel(opt.query)}</div>
                                            </div>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Monthly group */}
                    <div className="select-group">
                        <div className="select-group__label">Monthly</div>
                        <div className="row g-2">
                            {PERIOD_OPTIONS.filter((o) => o.query.type === "calendar" && o.query.unit === "month").map((opt) => {
                                const active = opt.id === selectedId;
                                return (
                                    <div key={opt.id} className="col-12 col-md-6">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedId(opt.id)}
                                            aria-pressed={active}
                                            className={`btn select-option text-start p-3 h-100 w-100 ${active ? "select-option--active" : ""}`}
                                        >
                                            <div className="d-flex align-items-center justify-content-between gap-3 select-option__row">
                                                <div className="d-flex align-items-center gap-3 min-w-0 select-option__main">
                                                    <span className="select-option__emoji" aria-hidden="true">{opt.emoji}</span>
                                                    <div className="min-w-0">
                                                        <div className="fw-semibold text-truncate">{opt.label}</div>
                                                        <small className="d-block text-truncate select-option__subtitle">{opt.subtitle}</small>
                                                    </div>
                                                </div>
                                                <div className="select-option__range">{formatRangeLabel(opt.query)}</div>
                                            </div>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Yearly group */}
                    <div className="select-group">
                        <div className="select-group__label">Yearly</div>
                        <div className="row g-2">
                            {PERIOD_OPTIONS.filter((o) => o.query.type === "calendar" && o.query.unit === "year").map((opt) => {
                                const active = opt.id === selectedId;
                                return (
                                    <div key={opt.id} className="col-12 col-md-6">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedId(opt.id)}
                                            aria-pressed={active}
                                            className={`btn select-option text-start p-3 h-100 w-100 ${active ? "select-option--active" : ""}`}
                                        >
                                            <div className="d-flex align-items-center justify-content-between gap-3 select-option__row">
                                                <div className="d-flex align-items-center gap-3 min-w-0 select-option__main">
                                                    <span className="select-option__emoji" aria-hidden="true">{opt.emoji}</span>
                                                    <div className="min-w-0">
                                                        <div className="fw-semibold text-truncate">{opt.label}</div>
                                                        <small className="d-block text-truncate select-option__subtitle">{opt.subtitle}</small>
                                                    </div>
                                                </div>
                                                <div className="select-option__range">{formatRangeLabel(opt.query)}</div>
                                            </div>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Generate */}
                    <button type="button" className="btn select-page__generate-btn w-100" onClick={go}>
                        Generate Recap
                    </button>

                    <div className="select-page__footer">
                        <p className="select-privacy-note mb-0">
                            We use read-only activity access, store recap summaries only in your browser, and do not process GPS routes.
                            <span className="select-privacy-note__links">
                                <Link to="/privacy">Privacy Policy</Link>
                                <span aria-hidden="true">·</span>
                                <button
                                    type="button"
                                    className="select-privacy-note__link-btn"
                                    onClick={openReleaseNotes}
                                >
                                    Release Notes
                                </button>
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
