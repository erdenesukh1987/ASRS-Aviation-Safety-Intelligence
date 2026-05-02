import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import type { AsrsIncident } from "../data/schema";

export function DataTable({ incidents, selectedId, onSelect, onExportSelected }: { incidents: AsrsIncident[]; selectedId?: string; onSelect: (incident: AsrsIncident) => void; onExportSelected: (incidents: AsrsIncident[]) => void }) {
  const [sortKey, setSortKey] = useState<keyof AsrsIncident>("risk_score");
  const [descending, setDescending] = useState(true);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const sorted = useMemo(() => {
    return [...incidents].sort((a, b) => {
      const left = a[sortKey];
      const right = b[sortKey];
      const result = typeof left === "number" && typeof right === "number" ? left - right : String(left).localeCompare(String(right));
      return descending ? -result : result;
    });
  }, [incidents, sortKey, descending]);

  const setSort = (key: keyof AsrsIncident) => {
    if (key === sortKey) setDescending((value) => !value);
    setSortKey(key);
  };

  const selectedIncidents = incidents.filter((incident) => selectedRows.includes(incident.id));

  return (
    <section className="table-panel">
      <div className="section-title">
        <div>
          <strong>Incident Records</strong>
          <span>{incidents.length.toLocaleString()} reports available in current filter set</span>
        </div>
        <button disabled={!selectedRows.length} onClick={() => onExportSelected(selectedIncidents)}>
          <Download size={16} /> Selected CSV
        </button>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th></th>
              {[
                ["report_date", "Date"],
                ["airport_code", "Airport"],
                ["state", "State"],
                ["incident_type", "Incident"],
                ["severity_level", "Severity"],
                ["flight_phase", "Phase"],
                ["aircraft_type", "Aircraft"],
                ["risk_score", "Risk"]
              ].map(([key, title]) => <th key={key} onClick={() => setSort(key as keyof AsrsIncident)}>{title}</th>)}
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 220).map((incident) => (
              <tr key={incident.id} className={selectedId === incident.id ? "active" : ""} onClick={() => onSelect(incident)}>
                <td onClick={(event) => event.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(incident.id)}
                    onChange={(event) => setSelectedRows((rows) => event.target.checked ? [...rows, incident.id] : rows.filter((id) => id !== incident.id))}
                  />
                </td>
                <td>{incident.report_date}</td>
                <td>{incident.airport_code}</td>
                <td>{incident.state}</td>
                <td>{incident.incident_type}</td>
                <td><span className={`severity-dot ${incident.severity_level}`}>{incident.severity_level}</span></td>
                <td>{incident.flight_phase}</td>
                <td>{incident.aircraft_type}</td>
                <td>{incident.risk_score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
