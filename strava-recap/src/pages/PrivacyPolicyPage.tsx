import PageShell from "../ui/PageShell";

export default function PrivacyPolicyPage() {
    return (
        <PageShell title="Privacy Policy">
            <div className="row justify-content-center">
                <div className="col-12 col-lg-10">
                    <div className="card">
                        <div className="card-body">
                            <h1 className="mb-3">Privacy Policy — Recap Insights</h1>
                            <p className="text-secondary mb-2">
                                <strong>Effective date:</strong> 01/01/2026
                            </p>
                            <p className="text-secondary mb-2">
                                <strong>App name:</strong> Recap Insights (the "App")
                            </p>
                            <p className="text-secondary mb-4">
                                <strong>Contact:</strong>{" "}
                                <a href="mailto:vazasantosh@gmail.com" className="text-decoration-none">
                                    vazasantosh@gmail.com
                                </a>
                            </p>

                            <hr className="my-4" />

                            <section className="mb-4">
                                <h2 className="h4 mb-3">1) What this App does</h2>
                                <p>
                                    Recap Insights helps you generate fitness "recap" summaries (statistics and
                                    visualizations) by connecting to third-party fitness providers (currently Strava
                                    and Intervals.icu) using OAuth authorization.
                                </p>
                            </section>

                            <section className="mb-4">
                                <h2 className="h4 mb-3">2) OAuth scopes we request</h2>
                                <p>
                                    When you connect a provider, you authorize access according to the provider's OAuth
                                    scopes:
                                </p>
                                <ul>
                                    <li>
                                        <strong>Strava:</strong> <code>activity:read_all</code>
                                    </li>
                                    <li>
                                        <strong>Intervals.icu:</strong> <code>ACTIVITY:READ</code>
                                    </li>
                                </ul>
                                <p>
                                    These scopes are read-only and are used to retrieve your activity data so the App
                                    can generate your recap insights.
                                </p>
                            </section>

                            <section className="mb-4">
                                <h2 className="h4 mb-3">3) Data we access</h2>
                                <p>
                                    Depending on what the provider returns for your account and settings, activity data
                                    may include items such as:
                                </p>
                                <ul>
                                    <li>Activity identifiers and timestamps</li>
                                    <li>Sport/type, duration, distance, elevation</li>
                                    <li>
                                        Performance and fitness metrics (e.g., pace, heart rate, power, cadence,
                                        calories), if available
                                    </li>
                                    <li>GPS / route data</li>
                                </ul>
                                <p>
                                    Some providers may include location or route/GPS information (e.g., maps,
                                    polylines, coordinates) in activity payloads depending on provider behavior and
                                    your provider settings. <strong>Recap Insights does not process or use GPS/route data to
                                    generate recaps, and does not store GPS/route data.</strong>
                                </p>
                            </section>

                            <section className="mb-4">
                                <h2 className="h4 mb-3">4) What we store</h2>

                                <h3 className="h5 mb-2">A) Server-side storage</h3>
                                <p>
                                    We do not store your activities or recap data on our servers. Any provider data
                                    needed to compute a recap is processed transiently to produce results for your
                                    session.
                                </p>

                                <h3 className="h5 mb-2 mt-3">B) Browser storage (your device)</h3>
                                <p>
                                    To make the recap experience work smoothly, the App stores recap-specific derived
                                    data (such as computed totals, summaries, and highlights) in your browser using
                                    browser storage (such as Local Storage).
                                </p>
                                <ul>
                                    <li>The App does not store your full raw activity dataset in Local Storage.</li>
                                    <li>The App does not store GPS/route data in Local Storage.</li>
                                    <li>
                                        This data stays on your device unless your browser syncs it (for example, if
                                        your browser profile sync is enabled).
                                    </li>
                                </ul>

                                <h3 className="h5 mb-2 mt-3">C) Access tokens</h3>
                                <ul>
                                    <li>
                                        Provider access tokens are stored in a secure, HTTP-only cookie in your browser.
                                    </li>
                                    <li>
                                        Because the cookie is HTTP-only, scripts running in the page cannot read it.
                                    </li>
                                    <li>
                                        Tokens are removed when you log out (and can also be removed by clearing browser
                                        cookies/site data).
                                    </li>
                                </ul>

                                <h3 className="h5 mb-2 mt-3">D) Refresh tokens</h3>
                                <p>
                                    We do not use or store refresh tokens. If you log out or your access expires, you
                                    will need to re-authenticate with the provider.
                                </p>
                            </section>

                            <section className="mb-4">
                                <h2 className="h4 mb-3">5) How we use your data</h2>
                                <p>We use provider data only to:</p>
                                <ul>
                                    <li>Generate your recap insights and visualizations</li>
                                    <li>
                                        Operate the App reliably and securely (e.g., prevent abuse, troubleshoot errors)
                                    </li>
                                </ul>
                                <p>
                                    We do not sell your personal information and do not use your data for targeted
                                    advertising.
                                </p>
                            </section>

                            <section className="mb-4">
                                <h2 className="h4 mb-3">6) Sharing and disclosure</h2>
                                <p>We share data only as needed to run the App:</p>
                                <ul>
                                    <li>
                                        With the third-party provider(s) you explicitly connect (Strava and/or
                                        Intervals.icu) to retrieve your data via their APIs
                                    </li>
                                    <li>
                                        With our infrastructure providers to host and operate the App (see Section 7)
                                    </li>
                                    <li>
                                        If required by law or to protect the security and integrity of the App
                                    </li>
                                </ul>
                            </section>

                            <section className="mb-4">
                                <h2 className="h4 mb-3">7) Third-party services (hosting and telemetry)</h2>
                                <p>Recap Insights may use:</p>
                                <ul>
                                    <li>Microsoft Azure (hosting and related infrastructure)</li>
                                    <li>Azure Application Insights (telemetry for reliability and error monitoring)</li>
                                </ul>

                                <h3 className="h5 mb-2 mt-3">Application Insights and logging</h3>
                                <p>
                                    We configure telemetry to avoid collecting unnecessary personal data and we do not
                                    intentionally log user identity data (such as your name, email, provider account
                                    details, or provider tokens).
                                </p>
                                <p>
                                    However, like most web services, operational telemetry may include standard
                                    technical metadata (for example, timestamps, error diagnostics, and coarse
                                    device/browser details). Network-level data (such as IP address) may be processed
                                    as part of delivering requests and may exist in infrastructure logs depending on
                                    platform defaults and configuration.
                                </p>
                            </section>

                            <section className="mb-4">
                                <h2 className="h4 mb-3">8) Data retention</h2>
                                <p>
                                    Because Recap Insights does not store your activity/recap data server-side,
                                    retention is primarily controlled by you:
                                </p>
                                <ul>
                                    <li>
                                        <strong>Recap data stored in your browser:</strong> retained until you clear
                                        site data/local storage or uninstall/reset your browser profile
                                    </li>
                                    <li>
                                        <strong>Access token cookie:</strong> removed when you log out, or when you
                                        clear cookies/site data
                                    </li>
                                    <li>
                                        <strong>Server logs/telemetry:</strong> retained only as needed for operational
                                        monitoring and troubleshooting, consistent with Azure/Application Insights
                                        retention settings
                                    </li>
                                </ul>
                            </section>

                            <section className="mb-4">
                                <h2 className="h4 mb-3">9) Your choices and controls</h2>
                                <p>You can control your data by:</p>
                                <ul>
                                    <li>Logging out of Recap Insights (removes the token cookie)</li>
                                    <li>
                                        Clearing the App's site data in your browser (clears local storage and cookies)
                                    </li>
                                    <li>
                                        Revoking Recap Insights access in the provider's account settings (Strava and/or
                                        Intervals.icu)
                                    </li>
                                </ul>
                                <p>
                                    If you need help with deletion or revocation steps, contact:{" "}
                                    <a href="mailto:vazasantosh@gmail.com" className="text-decoration-none">
                                        vazasantosh@gmail.com
                                    </a>
                                    .
                                </p>
                            </section>

                            <section className="mb-4">
                                <h2 className="h4 mb-3">10) Security</h2>
                                <p>
                                    We use reasonable safeguards designed to protect your data, including HTTPS in
                                    transit and secure cookie handling for access tokens. No method of transmission or
                                    storage is 100% secure, but we aim to minimize data collection and storage by
                                    design.
                                </p>
                            </section>

                            <section className="mb-4">
                                <h2 className="h4 mb-3">11) Children's privacy</h2>
                                <p>
                                    Recap Insights is not intended for children under 13 (or under 16 where applicable).
                                    We do not knowingly collect personal information from children.
                                </p>
                            </section>

                            <section className="mb-4">
                                <h2 className="h4 mb-3">12) Changes to this policy</h2>
                                <p>
                                    We may update this Privacy Policy from time to time. The "Effective date" at the top
                                    will reflect the latest version.
                                </p>
                            </section>

                            <section className="mb-4">
                                <h2 className="h4 mb-3">13) Contact</h2>
                                <p>
                                    Questions or requests:{" "}
                                    <a href="mailto:vazasantosh@gmail.com" className="text-decoration-none">
                                        vazasantosh@gmail.com
                                    </a>
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
