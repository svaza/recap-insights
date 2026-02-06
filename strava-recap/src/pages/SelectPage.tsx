import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import type { RecapQuery } from "../models/models";
import { buildRecapUrl } from "../utils/recapQuery";
import { formatRangeLabel } from "../utils/format";
import { possessive } from "../utils/helper";
import { useAthleteProfile } from "../hooks/useAthleteProfile";
import PageShell from "../ui/PageShell";
import type { ProviderBadgeInfo } from "../ui/PageShell";
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
            <div className="select-page">
                <div className="row justify-content-center">
                    <div className="col-12 col-xxl-10">
                        <section className="card select-panel border-0">
                            <div className="card-body p-4 p-lg-5">
                                <p className="select-kicker mb-2">Training Window</p>
                                <h3 className="h4 mb-2">Choose your recap period</h3>
                                <p className="text-secondary mb-4 select-copy">
                                    Select the training block you want to review. We pull activity totals and highlights
                                    from your connected provider and generate a concise recap you can keep or share.
                                    Supported:{" "}
                                    <span className="provider-name provider-name--strava">Strava</span> &amp;{" "}
                                    <span className="provider-name provider-name--intervals">Intervals.icu</span>.
                                </p>

                                <div className="row g-2">
                                    {PERIOD_OPTIONS.map((opt) => {
                                        const active = opt.id === selectedId;
                                        return (
                                            <div key={opt.id} className="col-12 col-lg-6">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedId(opt.id)}
                                                    aria-pressed={active}
                                                    className={`btn select-option text-start p-3 h-100 w-100 ${active ? "select-option--active" : ""}`}
                                                >
                                                    <div className="d-flex align-items-center justify-content-between gap-3">
                                                        <div className="d-flex align-items-center gap-3 min-w-0">
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

                                <div className="d-grid d-sm-flex gap-2 mt-4">
                                    <button type="button" className="btn select-page__generate-btn flex-sm-fill" onClick={go}>
                                        Generate Recap
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary flex-sm-fill"
                                        onClick={() => setSelectedId(PERIOD_OPTIONS[0].id)}
                                    >
                                        Reset selection
                                    </button>
                                </div>

                                <div className="mt-4 pt-3 border-top border-secondary-subtle">
                                    <p className="text-secondary small mb-0 select-privacy-note">
                                        We use read-only activity access, store recap summaries only in your browser, and do not process or store GPS routes.
                                        For details, read the full <Link to="/privacy" className="text-decoration-none">Privacy Policy</Link>.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
