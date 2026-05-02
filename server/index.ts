import cors from "cors";
import express from "express";
import { INCIDENTS } from "../src/data/generateIncidents";
import type { IncidentFilters } from "../src/data/schema";
import { computeStats, generateInsights } from "../src/services/analytics";
import { incidentsToCsv } from "../src/services/export";
import { applyFilters, buildFilterOptions } from "../src/services/filtering";

const app = express();
const port = Number(process.env.PORT ?? 8787);

app.use(cors());

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
  res.json(computeStats(applyFilters(INCIDENTS, parseFilters(req.query))));
});

app.get("/api/asrs/filters", (_req, res) => {
  res.json(buildFilterOptions(INCIDENTS));
});

app.get("/api/asrs/insights", (req, res) => {
  res.json(generateInsights(applyFilters(INCIDENTS, parseFilters(req.query))));
});

app.get("/api/asrs/export", (req, res) => {
  const csv = incidentsToCsv(applyFilters(INCIDENTS, parseFilters(req.query)));
  res.header("Content-Type", "text/csv");
  res.attachment("asrs-filtered-incidents.csv");
  res.send(csv);
});

app.listen(port, () => {
  console.log(`ASRS API listening on http://127.0.0.1:${port}`);
});
