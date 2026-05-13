import cors from "cors";
import express from "express";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { generateIncidents } from "../src/data/generateIncidents";
import type { AsrsIncident, IncidentFilters } from "../src/data/schema";
import { computeStats, generateInsights } from "../src/services/analytics";
import { incidentsToCsv } from "../src/services/export";
import { applyFilters, buildFilterOptions } from "../src/services/filtering";

const app = express();
const port = Number(process.env.PORT ?? 8787);

app.use(cors());

function loadIncidents(): { incidents: AsrsIncident[]; source: string } {
  const path = resolve("server/data/asrs_incidents.json");
  if (existsSync(path)) {
    return { incidents: JSON.parse(readFileSync(path, "utf8")) as AsrsIncident[], source: "NASA ASRS Historical Reports" };
  }
  return { incidents: generateIncidents(), source: "Synthetic fallback dataset" };
}

const { incidents: INCIDENTS, source: DATA_SOURCE } = loadIncidents();

function isGenericAirportCode(code: string) {
  return !code || code === "UNKNOWN" || /^Z{3,4}$/i.test(code);
}

type HeatmapCell = {
  key: string;
  airportCode: string;
  airportName: string;
  state: string;
  latitude: number;
  longitude: number;
  count: number;
  highRisk: number;
  ctafEvents: number;
  runwayConflicts: number;
  riskTotal: number;
  coordinateConfidence: string;
};

function parseFilters(query: Record<string, unknown>): IncidentFilters {
  const filters: IncidentFilters = {};
  for (const [key, value] of Object.entries(query)) {
    if (typeof value !== "string" || !value || value === "all") continue;
    if (["year", "startYear", "endYear", "altitudeMin", "altitudeMax"].includes(key)) {
      (filters as Record<string, number>)[key] = Number(value);
    } else {
      (filters as Record<string, string>)[key] = value;
    }
  }
  return filters;
}

app.get("/api/asrs/incidents", (req, res) => {
  res.json(applyFilters(INCIDENTS, parseFilters(req.query)).slice(0, 2000));
});

app.get("/api/asrs/incidents/:id", (req, res) => {
  const incident = INCIDENTS.find((item) => item.id === req.params.id);
  if (!incident) return res.status(404).json({ error: "Incident not found" });
  res.json(incident);
});

app.get("/api/asrs/stats", (req, res) => {
  res.json({ ...computeStats(applyFilters(INCIDENTS, parseFilters(req.query))), dataSource: DATA_SOURCE });
});

app.get("/api/asrs/filters", (_req, res) => {
  res.json({ ...buildFilterOptions(INCIDENTS), dataSource: DATA_SOURCE });
});

app.get("/api/asrs/insights", (req, res) => {
  res.json(generateInsights(applyFilters(INCIDENTS, parseFilters(req.query))));
});

function aggregateHeatmap(incidents: AsrsIncident[], groupBy: "airport" | "state" | "cluster") {
  const cells = new Map<string, HeatmapCell>();
  for (const incident of incidents.filter((item) => item.latitude !== null && item.longitude !== null)) {
    const clusterLat = Math.round(incident.latitude! * 2) / 2;
    const clusterLon = Math.round(incident.longitude! * 2) / 2;
    const key = groupBy === "state"
      ? incident.state
      : groupBy === "cluster"
        ? `${clusterLat},${clusterLon}`
        : incident.airport_code || `${incident.latitude},${incident.longitude}`;
    const current = cells.get(key) ?? {
      key,
      airportCode: incident.airport_code,
      airportName: groupBy === "state" ? `${incident.state} statewide` : groupBy === "cluster" ? `Cluster ${clusterLat}, ${clusterLon}` : incident.airport_name,
      state: incident.state || key,
      latitude: groupBy === "cluster" ? clusterLat : incident.latitude!,
      longitude: groupBy === "cluster" ? clusterLon : incident.longitude!,
      count: 0,
      highRisk: 0,
      ctafEvents: 0,
      runwayConflicts: 0,
      riskTotal: 0,
      coordinateConfidence: incident.coordinateConfidence ?? "low"
    };
    current.count += 1;
    current.highRisk += incident.severity_level === "high" || incident.severity_level === "critical" ? 1 : 0;
    current.ctafEvents += /ctaf/i.test(`${incident.narrative} ${incident.extracted_keywords.join(" ")}`) ? 1 : 0;
    current.runwayConflicts += /runway|incursion/i.test(`${incident.event_category} ${incident.incident_type} ${incident.narrative}`) ? 1 : 0;
    current.riskTotal += incident.risk_score;
    cells.set(key, current);
  }
  return [...cells.values()].map((cell) => ({
    ...cell,
    avgRisk: Math.round(cell.riskTotal / cell.count),
    runwayConflictDensity: Number((cell.runwayConflicts / cell.count).toFixed(3))
  })).sort((a, b) => b.count - a.count);
}

app.get("/api/asrs/heatmap", (req, res) => {
  const filtered = applyFilters(INCIDENTS, parseFilters(req.query));
  const groupBy = req.query.groupBy === "state" || req.query.groupBy === "cluster" ? req.query.groupBy : "airport";
  res.json({
    groupBy,
    airport: aggregateHeatmap(filtered, "airport"),
    state: aggregateHeatmap(filtered, "state"),
    cluster: aggregateHeatmap(filtered, "cluster")
  });
});

app.get("/api/asrs/hotspots", (req, res) => {
  const filtered = applyFilters(INCIDENTS, parseFilters(req.query));
  const airports = aggregateHeatmap(filtered, "airport");
  const knownAirports = airports.filter((airport) => !isGenericAirportCode(airport.airportCode) && airport.coordinateConfidence !== "low");
  const years = new Map<number, number>();
  filtered.forEach((incident) => years.set(incident.year, (years.get(incident.year) ?? 0) + 1));
  res.json({
    airportIncidentCounts: airports.map(({ airportCode, airportName, state, count, avgRisk, ctafEvents, runwayConflicts, runwayConflictDensity, coordinateConfidence }) => ({
      airportCode,
      airportName,
      state,
      count,
      avgRisk,
      ctafEvents,
      runwayConflicts,
      runwayConflictDensity,
      coordinateConfidence
    })),
    topHotspotAirports: knownAirports.slice(0, 15),
    ctafRelatedEventCount: filtered.filter((incident) => /ctaf/i.test(`${incident.narrative} ${incident.extracted_keywords.join(" ")}`)).length,
    runwayConflictDensity: Number((filtered.filter((incident) => /runway|incursion/i.test(`${incident.event_category} ${incident.incident_type} ${incident.narrative}`)).length / Math.max(filtered.length, 1)).toFixed(3)),
    yearlyTrendSummaries: [...years.entries()].sort((a, b) => a[0] - b[0]).map(([year, count]) => ({ year, count }))
  });
});

app.get("/api/asrs/airport/:code", (req, res) => {
  const code = req.params.code.toUpperCase();
  const filtered = applyFilters(INCIDENTS, parseFilters(req.query)).filter((incident) => {
    const airportCode = incident.airport_code.toUpperCase();
    return airportCode === code || airportCode === `K${code}` || `K${airportCode}` === code;
  });
  if (!filtered.length) return res.status(404).json({ error: "Airport not found" });
  res.json({
    airport: aggregateHeatmap(filtered, "airport")[0],
    stats: computeStats(filtered),
    incidents: filtered
  });
});

app.get("/api/asrs/export", (req, res) => {
  const csv = incidentsToCsv(applyFilters(INCIDENTS, parseFilters(req.query)));
  res.header("Content-Type", "text/csv");
  res.attachment("asrs-filtered-incidents.csv");
  res.send(csv);
});

app.listen(port, () => {
  console.log(`ASRS API listening on http://127.0.0.1:${port} using ${DATA_SOURCE}`);
});
