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
    const hasNavControls = true;
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
            <nav className="navbar navbar-expand-lg navbar-dark page-shell__nav border-bottom border-secondary">
                <div className="container">
                    <a className="navbar-brand d-flex align-items-center gap-2 fw-semibold page-shell__brand" href="/">
                        <img src="/icon.png" alt="Recap Insights" className="navbar-logo" />
                        <span>Recap&nbsp;Insights</span>
                    </a>

                    {hasNavControls && (
                        <button
                            className="navbar-toggler border-0 page-shell__toggler"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#navbarContent"
                            aria-controls="navbarContent"
                            aria-expanded="false"
                            aria-label="Toggle navigation"
                        >
                            <span className="navbar-toggler-icon"></span>
                        </button>
                    )}

                    <div className="collapse navbar-collapse" id="navbarContent">
                        <ul className="navbar-nav ms-auto align-items-lg-center gap-2 page-shell__nav-list">
                            {/* Nav Groups (like km/mi toggle) */}
                            {props.navGroups?.map((group) => (
                                <li key={group.id} className="nav-item">
                                    <div className="btn-group btn-group-sm" role="group">
                                        {group.items.map((item, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                className={`btn btn-sm d-flex align-items-center gap-1 page-shell__nav-btn ${item.active ? "btn-primary" : "btn-outline-secondary"
                                                    }`}
                                                onClick={item.onClick}
                                            >
                                                <span>{item.emoji}</span>
                                                <span className="d-none d-sm-inline">{item.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </li>
                            ))}

                            {/* Nav Items */}
                            {props.navItems?.map((item) => {
                                const variantClass = {
                                    default: "btn-outline-secondary",
                                    primary: "btn-primary",
                                    success: "btn-success",
                                    warning: "btn-warning",
                                    info: "btn-outline-secondary",
                                }[item.variant ?? "default"];

                                return (
                                    <li key={item.id} className="nav-item w-xs-100 w-sm-100 w-md-auto">
                                        <button
                                            type="button"
                                            className={`btn btn-sm d-flex w-100 align-items-center gap-2 page-shell__action-btn ${variantClass}`}
                                            onClick={item.onClick}
                                            disabled={item.disabled}
                                        >
                                            <span>{item.emoji}</span>
                                            <span>{item.label}</span>
                                        </button>
                                    </li>
                                );
                            })}

                            <li className="nav-item w-xs-100 w-sm-100 w-md-auto">
                                <button
                                    type="button"
                                    className="btn btn-sm d-flex w-100 align-items-center gap-2 page-shell__action-btn btn-outline-secondary page-shell__about-btn"
                                    onClick={() => setShowAboutModal(true)}
                                >
                                    <span>🛡️</span>
                                    <span>About</span>
                                </button>
                            </li>
                        </ul>
                    </div>
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

            <footer className="py-3 text-center text-muted border-top page-shell__footer">
                <div className="container">
                    Built with ❤️ in Zone&nbsp;2 •{" "}
                    <button
                        type="button"
                        className="page-shell__footer-link page-shell__footer-btn"
                        onClick={() => setShowAboutModal(true)}
                    >
                        About
                    </button>{" "}
                    •{" "}
                    <a
                        href="https://github.com/svaza/recap-insights"
                        target="_blank"
                        rel="noreferrer"
                        className="page-shell__footer-link"
                        aria-label="Open source on GitHub"
                        title="Open source on GitHub"
                    >
                        <span className="d-inline-flex align-items-center gap-1">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                aria-hidden="true"
                                focusable="false"
                            >
                                <path d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.11 3.29 9.44 7.86 10.97.58.1.79-.25.79-.56 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.55-3.88-1.55-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.97.1-.75.4-1.26.72-1.55-2.55-.3-5.24-1.28-5.24-5.7 0-1.26.45-2.3 1.2-3.11-.12-.3-.52-1.5.11-3.13 0 0 .98-.31 3.2 1.19.93-.26 1.93-.39 2.93-.39 1 0 2 .13 2.93.39 2.22-1.5 3.2-1.19 3.2-1.19.63 1.63.23 2.83.11 3.13.75.81 1.2 1.85 1.2 3.11 0 4.43-2.7 5.4-5.27 5.69.41.35.78 1.05.78 2.12 0 1.54-.01 2.78-.01 3.15 0 .31.21.67.8.56 4.57-1.53 7.85-5.86 7.85-10.97C23.5 5.74 18.27.5 12 .5z" />
                            </svg>
                            Open source
                        </span>
                    </a>
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
                        <header className="page-shell-about-modal__header">
                            <div>
                                <div className="page-shell-about-modal__eyebrow">About Recap Insights</div>
                                <h2 id="about-modal-title" className="page-shell-about-modal__title">
                                    Privacy-first fitness recap
                                </h2>
                                <p id="about-modal-description" className="page-shell-about-modal__desc">
                                    Recap Insights connects to your provider in read-only mode and builds recap views from your activity data.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="page-shell-about-modal__close"
                                onClick={() => setShowAboutModal(false)}
                            >
                                Close
                            </button>
                        </header>

                        <div className="page-shell-about-modal__content">
                            <article className="page-shell-about-modal__card">
                                <h3>How access works</h3>
                                <ul>
                                    <li>You explicitly connect Strava or Intervals.icu via OAuth.</li>
                                    <li>The app requests read-only scopes for activity data.</li>
                                    <li>The app never posts or edits anything in your provider account.</li>
                                </ul>
                            </article>

                            <article className="page-shell-about-modal__card">
                                <h3>Where your data lives</h3>
                                <ul>
                                    <li>Recap metrics are stored on your browser (Local Storage) for faster loading.</li>
                                    <li>Activity/recap data is not stored server-side.</li>
                                    <li>Access tokens are kept in secure HTTP-only cookies.</li>
                                </ul>
                            </article>

                            <article className="page-shell-about-modal__card">
                                <h3>Your controls</h3>
                                <ul>
                                    <li>Disconnect to remove token cookies.</li>
                                    <li>Clear browser site data to remove local recap cache.</li>
                                    <li>Revoke app access anytime from provider settings.</li>
                                </ul>
                            </article>
                        </div>

                        <div className="page-shell-about-modal__footer">
                            <a href="/privacy" className="page-shell-about-modal__link">Privacy policy</a>
                            <a
                                href="https://github.com/svaza/recap-insights/issues"
                                target="_blank"
                                rel="noreferrer"
                                className="page-shell-about-modal__link"
                            >
                                Questions or suggestions
                            </a>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}
