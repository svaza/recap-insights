/**
 * FlyerPage - Activity flyer generation page
 * Displays a themed flyer for a specific activity group
 */

import { useSearchParams, useLocation, Link } from 'react-router-dom';
import { useFlyerData } from '../hooks/useFlyerData';
import { useAthleteProfile } from '../hooks/useAthleteProfile';
import { getActivityGroupInfo } from '../utils/activityGroups';
import PageShell from '../ui/PageShell';
import FlyerGenerator from '../ui/FlyerGenerator';
import ConnectProviderPrompt from '../ui/ConnectProviderPrompt';
import type { ProviderBadgeInfo } from '../ui/PageShell';

export default function FlyerPage() {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const { loading, error, data, activityGroup } = useFlyerData();
    const { connected, providerDisplayName } = useAthleteProfile();

    const connectProvider = (providerType: string = 'strava') => {
        const returnTo = location.pathname + location.search;
        window.location.href = `/api/provider/connect?provider=${providerType}&returnTo=${encodeURIComponent(returnTo)}`;
    };

    // Build query string for back navigation
    const queryString = searchParams.toString();
    const backUrl = `/recap?${queryString.replace(/&?activityGroup=[^&]*/g, '')}`;

    // Get group info for title
    const groupInfo = activityGroup ? getActivityGroupInfo(activityGroup) : null;
    const pageTitle = groupInfo
        ? `${groupInfo.emoji} Create Your ${groupInfo.label} Flyer`
        : 'Create Your Activity Flyer';

    const providerBadge: ProviderBadgeInfo | undefined =
        connected !== null
            ? {
                  connected,
                  provider: providerDisplayName,
              }
            : undefined;

    // Not connected state - show connect buttons
    if (error?.type === 'not-connected') {
        return (
            <PageShell title={pageTitle} providerBadge={providerBadge}>
                <div className="flyer-page">
                    <div className="flyer-page__header flyer-page__header--compact">
                        <Link to={backUrl} className="flyer-page__back-link">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                            Back to Recap
                        </Link>
                    </div>
                    <div className="recap-status-card recap-status-card--connect">
                        <ConnectProviderPrompt
                            message="Connect a provider (read-only) to generate your flyer."
                            onConnectStrava={() => connectProvider('strava')}
                            onConnectIntervalsIcu={() => connectProvider('intervalsicu')}
                        />
                    </div>
                </div>
            </PageShell>
        );
    }

    // Error state
    if (!loading && (error || !data)) {
        return (
            <PageShell title={pageTitle} providerBadge={providerBadge}>
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-6">
                        <div className="card">
                            <div className="card-body text-center py-5">
                                <div className="fs-1 mb-3">😕</div>
                                <h5 className="mb-3">Unable to Generate Flyer</h5>
                                <p className="text-secondary mb-4">
                                    {error?.message ?? 'No activity data available for this group.'}
                                </p>
                                <Link to={backUrl} className="btn btn-outline-primary">
                                    ← Back to Recap
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </PageShell>
        );
    }

    return (
        <PageShell title={pageTitle} providerBadge={providerBadge}>
            <div className="flyer-page">
                {/* Breadcrumb back link */}
                <div className="flyer-page__back">
                    <Link to={backUrl} className="flyer-page__back-link">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Back to Recap
                    </Link>
                </div>

                {/* Page header */}
                <div className="flyer-page__header">
                    {groupInfo && <span className="flyer-page__header-emoji">{groupInfo.emoji}</span>}
                    <h2 className="flyer-page__title">
                        {groupInfo ? `${groupInfo.label} Flyer` : 'Activity Flyer'}
                    </h2>
                    <p className="flyer-page__subtitle">
                        {data?.rangeLabel ?? 'Preparing date range…'}
                    </p>
                </div>

                {/* Flyer generator */}
                <div className="flyer-page__content">
                    {loading || !data ? (
                        <div className="flyer-page__loading placeholder-glow">
                            <div className="flyer-page__loading-preview ratio ratio-9x16 bg-body-tertiary rounded-3 overflow-hidden">
                                <div className="placeholder w-100 h-100"></div>
                            </div>
                        </div>
                    ) : (
                        <FlyerGenerator data={data} />
                    )}
                </div>
            </div>
        </PageShell>
    );
}
