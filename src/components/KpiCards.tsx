import { AlertTriangle, BarChart3, Gauge, Plane } from "lucide-react";
import type { computeStats } from "../services/analytics";

type Stats = ReturnType<typeof computeStats>;

export function KpiCards({ stats }: { stats: Stats }) {
  const cards = [
    { label: "Filtered incidents", value: stats.total.toLocaleString(), icon: Plane },
    { label: "High / critical", value: stats.highRisk.toLocaleString(), meta: `${stats.highRiskRate}% of set`, icon: AlertTriangle },
    { label: "Top incident type", value: stats.commonIncidentType, icon: BarChart3 },
    { label: "Mean risk score", value: stats.avgRisk, meta: "0-100 index", icon: Gauge }
  ];
  return (
    <section className="kpis">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article className="kpi" key={card.label}>
            <Icon size={18} />
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            {card.meta && <small>{card.meta}</small>}
          </article>
        );
      })}
    </section>
  );
}
