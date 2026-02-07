export type ReleaseLevel = "major" | "minor" | "patch";

export type ReleaseEntry = {
    version: string;
    level: ReleaseLevel;
    releaseDate: string; // YYYY-MM-DD
    title: string;
    summary: string;
    highlights: string[];
    children?: ReleaseEntry[];
};

export const CURRENT_APP_VERSION = "3.0";
export const RELEASE_VERSION_STORAGE_KEY = "recap.release.version";

const RELEASES_CONFIG: ReleaseEntry[] = [
    {
        version: "3.0",
        level: "major",
        releaseDate: "2026-02-07",
        title: "Visualization + Release Notes",
        summary: "Shipped daily activity heatmap insights and launched config-driven release notes.",
        highlights: [
            "Added the Activity Heatmap component to visualize daily activity volume.",
            "Extended recap API payload with per-day activity totals for the heatmap.",
            "Added an in-app Release Notes modal with hierarchical timeline rendering.",
            "Made version metadata config-driven so new versions can be added without UI rewrites.",
            "Linked Release Notes in the same places as Privacy and surfaced current version in shared footer metadata."
        ]
    },
    {
        version: "2.0",
        level: "major",
        releaseDate: "2026-02-06",
        title: "Recap Analysis Upgrade",
        summary: "Expanded recap exploration with filtering, deeper breakdowns, and broader UX polish.",
        highlights: [
            "Added activity-type filtering on the recap page.",
            "Introduced totals breakdown modal and action button for deeper insight.",
            "Improved loading and layout polish across recap, select, flyer, and callback flows.",
            "Refined privacy policy and provider connection experience."
        ]
    },
    {
        version: "1.0",
        level: "major",
        releaseDate: "2026-01-01",
        title: "Initial Launch",
        summary: "First public release with core recap and provider connection functionality.",
        highlights: [
            "Launched the base recap application experience.",
            "Shipped foundational provider callback and onboarding flow.",
            "Delivered the initial set of basic recap features."
        ]
    }
];

function normalizeVersion(version: string): number[] {
    const parts = version.split(".").map((part) => Number.parseInt(part, 10));
    while (parts.length < 3) {
        parts.push(0);
    }
    return parts.slice(0, 3).map((part) => (Number.isFinite(part) ? part : 0));
}

function compareVersionsDesc(left: string, right: string): number {
    const a = normalizeVersion(left);
    const b = normalizeVersion(right);

    for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
        const delta = (b[index] ?? 0) - (a[index] ?? 0);
        if (delta !== 0) {
            return delta;
        }
    }

    return 0;
}

function sortReleaseTree(entries: ReleaseEntry[]): ReleaseEntry[] {
    return [...entries]
        .sort((left, right) => compareVersionsDesc(left.version, right.version))
        .map((entry) => ({
            ...entry,
            children: entry.children ? sortReleaseTree(entry.children) : undefined
        }));
}

function findReleaseEntry(entries: ReleaseEntry[], version: string): ReleaseEntry | null {
    for (const entry of entries) {
        if (entry.version === version) {
            return entry;
        }

        if (!entry.children) {
            continue;
        }

        const childMatch = findReleaseEntry(entry.children, version);
        if (childMatch) {
            return childMatch;
        }
    }

    return null;
}

export const RELEASE_NOTES = sortReleaseTree(RELEASES_CONFIG);

export const CURRENT_RELEASE = findReleaseEntry(RELEASE_NOTES, CURRENT_APP_VERSION);
