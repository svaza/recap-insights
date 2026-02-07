import { useEffect, useState } from "react";
import { ProviderBadge } from "./ProviderBadge";

export type NavItem = {
    id: string;
    emoji: string;
    label: string;
    onClick?: () => void;
    active?: boolean;
    disabled?: boolean;
    variant?: "default" | "primary" | "success" | "warning" | "info";
};

export type NavGroup = {
    id: string;
    items: { emoji: string; label: string; active?: boolean; onClick: () => void }[];
};

export type ProviderBadgeInfo = {
    connected: boolean;
    provider: string;
};

export default function PageShell(props: {
    title: string;
    children: React.ReactNode;
    navItems?: NavItem[];
    navGroups?: NavGroup[];
    providerBadge?: ProviderBadgeInfo;
}) {
    const hasExtraNavControls = (props.navItems && props.navItems.length > 0) || (props.navGroups && props.navGroups.length > 0);
    const [showAboutModal, setShowAboutModal] = useState(false);

    useEffect(() => {
        if (!showAboutModal) return undefined;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setShowAboutModal(false);
            }
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [showAboutModal]);

    return (
        <div className="page-shell min-vh-100 d-flex flex-column">
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark page-shell__nav">
                <div className="container page-shell__nav-inner">
                    {/* Left — Brand */}
                    <a className="navbar-brand page-shell__brand" href="/">
                        <div className="page-shell__brand-mark">
                            <img src="/icon.png" alt="" className="page-shell__brand-img" />
                        </div>
                        <span className="page-shell__brand-text">Recap Insights</span>
                    </a>

                    {/* Mobile toggle — only when there are nav controls beyond About */}
                    {hasExtraNavControls && (
                        <button
                            className="page-shell__toggler"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#navbarContent"
                            aria-controls="navbarContent"
                            aria-expanded="false"
                            aria-label="Toggle navigation"
                        >
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                                <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                        </button>
                    )}

                    {/* About button — always visible when no other nav controls */}
                    {!hasExtraNavControls && (
                        <button
                            type="button"
                            className="page-shell__nav-btn page-shell__about-trigger page-shell__about-trigger--always"
                            onClick={() => setShowAboutModal(true)}
                            aria-label="About Recap Insights"
                            title="About"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                            <span>About</span>
                        </button>
                    )}

                    {/* Right — Controls (collapsible) */}
                    {hasExtraNavControls && (
                    <div className="collapse navbar-collapse" id="navbarContent">
                        <div className="page-shell__nav-actions">
                            {/* Nav Groups (like km/mi toggle) */}
                            {props.navGroups?.map((group) => (
                                <div key={group.id} className="page-shell__toggle-group" role="group">
                                    {group.items.map((item, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            className={`page-shell__toggle-btn ${item.active ? "page-shell__toggle-btn--active" : ""}`}
                                            onClick={item.onClick}
                                        >
                                            <span className="page-shell__toggle-emoji">{item.emoji}</span>
                                            <span className="page-shell__toggle-label">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            ))}

                            {/* Separator between groups and action buttons */}
                            {props.navGroups && props.navGroups.length > 0 && (props.navItems && props.navItems.length > 0) && (
                                <div className="page-shell__nav-sep" />
                            )}

                            {/* Nav Items */}
                            {props.navItems?.map((item) => {
                                const isProminent = item.variant === "primary" || item.variant === "success" || item.variant === "warning";
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        className={`page-shell__nav-btn ${isProminent ? "page-shell__nav-btn--accent" : ""}`}
                                        onClick={item.onClick}
                                        disabled={item.disabled}
                                    >
                                        <span className="page-shell__nav-btn-emoji">{item.emoji}</span>
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}

                            {/* About — icon-only on desktop, full on mobile */}
                            <button
                                type="button"
                                className="page-shell__nav-btn page-shell__about-trigger"
                                onClick={() => setShowAboutModal(true)}
                                aria-label="About Recap Insights"
                                title="About"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="16" x2="12" y2="12" />
                                    <line x1="12" y1="8" x2="12.01" y2="8" />
                                </svg>
                                <span className="page-shell__about-label">About</span>
                            </button>
                        </div>
                    </div>
                    )}
                </div>
            </nav>

            {/* Page Header & Content */}
            <main className="container py-4 flex-grow-1 page-shell__main">
                <header className="mb-4 page-shell__header">
                    <h2 className="h5 fw-semibold mb-2 page-shell__title">{props.title}</h2>
                    {props.providerBadge && (
                        <ProviderBadge
                            connected={props.providerBadge.connected}
                            provider={props.providerBadge.provider}
                        />
                    )}
                </header>
                <div className="py-2 page-shell__content">{props.children}</div>
            </main>

            {/* Footer */}
            <footer className="page-shell__footer">
                <div className="container page-shell__footer-inner">
                    <div className="page-shell__footer-left">
                        <a href="/" className="page-shell__footer-brand">
                            <img src="/icon.png" alt="" className="page-shell__footer-brand-img" />
                            <span>Recap Insights</span>
                        </a>
                        <p className="page-shell__footer-tagline">
                            Privacy-first fitness recaps from your training data.
                        </p>
                    </div>

                    <div className="page-shell__footer-right">
                        <div className="page-shell__footer-links">
                            <button
                                type="button"
                                className="page-shell__footer-link page-shell__footer-link--btn"
                                onClick={() => setShowAboutModal(true)}
                            >
                                About
                            </button>
                            <a href="/privacy" className="page-shell__footer-link">
                                Privacy
                            </a>
                            <a
                                href="https://github.com/svaza/recap-insights"
                                target="_blank"
                                rel="noreferrer noopener"
                                className="page-shell__footer-link"
                            >
                                GitHub
                            </a>
                            <a
                                href="https://github.com/svaza/recap-insights/issues"
                                target="_blank"
                                rel="noreferrer noopener"
                                className="page-shell__footer-link"
                            >
                                Feedback
                            </a>
                        </div>
                        <div className="page-shell__footer-meta">
                            Built with ❤️ in Zone 2
                        </div>
                    </div>
                </div>
                <div className="page-shell__footer-bottom">
                    <div className="container page-shell__footer-bottom-inner">
                        <span>&copy; {new Date().getFullYear()} Recap Insights</span>
                        <span>Open source under AGPL-3.0</span>
                    </div>
                </div>
            </footer>

            {showAboutModal && (
                <div
                    className="page-shell-about-backdrop"
                    role="presentation"
                    onClick={() => setShowAboutModal(false)}
                >
                    <section
                        className="page-shell-about-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="about-modal-title"
                        aria-describedby="about-modal-description"
                        onClick={(event) => event.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            type="button"
                            className="page-shell-about-modal__close"
                            onClick={() => setShowAboutModal(false)}
                            aria-label="Close"
                        >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                        </button>

                        {/* Hero header */}
                        <header className="page-shell-about-modal__header">
                            <div className="page-shell-about-modal__logo-mark">
                                <img src="/icon.png" alt="" className="page-shell-about-modal__logo-img" />
                            </div>
                            <div className="page-shell-about-modal__eyebrow">Recap Insights</div>
                            <h2 id="about-modal-title" className="page-shell-about-modal__title">
                                Your training data,<br />beautifully recapped
                            </h2>
                            <p id="about-modal-description" className="page-shell-about-modal__desc">
                                Privacy-first read-only connection to Strava and Intervals.icu. We never store your activities on our servers or modify anything in your account.
                            </p>
                        </header>

                        <div className="page-shell-about-modal__divider" />

                        {/* Info cards */}
                        <div className="page-shell-about-modal__content">
                            <article className="page-shell-about-modal__card">
                                <div className="page-shell-about-modal__card-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                        <polyline points="10 17 15 12 10 7" />
                                        <line x1="15" y1="12" x2="3" y2="12" />
                                    </svg>
                                </div>
                                <div className="page-shell-about-modal__card-body">
                                    <h3>OAuth Access</h3>
                                    <p>Connect via Strava or Intervals.icu with read-only scopes. The app never posts, edits, or deletes anything in your provider account.</p>
                                </div>
                            </article>

                            <article className="page-shell-about-modal__card">
                                <div className="page-shell-about-modal__card-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </div>
                                <div className="page-shell-about-modal__card-body">
                                    <h3>Data Privacy</h3>
                                    <p>Activity data lives in your browser only. Tokens are stored in secure HTTP-only cookies. Nothing is persisted server-side.</p>
                                </div>
                            </article>

                            <article className="page-shell-about-modal__card">
                                <div className="page-shell-about-modal__card-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <circle cx="12" cy="12" r="3" />
                                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                    </svg>
                                </div>
                                <div className="page-shell-about-modal__card-body">
                                    <h3>Your Controls</h3>
                                    <p>Disconnect anytime to remove cookies. Clear site data to wipe the local cache. Revoke access from your provider's settings.</p>
                                </div>
                            </article>

                            <article className="page-shell-about-modal__card">
                                <div className="page-shell-about-modal__card-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                        <path d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.11 3.29 9.44 7.86 10.97.58.1.79-.25.79-.56 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.55-3.88-1.55-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.97.1-.75.4-1.26.72-1.55-2.55-.3-5.24-1.28-5.24-5.7 0-1.26.45-2.3 1.2-3.11-.12-.3-.52-1.5.11-3.13 0 0 .98-.31 3.2 1.19.93-.26 1.93-.39 2.93-.39 1 0 2 .13 2.93.39 2.22-1.5 3.2-1.19 3.2-1.19.63 1.63.23 2.83.11 3.13.75.81 1.2 1.85 1.2 3.11 0 4.43-2.7 5.4-5.27 5.69.41.35.78 1.05.78 2.12 0 1.54-.01 2.78-.01 3.15 0 .31.21.67.8.56 4.57-1.53 7.85-5.86 7.85-10.97C23.5 5.74 18.27.5 12 .5z" />
                                    </svg>
                                </div>
                                <div className="page-shell-about-modal__card-body">
                                    <h3>Open Source</h3>
                                    <p>Fully open source on GitHub. Inspect the code, report issues, or contribute to the project.</p>
                                </div>
                            </article>
                        </div>

                        {/* Footer */}
                        <div className="page-shell-about-modal__footer">
                            <div className="page-shell-about-modal__footer-links">
                                <a href="/privacy" className="page-shell-about-modal__link">
                                    Privacy Policy
                                </a>
                                <span className="page-shell-about-modal__footer-dot">·</span>
                                <a
                                    href="https://github.com/svaza/recap-insights"
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="page-shell-about-modal__link"
                                >
                                    GitHub
                                </a>
                                <span className="page-shell-about-modal__footer-dot">·</span>
                                <a
                                    href="https://github.com/svaza/recap-insights/issues"
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="page-shell-about-modal__link"
                                >
                                    Feedback
                                </a>
                            </div>
                            <div className="page-shell-about-modal__footer-meta">
                                Made with ❤️ in Zone 2
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}
