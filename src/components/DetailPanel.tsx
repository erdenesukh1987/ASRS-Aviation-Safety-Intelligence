import type { AsrsIncident } from "../data/schema";
import { classifyIncident } from "../services/analytics";

export function DetailPanel({ incident, associatedIncidents = [] }: { incident: AsrsIncident | null; associatedIncidents?: AsrsIncident[] }) {
  if (!incident) {
    return <aside className="detail-panel empty">No incident selected</aside>;
  }
  return (
    <aside className="detail-panel">
      <span className={`severity-pill ${incident.severity_level}`}>{incident.severity_level}</span>
      <h2>{incident.airport_name}</h2>
      <p className="muted">{incident.airport_code} - {incident.state} - {incident.report_date}</p>
      <dl>
        <div><dt>Incident</dt><dd>{incident.incident_type}</dd></div>
        <div><dt>Phase</dt><dd>{incident.flight_phase}</dd></div>
        <div><dt>Aircraft</dt><dd>{incident.aircraft_type}</dd></div>
        <div><dt>Altitude</dt><dd>{incident.altitude_ft.toLocaleString()} ft</dd></div>
        <div><dt>Airport type</dt><dd>{incident.airport_type.replaceAll("_", " ")}</dd></div>
        <div><dt>Risk score</dt><dd>{incident.risk_score}/100</dd></div>
        <div><dt>Coordinate confidence</dt><dd>{incident.coordinateConfidence ?? "low"}</dd></div>
      </dl>
      <h3>Contributing factors</h3>
      <div className="tag-list">{incident.contributing_factors.map((factor) => <span key={factor}>{factor}</span>)}</div>
      <h3>Narrative summary</h3>
      <p>{incident.narrative}</p>
      <h3>Research classification</h3>
      <p className="classification">{classifyIncident(incident)}</p>
      {associatedIncidents.length > 1 && (
        <>
          <h3>Associated airport incidents</h3>
          <div className="associated-list">
            {associatedIncidents.slice(0, 8).map((item) => (
              <div key={item.id}>
                <strong>{item.report_date}</strong>
                <span>{item.incident_type} - {item.flight_phase} - risk {item.risk_score}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </aside>
  );
}
