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

    // Loading state
    if (loading) {
        return (
            <PageShell title={pageTitle} providerBadge={providerBadge}>
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-6">
                        <div className="card">
                            <div className="card-body text-center py-5">
                                <div className="spinner-border text-primary mb-3" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="text-secondary mb-0">Preparing your flyer...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </PageShell>
        );
    }

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
    if (error || !data) {
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

                    {/* Flyer generator */}
                    <div className="card">
                        <div className="card-body">
                            <FlyerGenerator data={data} />
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="mt-4 text-center">
                        <p className="text-secondary small">
                            💡 Tip: Use the alignment buttons to position stats where they look best with your background image.
                        </p>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
