import type { AsrsIncident } from "../data/schema";
import { generateInsights } from "./analytics";

const csvEscape = (value: unknown) => `"${String(Array.isArray(value) ? value.join("; ") : value ?? "").replaceAll('"', '""')}"`;

export function incidentsToCsv(incidents: AsrsIncident[]) {
  const headers = ["id", "report_date", "state", "airport_code", "airport_name", "airport_type", "aircraft_type", "operation_type", "flight_phase", "incident_type", "event_category", "severity_level", "altitude_ft", "weather_condition", "visibility", "contributing_factors", "risk_score", "narrative"];
  return [headers.join(","), ...incidents.map((incident) => headers.map((header) => csvEscape(incident[header as keyof AsrsIncident])).join(","))].join("\n");
}

export function downloadText(filename: string, contents: string, type = "text/plain") {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function insightsToMarkdown(incidents: AsrsIncident[]) {
  const insights = generateInsights(incidents);
  return `# ASRS Safety Research Summary

Filtered records: ${incidents.length}

## Dominant Risk Patterns
${insights.dominantRiskPatterns.map((item) => `- ${item}`).join("\n")}

## Most Frequent Categories
${insights.frequentCategories.map((item) => `- ${item}`).join("\n")}

## High-Risk Airport Clusters
${insights.highRiskClusters.map((item) => `- ${item}`).join("\n")}

## Trend
${insights.trendsOverTime}

## Surveillance / Situational-Awareness Gaps
${insights.surveillanceGaps.map((item) => `- ${item}`).join("\n")}

## Candidate Paper 1 Taxonomy
${insights.taxonomyCandidates.map((item) => `- ${item}`).join("\n")}
`;
}
