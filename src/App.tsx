import { Download, FileText, Moon, Radar, Search, Sun } from "lucide-react";
import { useMemo, useState } from "react";
import { AnalyticsCharts } from "./components/AnalyticsCharts";
import { DataTable } from "./components/DataTable";
import { DetailPanel } from "./components/DetailPanel";
import { FilterSidebar } from "./components/FilterSidebar";
import { IncidentMap } from "./components/IncidentMap";
import { KpiCards } from "./components/KpiCards";
import { ResearchInsights } from "./components/ResearchInsights";
import { INCIDENTS } from "./data/generateIncidents";
import type { AsrsIncident, IncidentFilters } from "./data/schema";
import { computeStats } from "./services/analytics";
import { applyFilters, buildFilterOptions } from "./services/filtering";
import { downloadText, incidentsToCsv, insightsToMarkdown } from "./services/export";

const initialFilters: IncidentFilters = {
  startYear: 2018,
  endYear: 2025,
  altitudeMin: 0,
  altitudeMax: 6000
};

export function App() {
  const [filters, setFilters] = useState<IncidentFilters>(initialFilters);
  const [selected, setSelected] = useState<AsrsIncident | null>(null);
  const [dark, setDark] = useState(true);

  const filterOptions = useMemo(() => buildFilterOptions(INCIDENTS), []);
  const filtered = useMemo(() => applyFilters(INCIDENTS, filters), [filters]);
  const stats = useMemo(() => computeStats(filtered), [filtered]);
  const selectedIncident = selected && filtered.some((item) => item.id === selected.id) ? selected : filtered[0] ?? null;

  return (
    <div className={dark ? "app dark" : "app light"}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><Radar size={22} /></div>
          <div>
            <strong>ASRS Safety Intelligence</strong>
            <span>Non-towered operations research prototype</span>
          </div>
        </div>
        <div className="search-box">
          <Search size={16} />
          <input
            value={filters.keyword ?? ""}
            onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))}
            placeholder="Search narrative, CTAF, runway..."
          />
        </div>
        <FilterSidebar filters={filters} options={filterOptions} onChange={setFilters} />
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Aviation safety research framework</p>
            <h1>ASRS Incident Visualization Dashboard</h1>
          </div>
          <div className="actions">
            <button onClick={() => setDark((value) => !value)} title="Toggle theme">
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button onClick={() => downloadText("asrs-filtered-incidents.csv", incidentsToCsv(filtered), "text/csv")}>
              <Download size={17} /> CSV
            </button>
            <button onClick={() => downloadText("asrs-research-summary.md", insightsToMarkdown(filtered), "text/markdown")}>
              <FileText size={17} /> Summary
            </button>
          </div>
        </header>

        <KpiCards stats={stats} />

        <section className="map-layout">
          <IncidentMap incidents={filtered} selected={selectedIncident} onSelect={setSelected} />
          <DetailPanel incident={selectedIncident} />
        </section>

        <ResearchInsights incidents={filtered} />
        <AnalyticsCharts stats={stats} incidents={filtered} />
        <DataTable
          incidents={filtered}
          selectedId={selectedIncident?.id}
          onSelect={setSelected}
          onExportSelected={(rows) => downloadText("asrs-selected-incidents.csv", incidentsToCsv(rows), "text/csv")}
        />
      </main>
    </div>
  );
}
