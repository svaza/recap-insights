import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import type { RecapQuery } from "../models/models";
import { buildRecapUrl } from "../utils/recapQuery";
import { formatRangeLabel } from "../utils/format";
import { possessive } from "../utils/helper";
import { useAthleteProfile } from "../hooks/useAthleteProfile";
import PageShell from "../ui/PageShell";
import type { ProviderBadgeInfo } from "../ui/PageShell";

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


export default function SelectPage() {
    const navigate = useNavigate();
    const [selectedId, setSelectedId] = useState(PERIOD_OPTIONS[0].id);
    const { athleteProfile, connected, providerDisplayName } = useAthleteProfile();

    const selected = useMemo(
        () => PERIOD_OPTIONS.find((x) => x.id === selectedId) ?? PERIOD_OPTIONS[0],
        [selectedId]
    );

    const go = () => navigate(buildRecapUrl(selected.query));

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
            <div className="row justify-content-center">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <p className="fs-5 fw-bold mb-1">⚡ Let's see what you've got</p>
                            <p className="text-secondary mb-4">
                                Pick your time window and watch the magic happen. We'll pull your activity data from your connected provider and create your personalized recap.
                                Currently supported providers: Strava and Intervals.icu.
                            </p>

                            <div className="list-group">
                                {PERIOD_OPTIONS.map((opt) => {
                                    const active = opt.id === selectedId;
                                    return (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => setSelectedId(opt.id)}
                                            className={`list-group-item list-group-item-action ${active ? "active" : "bg-body-tertiary text-light"
                                                }`}
                                        >
                                            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
                                                <div className="d-flex align-items-center gap-3 flex-fill min-w-0">
                                                    <span className="fs-3" aria-hidden="true">
                                                        {opt.emoji}
                                                    </span>
                                                    <div className="flex-fill min-w-0">
                                                        <div className="fw-semibold mb-1 text-truncate">{opt.label}</div>
                                                        <small className="text-body-secondary text-truncate d-block">{opt.subtitle}</small>
                                                    </div>
                                                </div>
                                                <div className="text-opacity-75 fw-semibold fs-6 text-start text-sm-end w-100 w-sm-auto">
                                                    {formatRangeLabel(opt.query)}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="d-flex flex-column flex-sm-row gap-3 mt-4">
                                <button type="button" className="btn btn-primary flex-fill" onClick={go}>
                                    🚀 Generate recap
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-light flex-fill"
                                    onClick={() => setSelectedId(PERIOD_OPTIONS[0].id)}
                                >
                                    Reset
                                </button>
                            </div>

                            <div className="mt-4 pt-3 border-top border-secondary">
                                <p className="text-secondary small mb-0">
                                    We use read-only activity access to generate your recap, store recap summaries locally in your browser (not on our servers), and don't process/store GPS routes.
                                    For more details, see the full <Link to="/privacy" className="text-decoration-none">Privacy Policy</Link>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
