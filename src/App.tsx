import { Download, FileText, Moon, Radar, Search, Sun } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AnalyticsCharts } from "./components/AnalyticsCharts";
import { DataTable } from "./components/DataTable";
import { DetailPanel } from "./components/DetailPanel";
import { FilterSidebar } from "./components/FilterSidebar";
import { IncidentMap } from "./components/IncidentMap";
import { KpiCards } from "./components/KpiCards";
import { ResearchInsights } from "./components/ResearchInsights";
import type { AsrsIncident, FilterOptions, IncidentFilters } from "./data/schema";
import { computeStats } from "./services/analytics";
import { loadDashboardData } from "./services/api";
import { applyFilters, buildFilterOptions } from "./services/filtering";
import { downloadText, incidentsToCsv, insightsToMarkdown } from "./services/export";

const initialFilters: IncidentFilters = {
  altitudeMin: 0,
  altitudeMax: 6000
};

export function App() {
  const [filters, setFilters] = useState<IncidentFilters>(initialFilters);
  const [selected, setSelected] = useState<AsrsIncident | null>(null);
  const [dark, setDark] = useState(true);
  const [incidents, setIncidents] = useState<AsrsIncident[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [dataSource, setDataSource] = useState("NASA ASRS Historical Reports");
  const [loading, setLoading] = useState(true);
  const [associatedIncidents, setAssociatedIncidents] = useState<AsrsIncident[]>([]);

  useEffect(() => {
    let mounted = true;
    loadDashboardData().then((data) => {
      if (!mounted) return;
      setIncidents(data.incidents);
      setFilterOptions(data.filterOptions);
      setDataSource(data.dataSource);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const options = useMemo(() => filterOptions ?? buildFilterOptions(incidents), [filterOptions, incidents]);
  const filtered = useMemo(() => applyFilters(incidents, filters), [incidents, filters]);
  const stats = useMemo(() => computeStats(filtered), [filtered]);
  const selectedIncident = selected && filtered.some((item) => item.id === selected.id) ? selected : filtered[0] ?? null;
  const detailAssociated = associatedIncidents.some((item) => item.id === selectedIncident?.id) ? associatedIncidents : [];

  return (
    <div className={dark ? "app dark" : "app light"}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><Radar size={22} /></div>
          <div>
            <strong>ASRS Safety Intelligence</strong>
            <span>Historical aviation safety intelligence dashboard</span>
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
        <FilterSidebar filters={filters} options={options} onChange={setFilters} />
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Data Source: {dataSource}</p>
            <h1>ASRS Incident Visualization Dashboard</h1>
            <p className="muted topbar-subtitle">{loading ? "Loading historical reports..." : "Historical aviation safety intelligence dashboard."}</p>
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
          <IncidentMap
            incidents={filtered}
            selected={selectedIncident}
            onSelect={setSelected}
            onAirportSelect={(_airportCode, rows) => setAssociatedIncidents(rows)}
          />
          <DetailPanel incident={selectedIncident} associatedIncidents={detailAssociated} />
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
