export default function PageShell(props: {
    title: string;
    children: React.ReactNode;
    right?: React.ReactNode;
}) {
    return (
        <div className="min-vh-100">
            <div className="container py-5 border-secondary-subtle pb-5">
                <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
                    <h1 className="h3 fw-bold mb-0">{props.title}</h1>
                    {props.right && <div className="ms-md-3">{props.right}</div>}
                </div>

                <div className="mt-4 py-4 container">{props.children}</div>
            </div>
        </div>
    );
}
