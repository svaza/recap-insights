import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { RecapQuery } from "../models/models";
import { buildRecapUrl } from "../utils/recapQuery";
import { formatRangeLabel } from "../utils/format";
import PageShell from "../ui/PageShell";
import Card from "../ui/Card";
import Button from "../ui/Button";

type PeriodOption = {
    id: string;
    label: string;
    subtitle: string;
    emoji: string;
    query: RecapQuery;
};

const PERIOD_OPTIONS: PeriodOption[] = [
  { id: "last7", emoji: "🔥", label: "Last 7 days", subtitle: "This week's heat check", query: { type: "rolling", days: 7 } },
  { id: "last30", emoji: "💪", label: "Last 30 days", subtitle: "Monthly grind recap", query: { type: "rolling", days: 30 } },
  { id: "thisMonth", emoji: "🎯", label: "This month", subtitle: "Calendar month stats", query: { type: "calendar", unit: "month" } },
  { id: "thisYear", emoji: "⏳", label: "This year", subtitle: "Your annual achievement", query: { type: "calendar", unit: "year" } },
  { id: "lastYear", emoji: "🏆", label: "Last year", subtitle: "Previous calendar year", query: { type: "calendar", unit: "year", offset: -1 } },
];


export default function SelectPage() {
    const navigate = useNavigate();
    const [selectedId, setSelectedId] = useState(PERIOD_OPTIONS[0].id);

    const selected = useMemo(
        () => PERIOD_OPTIONS.find((x) => x.id === selectedId) ?? PERIOD_OPTIONS[0],
        [selectedId]
    );

    const go = () => navigate(buildRecapUrl(selected.query));

    return (
        <PageShell title="Your Recap Insights">
            <Card style={{ maxWidth: 540, margin: "0 auto", boxSizing: "border-box" }}>
                <div style={{ fontSize: "clamp(16px, 5vw, 18px)", fontWeight: 900, marginBottom: 8 }}>⚡ Let's see what you've got</div>
                    <div style={{ opacity: 0.7, marginBottom: 24, fontSize: "clamp(13px, 4vw, 15px)" }}>
                        Pick your time window and watch the magic happen. We'll pull your Strava data and create your personalized recap.
                    </div>

                    <div style={{ display: "grid", gap: 12, marginBottom: 20 }}>
                        {PERIOD_OPTIONS.map((opt) => {
                            const active = opt.id === selectedId;
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => setSelectedId(opt.id)}
                                    style={{
                                        textAlign: "left",
                                        padding: "clamp(12px, 3vw, 16px)",
                                        borderRadius: 16,
                                        border: active ? "2px solid rgba(42,127,255,0.8)" : "1.5px solid rgba(255,255,255,0.15)",
                                        background: active ? "linear-gradient(135deg, rgba(42,127,255,0.18), rgba(42,127,255,0.08))" : "rgba(255,255,255,0.04)",
                                        color: "#e9eef5",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                        transform: active ? "scale(1.02)" : "scale(1)",
                                        boxShadow: active ? "0 8px 24px rgba(42,127,255,0.15)" : "none",
                                        width: "100%",
                                        fontFamily: "inherit",
                                        fontSize: "inherit",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!active) {
                                            e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                                            e.currentTarget.style.borderColor = "rgba(42,127,255,0.5)";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!active) {
                                            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                                        }
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "clamp(8px, 2vw, 16px)" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "clamp(8px, 2vw, 12px)", flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: "clamp(20px, 6vw, 28px)", flexShrink: 0 }}>{opt.emoji}</div>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontWeight: 900, fontSize: "clamp(14px, 4vw, 16px)", letterSpacing: "-0.3px" }}>{opt.label}</div>
                                                <div style={{ opacity: 0.65, marginTop: 3, fontSize: "clamp(10px, 3vw, 12px)", fontWeight: 500 }}>{opt.subtitle}</div>
                                            </div>
                                        </div>
                                        <div style={{ opacity: 0.7, fontSize: "clamp(10px, 2vw, 12px)", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                                            {formatRangeLabel(opt.query)}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
                        <Button onClick={go} style={{ width: "100%" }}>🚀 Generate recap</Button>
                        <Button variant="ghost" onClick={() => setSelectedId(PERIOD_OPTIONS[0].id)} style={{ width: "100%" }}>
                            Reset
                        </Button>
                    </div>
                </Card>
        </PageShell>
    );
}
