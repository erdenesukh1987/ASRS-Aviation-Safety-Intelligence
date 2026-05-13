import { Lightbulb } from "lucide-react";
import { useMemo } from "react";
import type { AsrsIncident } from "../data/schema";
import { generateInsights } from "../services/analytics";

export function ResearchInsights({ incidents }: { incidents: AsrsIncident[] }) {
  const insights = useMemo(() => generateInsights(incidents), [incidents]);
  return (
    <section className="insights">
      <div className="section-title">
        <Lightbulb size={18} />
        <div>
          <strong>Research Insights</strong>
          <span>Auto-generated synthesis for taxonomy and evidence-package drafting</span>
        </div>
      </div>
      <div className="insight-grid">
        <article><h3>Top recurring risks</h3>{insights.topRecurringRisks.map((item) => <p key={item}>{item}</p>)}</article>
        <article><h3>Most common flight phases</h3>{insights.flightPhaseSummary.map((item) => <p key={item}>{item}</p>)}</article>
        <article><h3>Top airport clusters</h3>{insights.highRiskClusters.map((item) => <p key={item}>{item}</p>)}</article>
        <article><h3>Trend signal</h3><p>{insights.trendsOverTime}</p></article>
        <article><h3>Communication events</h3><p>{insights.communicationEvents}</p><p>{insights.ctafEvents}</p></article>
        <article><h3>Research taxonomy candidates</h3>{insights.taxonomyCandidates.map((item) => <p key={item}>{item}</p>)}</article>
      </div>
    </section>
  );
}
