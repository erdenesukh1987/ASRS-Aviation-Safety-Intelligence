import type { AsrsIncident } from "../data/schema";

const severityWeight = { low: 1, medium: 2, high: 3, critical: 4 };

export function countBy<T extends string | number>(items: AsrsIncident[], getter: (item: AsrsIncident) => T) {
  const map = new Map<T, number>();
  items.forEach((item) => map.set(getter(item), (map.get(getter(item)) ?? 0) + 1));
  return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => Number(b.value) - Number(a.value));
}

export function computeStats(incidents: AsrsIncident[]) {
  const highRisk = incidents.filter((item) => item.severity_level === "high" || item.severity_level === "critical");
  const byType = countBy(incidents, (item) => item.incident_type);
  const byPhase = countBy(incidents, (item) => item.flight_phase);
  const avgRisk = incidents.length ? Math.round(incidents.reduce((sum, item) => sum + item.risk_score, 0) / incidents.length) : 0;
  return {
    total: incidents.length,
    highRisk: highRisk.length,
    highRiskRate: incidents.length ? Math.round((highRisk.length / incidents.length) * 100) : 0,
    commonIncidentType: byType[0]?.name ?? "n/a",
    affectedFlightPhase: byPhase[0]?.name ?? "n/a",
    avgRisk,
    yearlyTrend: countBy(incidents, (item) => item.year).sort((a, b) => Number(a.name) - Number(b.name)),
    incidentDistribution: byType,
    severityDistribution: countBy(incidents, (item) => item.severity_level),
    topAirports: countBy(incidents, (item) => `${item.airport_code} ${item.airport_name}`).slice(0, 8),
    contributingFactors: countBy(incidents.flatMap((item) => item.contributing_factors.map((factor) => ({ ...item, factor } as AsrsIncident & { factor: string }))), (item) => (item as AsrsIncident & { factor: string }).factor).slice(0, 10),
    monthlyPattern: countBy(incidents, (item) => item.month).sort((a, b) => Number(a.name) - Number(b.name)),
    keywordFrequency: countBy(incidents.flatMap((item) => item.extracted_keywords.map((keyword) => ({ ...item, keyword } as AsrsIncident & { keyword: string }))), (item) => (item as AsrsIncident & { keyword: string }).keyword).slice(0, 12),
    altitudeSeverity: ["low", "medium", "high", "critical"].map((severity) => {
      const subset = incidents.filter((item) => item.severity_level === severity);
      return {
        severity,
        altitude: subset.length ? Math.round(subset.reduce((sum, item) => sum + item.altitude_ft, 0) / subset.length) : 0,
        score: severityWeight[severity as keyof typeof severityWeight]
      };
    })
  };
}

export function generateInsights(incidents: AsrsIncident[]) {
  const stats = computeStats(incidents);
  const clusters = countBy(incidents.filter((item) => item.severity_level === "high" || item.severity_level === "critical"), (item) => `${item.airport_code} (${item.state})`).slice(0, 4);
  const gaps = countBy(incidents.filter((item) => item.event_category === "Surveillance gap" || item.extracted_keywords.includes("ADS-B") || item.narrative.includes("shared traffic picture")), (item) => item.airport_type).slice(0, 3);
  const latest = [...stats.yearlyTrend].slice(-2);
  const trendText = latest.length === 2 && Number(latest[1].value) > Number(latest[0].value) ? "rising" : "stable to declining";
  return {
    dominantRiskPatterns: [
      `${stats.commonIncidentType} is the leading incident type in the current filter set.`,
      `${stats.affectedFlightPhase} is the most affected flight phase, indicating a concentrated operational context.`,
      `${stats.highRiskRate}% of filtered records are high or critical risk.`
    ],
    frequentCategories: stats.incidentDistribution.slice(0, 5).map((item) => `${item.name}: ${item.value}`),
    highRiskClusters: clusters.map((item) => `${item.name}: ${item.value} high-risk reports`),
    trendsOverTime: `The filtered time series is ${trendText}, with the strongest recent yearly count at ${stats.yearlyTrend.at(-1)?.name ?? "n/a"}.`,
    surveillanceGaps: gaps.map((item) => `${item.name} airports show repeated traffic-picture or ADS-B/see-and-avoid limitations.`),
    taxonomyCandidates: [
      "CTAF phraseology and timing",
      "Non-standard pattern entry conflict",
      "Runway occupancy and alignment conflict",
      "Surveillance/situational-awareness gap",
      "Training workload and expectation bias",
      "UAS proximity in uncontrolled airspace"
    ]
  };
}

export function classifyIncident(incident: AsrsIncident) {
  if (incident.event_category === "Surveillance gap" || incident.extracted_keywords.includes("ADS-B")) return "Surveillance and shared-traffic-picture gap";
  if (incident.incident_type.includes("CTAF") || incident.incident_type.includes("Position")) return "CTAF communication and coordination breakdown";
  if (incident.incident_type.includes("Runway")) return "Runway conflict or airport-surface incursion";
  if (incident.flight_phase === "pattern" || incident.incident_type.includes("pattern")) return "Traffic-pattern sequencing conflict";
  return "General aviation operational risk factor";
}
