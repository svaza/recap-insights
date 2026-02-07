import { useEffect } from "react";
import {
    CURRENT_APP_VERSION,
    CURRENT_RELEASE,
    RELEASE_NOTES,
    type ReleaseEntry
} from "../config/releases";
import "./ReleaseNotesModal.css";

const releaseDateFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
});

function formatReleaseDate(date: string): string {
    return releaseDateFormatter.format(new Date(`${date}T00:00:00`));
}

function ReleaseBranch(props: { release: ReleaseEntry; depth?: number }) {
    const { release, depth = 0 } = props;
    const isCurrent = release.version === CURRENT_APP_VERSION;
    const hasChildren = (release.children?.length ?? 0) > 0;

    return (
        <li className={`release-tree__item release-tree__item--${release.level}`} data-depth={depth}>
            {hasChildren && (
                <ul className="release-tree__children">
                    {release.children!.map((child) => (
                        <ReleaseBranch key={child.version} release={child} depth={depth + 1} />
                    ))}
                </ul>
            )}

            <article className={`release-card ${isCurrent ? "release-card--current" : ""}`}>
                <div className="release-card__head">
                    <span className={`release-card__level release-card__level--${release.level}`}>
                        {release.level}
                    </span>
                    <time className="release-card__date" dateTime={release.releaseDate}>
                        {formatReleaseDate(release.releaseDate)}
                    </time>
                </div>

                <h2 className="release-card__version">
                    v{release.version}
                    {isCurrent && <span className="release-card__current">Current</span>}
                </h2>

                <p className="release-card__title">{release.title}</p>
                <p className="release-card__summary">{release.summary}</p>

                <ul className="release-card__list">
                    {release.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                    ))}
                </ul>
            </article>
        </li>
    );
}

export default function ReleaseNotesModal(props: {
    open: boolean;
    onClose: () => void;
}) {
    const { open, onClose } = props;

    useEffect(() => {
        if (!open) return undefined;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    return (
        <div
            className="page-shell-about-backdrop release-notes-backdrop"
            role="presentation"
            onClick={onClose}
        >
            <section
                className="page-shell-about-modal release-notes-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="release-notes-title"
                aria-describedby="release-notes-subtitle"
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    type="button"
                    className="page-shell-about-modal__close"
                    onClick={onClose}
                    aria-label="Close release notes"
                >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                </button>

                <header className="release-notes-modal__header">
                    <div className="release-notes-modal__kicker">Product Updates</div>
                    <h2 id="release-notes-title" className="release-notes-modal__title">
                        Release Notes
                    </h2>
                    <p id="release-notes-subtitle" className="release-notes-modal__subtitle">
                        Version timeline from launch to the latest update.
                    </p>
                    <div className="release-notes-modal__meta">
                        <span>Current version v{CURRENT_APP_VERSION}</span>
                        {CURRENT_RELEASE && (
                            <>
                                <span className="release-notes-modal__meta-dot">·</span>
                                <span>Updated {formatReleaseDate(CURRENT_RELEASE.releaseDate)}</span>
                            </>
                        )}
                    </div>
                </header>

                <div className="release-notes-modal__timeline" aria-label="Version timeline">
                    <ul className="release-tree">
                        {RELEASE_NOTES.map((release) => (
                            <ReleaseBranch key={release.version} release={release} />
                        ))}
                    </ul>
                </div>
            </section>
        </div>
    );
}
