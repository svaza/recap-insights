import { Link } from "react-router-dom";
import PageShell from "../ui/PageShell";
import "./PrivacyPolicyPage.css";

export default function PrivacyPolicyPage() {
    return (
        <PageShell title="Privacy Policy">
            <article className="privacy-page">
                {/* Header */}
                <header className="privacy-page__header">
                    <div className="privacy-page__kicker">Legal</div>
                    <h1 className="privacy-page__title">Privacy Policy</h1>
                    <p className="privacy-page__subtitle">How Recap Insights handles your data</p>
                    <div className="privacy-page__meta">
                        <span>Effective 01 Jan 2026</span>
                        <span className="privacy-page__meta-dot">·</span>
                        <a
                            href="https://github.com/svaza/recap-insights/issues"
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            Contact via GitHub
                        </a>
                    </div>
                </header>

                {/* Quick summary */}
                <div className="privacy-page__tldr">
                    <div className="privacy-page__tldr-icon" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <div>
                        <strong>TL;DR</strong> — We use read-only access to fetch your activities, process
                        everything in-session, store recap summaries only in your browser, and never sell
                        or share your data for advertising. No GPS/route data is stored.
                    </div>
                </div>

                {/* Sections */}
                <div className="privacy-page__body">
                    <section className="privacy-section">
                        <h2 className="privacy-section__heading">
                            <span className="privacy-section__num">1</span>
                            What this App does
                        </h2>
                        <p>
                            Recap Insights helps you generate fitness recap summaries — statistics and
                            visualizations — by connecting to third-party fitness providers (currently Strava
                            and Intervals.icu) using OAuth authorization.
                        </p>
                    </section>

                    <section className="privacy-section">
                        <h2 className="privacy-section__heading">
                            <span className="privacy-section__num">2</span>
                            OAuth scopes we request
                        </h2>
                        <p>
                            When you connect a provider, you authorize read-only access:
                        </p>
                        <div className="privacy-scope-grid">
                            <div className="privacy-scope-card">
                                <div className="privacy-scope-card__provider">Strava</div>
                                <code className="privacy-scope-card__scope">activity:read_all</code>
                            </div>
                            <div className="privacy-scope-card">
                                <div className="privacy-scope-card__provider">Intervals.icu</div>
                                <code className="privacy-scope-card__scope">ACTIVITY:READ</code>
                            </div>
                        </div>
                        <p>
                            These scopes are read-only and used solely to retrieve activity data for
                            generating your recap.
                        </p>
                    </section>

                    <section className="privacy-section">
                        <h2 className="privacy-section__heading">
                            <span className="privacy-section__num">3</span>
                            Data we access
                        </h2>
                        <p>
                            Depending on your provider and settings, activity data may include:
                        </p>
                        <ul className="privacy-list">
                            <li>Activity identifiers and timestamps</li>
                            <li>Sport/type, duration, distance, elevation</li>
                            <li>Performance metrics (pace, heart rate, power, cadence, calories) if available</li>
                            <li>GPS / route data</li>
                        </ul>
                        <div className="privacy-callout">
                            <strong>Recap Insights does not process or use GPS/route data</strong> to generate
                            recaps, and does not store GPS/route data.
                        </div>
                    </section>

                    <section className="privacy-section">
                        <h2 className="privacy-section__heading">
                            <span className="privacy-section__num">4</span>
                            What we store
                        </h2>

                        <h3 className="privacy-subsection">Server-side storage</h3>
                        <p>
                            We do not store your activities or recap data on our servers. Provider data is
                            processed transiently to produce results for your session.
                        </p>

                        <h3 className="privacy-subsection">Browser storage (your device)</h3>
                        <p>
                            The App stores recap-specific derived data (computed totals, summaries, highlights)
                            in your browser's local storage.
                        </p>
                        <ul className="privacy-list">
                            <li>No full raw activity dataset is stored in local storage</li>
                            <li>No GPS/route data is stored in local storage</li>
                            <li>Data stays on your device unless browser profile sync is enabled</li>
                        </ul>

                        <h3 className="privacy-subsection">Access tokens</h3>
                        <ul className="privacy-list">
                            <li>Stored in a secure, HTTP-only cookie (not readable by page scripts)</li>
                            <li>Removed when you log out or clear browser cookies/site data</li>
                        </ul>

                        <h3 className="privacy-subsection">Refresh tokens</h3>
                        <p>
                            We do not use or store refresh tokens. If your access expires you will need
                            to re-authenticate with the provider.
                        </p>
                    </section>

                    <section className="privacy-section">
                        <h2 className="privacy-section__heading">
                            <span className="privacy-section__num">5</span>
                            How we use your data
                        </h2>
                        <p>We use provider data only to:</p>
                        <ul className="privacy-list">
                            <li>Generate your recap insights and visualizations</li>
                            <li>Operate the App reliably and securely</li>
                        </ul>
                        <p>
                            We do not sell your personal information and do not use your data for targeted
                            advertising.
                        </p>
                    </section>

                    <section className="privacy-section">
                        <h2 className="privacy-section__heading">
                            <span className="privacy-section__num">6</span>
                            Sharing and disclosure
                        </h2>
                        <p>We share data only as needed to run the App:</p>
                        <ul className="privacy-list">
                            <li>With the third-party provider(s) you explicitly connect to retrieve your data via their APIs</li>
                            <li>With our infrastructure providers to host and operate the App</li>
                            <li>If required by law or to protect the security and integrity of the App</li>
                        </ul>
                    </section>

                    <section className="privacy-section">
                        <h2 className="privacy-section__heading">
                            <span className="privacy-section__num">7</span>
                            Third-party services
                        </h2>
                        <p>Recap Insights may use:</p>
                        <ul className="privacy-list">
                            <li>Microsoft Azure (hosting and infrastructure)</li>
                            <li>Azure Application Insights (telemetry for reliability and error monitoring)</li>
                        </ul>
                        <p>
                            We configure telemetry to avoid collecting unnecessary personal data and do not
                            intentionally log user identity data. Operational telemetry may include standard
                            technical metadata (timestamps, error diagnostics, coarse device/browser details).
                        </p>
                    </section>

                    <section className="privacy-section">
                        <h2 className="privacy-section__heading">
                            <span className="privacy-section__num">8</span>
                            Data retention
                        </h2>
                        <p>
                            Because we do not store activity/recap data server-side, retention is primarily
                            controlled by you:
                        </p>
                        <ul className="privacy-list">
                            <li>
                                <strong>Browser data:</strong> retained until you clear site data or reset your browser profile
                            </li>
                            <li>
                                <strong>Token cookie:</strong> removed on logout or when you clear cookies
                            </li>
                            <li>
                                <strong>Server logs/telemetry:</strong> retained only for operational monitoring per Azure defaults
                            </li>
                        </ul>
                    </section>

                    <section className="privacy-section">
                        <h2 className="privacy-section__heading">
                            <span className="privacy-section__num">9</span>
                            Your choices and controls
                        </h2>
                        <ul className="privacy-list">
                            <li>Log out of Recap Insights (removes the token cookie)</li>
                            <li>Clear the App's site data in your browser</li>
                            <li>Revoke Recap Insights access in your provider's account settings</li>
                        </ul>
                        <p>
                            Need help?{" "}
                            <a href="https://github.com/svaza/recap-insights/issues" target="_blank" rel="noreferrer noopener">
                                Create a GitHub issue
                            </a>.
                        </p>
                    </section>

                    <section className="privacy-section">
                        <h2 className="privacy-section__heading">
                            <span className="privacy-section__num">10</span>
                            Security
                        </h2>
                        <p>
                            We use reasonable safeguards including HTTPS in transit and secure cookie handling.
                            No method of transmission or storage is 100% secure, but we minimize data collection
                            and storage by design.
                        </p>
                    </section>

                    <section className="privacy-section">
                        <h2 className="privacy-section__heading">
                            <span className="privacy-section__num">11</span>
                            Children's privacy
                        </h2>
                        <p>
                            Recap Insights is not intended for children under 13 (or 16 where applicable).
                            We do not knowingly collect personal information from children.
                        </p>
                    </section>

                    <section className="privacy-section">
                        <h2 className="privacy-section__heading">
                            <span className="privacy-section__num">12</span>
                            Changes to this policy
                        </h2>
                        <p>
                            We may update this Privacy Policy from time to time. The effective date at the
                            top reflects the latest version.
                        </p>
                    </section>

                    <section className="privacy-section">
                        <h2 className="privacy-section__heading">
                            <span className="privacy-section__num">13</span>
                            Contact
                        </h2>
                        <p>
                            For questions and suggestions,{" "}
                            <a href="https://github.com/svaza/recap-insights/issues" target="_blank" rel="noreferrer noopener">
                                create a GitHub issue
                            </a>.
                        </p>
                    </section>
                </div>

                {/* Back link */}
                <div className="privacy-page__footer">
                    <Link to="/" className="privacy-page__back-link">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Back to App
                    </Link>
                </div>
            </article>
        </PageShell>
    );
}
