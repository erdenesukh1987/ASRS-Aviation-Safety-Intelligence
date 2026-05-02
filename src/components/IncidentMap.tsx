import L from "leaflet";
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import { useEffect } from "react";
import type { AsrsIncident } from "../data/schema";

const severityColor = {
  low: "#57c785",
  medium: "#f3c14b",
  high: "#f97316",
  critical: "#ef4444"
};

function MapBounds({ incidents }: { incidents: AsrsIncident[] }) {
  const map = useMap();
  useEffect(() => {
    if (!incidents.length) return;
    const bounds = L.latLngBounds(incidents.slice(0, 600).map((item) => [item.latitude, item.longitude]));
    map.fitBounds(bounds.pad(0.18), { animate: false, maxZoom: 7 });
  }, [incidents, map]);
  return null;
}

export function IncidentMap({ incidents, selected, onSelect }: { incidents: AsrsIncident[]; selected: AsrsIncident | null; onSelect: (incident: AsrsIncident) => void }) {
  const frequency = new Map<string, number>();
  incidents.forEach((incident) => frequency.set(incident.airport_code, (frequency.get(incident.airport_code) ?? 0) + 1));
  return (
    <div className="map-panel">
      <div className="panel-title">
        <div>
          <strong>U.S. ASRS Incident Map</strong>
          <span>{incidents.length.toLocaleString()} filtered reports, markers sized by airport frequency</span>
        </div>
      </div>
      <MapContainer center={[39.5, -98.35]} zoom={4} className="leaflet-map" scrollWheelZoom>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBounds incidents={incidents} />
        {incidents.map((incident) => {
          const count = frequency.get(incident.airport_code) ?? 1;
          const active = selected?.id === incident.id;
          return (
            <CircleMarker
              key={incident.id}
              center={[incident.latitude, incident.longitude]}
              radius={active ? 13 : Math.min(12, 4 + Math.sqrt(count))}
              pathOptions={{
                color: active ? "#ffffff" : severityColor[incident.severity_level],
                fillColor: severityColor[incident.severity_level],
                fillOpacity: active ? 0.96 : 0.68,
                weight: active ? 3 : 1
              }}
              eventHandlers={{ click: () => onSelect(incident) }}
            >
              <Tooltip>
                <strong>{incident.airport_code}</strong> {incident.incident_type}<br />
                {incident.severity_level.toUpperCase()} risk, score {incident.risk_score}
              </Tooltip>
              <Popup>
                <strong>{incident.airport_name}</strong><br />
                {incident.report_date} · {incident.flight_phase}<br />
                {incident.incident_type}
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
