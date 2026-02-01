/**
 * FlyerPage - Activity flyer generation page
 * Displays a themed flyer for a specific activity group
 */

import { useSearchParams, useLocation, useNavigate, Link } from 'react-router-dom';
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
    const navigate = useNavigate();
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
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-6">
                        <div className="card">
                            <div className="card-body text-center py-5">
                                <div className="fs-1 mb-3">🔗</div>
                                <h5 className="mb-3">Connect to Generate Flyer</h5>
                                <ConnectProviderPrompt
                                    message="Connect a provider (read-only) to generate your flyer."
                                    onConnectStrava={() => connectProvider('strava')}
                                    onConnectIntervalsIcu={() => connectProvider('intervalsicu')}
                                    backButton={{
                                        label: '← Back to Recap',
                                        onClick: () => navigate(backUrl),
                                    }}
                                />
                            </div>
                        </div>
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
            <div className="row justify-content-center">
                <div className="col-12 col-lg-10">
                    {/* Back navigation */}
                    <div className="mb-4">
                        <Link to={backUrl} className="btn btn-outline-secondary btn-sm">
                            ← Back to Recap
                        </Link>
                    </div>

                    {/* Preview header */}
                    <div className="flyer-preview-header mb-3">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                            <div className="text-uppercase small text-secondary fw-semibold">
                                {groupInfo ? `${groupInfo.emoji} ${groupInfo.label} Flyer` : 'Activity Flyer'}
                            </div>
                            <div className="text-body-secondary small">
                                {data?.rangeLabel ?? 'Preparing date range…'}
                            </div>
                        </div>
                    </div>

                    {/* Flyer generator */}
                    <div className="card">
                        <div className="card-body">
                            <div className="text-body-secondary small mb-3">
                                Use the Save/Share or Download buttons to export your flyer.
                            </div>
                            {loading || !data ? (
                                <div className="placeholder-glow">
                                    <div className="d-flex justify-content-center mb-3">
                                        <span className="placeholder col-3"></span>
                                    </div>
                                    <div className="ratio ratio-9x16 bg-body-tertiary rounded-3 overflow-hidden">
                                        <div className="placeholder w-100 h-100"></div>
                                    </div>
                                    <div className="d-flex justify-content-center mt-3">
                                        <span className="placeholder col-4"></span>
                                    </div>
                                </div>
                            ) : (
                                <FlyerGenerator data={data} />
                            )}
                        </div>
                    </div>

                    {/* Back navigation (bottom) */}
                    <div className="mt-4">
                        <Link to={backUrl} className="btn btn-outline-secondary btn-sm">
                            ← Back to Recap
                        </Link>
                    </div>

                </div>
            </div>
        </PageShell>
    );
}
