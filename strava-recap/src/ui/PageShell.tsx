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
    return (
        <div className="min-vh-100 d-flex flex-column">
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary">
                <div className="container">
                    <a className="navbar-brand d-flex align-items-center gap-2 fw-bold" href="/">
                        <img src="/icon.png" alt="Recap Insights" className="navbar-logo" />
                        <span>Recap Insights</span>
                    </a>

                    {
                        props.navItems && props.navItems.length > 0 && (
                            <button
                                className="navbar-toggler border-0"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#navbarContent"
                                aria-controls="navbarContent"
                                aria-expanded="false"
                                aria-label="Toggle navigation"
                            >
                                <span className="navbar-toggler-icon"></span>
                            </button>
                        )
                    }

                    <div className="collapse navbar-collapse" id="navbarContent">
                        <ul className="navbar-nav ms-auto align-items-lg-center gap-2">
                            {/* Nav Groups (like km/mi toggle) */}
                            {props.navGroups?.map((group) => (
                                <li key={group.id} className="nav-item">
                                    <div className="btn-group btn-group-sm" role="group">
                                        {group.items.map((item, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                className={`btn d-flex align-items-center gap-1 ${item.active ? "btn-primary" : "btn-outline-secondary"
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
                                    default: "btn-outline-light",
                                    primary: "btn-primary",
                                    success: "btn-success",
                                    warning: "btn-warning",
                                    info: "btn-outline-info",
                                }[item.variant ?? "default"];

                                return (
                                    <li key={item.id} className="nav-item w-xs-100 w-sm-100 w-md-auto">
                                        <button
                                            type="button"
                                            className={`btn btn-sm d-flex w-100 align-items-center gap-2 ${variantClass}`}
                                            onClick={item.onClick}
                                            disabled={item.disabled}
                                        >
                                            <span>{item.emoji}</span>
                                            <span>{item.label}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Page Header & Content */}
            <div className="container py-4 flex-grow-1">
                <div className="mb-4">
                    <h2 className="h5 fw-semibold mb-2 text-body-secondary">{props.title}</h2>
                    {props.providerBadge && (
                        <ProviderBadge 
                            connected={props.providerBadge.connected} 
                            provider={props.providerBadge.provider} 
                        />
                    )}
                </div>
                <div className="py-2">{props.children}</div>
            </div>

            <footer className="py-3 text-center text-muted border-top">
                <div className="container">
                    Built with ❤️ in Zone 2
                </div>
            </footer>
        </div>
    );
}
