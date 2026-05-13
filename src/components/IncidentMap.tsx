import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import type { AsrsIncident } from "../data/schema";

type MapMode = "severity" | "heatmap" | "clusters" | "hotspots";
type ClusterIncident = AsrsIncident & { clusterCount: number; clusterRisk: number; clusterIncidents: AsrsIncident[] };

const severityColor = {
  low: "#57c785",
  medium: "#f3c14b",
  high: "#f97316",
  critical: "#ef4444"
};

function heatColor(value: number) {
  if (value >= 20) return "#ef4444";
  if (value >= 10) return "#f97316";
  if (value >= 5) return "#f3c14b";
  return "#38bdf8";
}

function MapBounds({ incidents }: { incidents: AsrsIncident[] }) {
  const map = useMap();
  useEffect(() => {
    if (!incidents.length) return;
    const bounds = L.latLngBounds(incidents.slice(0, 600).map((item) => [item.latitude, item.longitude]));
    map.fitBounds(bounds.pad(0.18), { animate: false, maxZoom: 7 });
  }, [incidents, map]);
  return null;
}

function aggregateIncidents(incidents: AsrsIncident[], mode: MapMode) {
  const map = new Map<string, ClusterIncident>();
  for (const incident of incidents) {
    const clusterLat = Math.round(incident.latitude * 2) / 2;
    const clusterLon = Math.round(incident.longitude * 2) / 2;
    const key = mode === "clusters" ? `${clusterLat},${clusterLon}` : incident.airport_code || `${incident.latitude},${incident.longitude}`;
    const current = map.get(key);
    if (!current) {
      map.set(key, { ...incident, latitude: mode === "clusters" ? clusterLat : incident.latitude, longitude: mode === "clusters" ? clusterLon : incident.longitude, clusterCount: 1, clusterRisk: incident.risk_score, clusterIncidents: [incident] });
    } else {
      current.clusterCount += 1;
      current.clusterRisk += incident.risk_score;
      current.clusterIncidents.push(incident);
      if (incident.risk_score > current.risk_score) {
        map.set(key, { ...incident, latitude: current.latitude, longitude: current.longitude, clusterCount: current.clusterCount, clusterRisk: current.clusterRisk, clusterIncidents: current.clusterIncidents });
      }
    }
  }
  return [...map.values()].sort((a, b) => b.clusterCount - a.clusterCount);
}

function isGenericAirportCode(code: string) {
  return !code || code === "UNKNOWN" || /^Z{3,4}$/i.test(code);
}

export function IncidentMap({
  incidents,
  selected,
  onSelect,
  onAirportSelect
}: {
  incidents: AsrsIncident[];
  selected: AsrsIncident | null;
  onSelect: (incident: AsrsIncident) => void;
  onAirportSelect?: (airportCode: string, incidents: AsrsIncident[]) => void;
}) {
  const [mode, setMode] = useState<MapMode>("severity");
  const frequency = new Map<string, number>();
  incidents.forEach((incident) => frequency.set(incident.airport_code, (frequency.get(incident.airport_code) ?? 0) + 1));
  const clustered = useMemo(() => aggregateIncidents(incidents, mode), [incidents, mode]);
  const mapIncidents = mode === "severity"
    ? incidents
    : mode === "hotspots"
      ? clustered.filter((incident) => !isGenericAirportCode(incident.airport_code) && incident.coordinateConfidence !== "low").slice(0, 75)
      : clustered;

  return (
    <div className="map-panel">
      <div className="panel-title">
        <div>
          <strong>U.S. ASRS Incident Map</strong>
          <span>{incidents.length.toLocaleString()} filtered reports, {mode === "severity" ? "markers colored by severity" : mode === "heatmap" ? "heat intensity by airport report volume" : mode === "hotspots" ? "top airport hotspots by report count" : "nearby incidents clustered by coordinates"}</span>
        </div>
        <div className="segmented-control" aria-label="Map mode">
          {(["severity", "heatmap", "clusters", "hotspots"] as const).map((item) => (
            <button key={item} className={mode === item ? "active" : ""} onClick={() => setMode(item)}>{item}</button>
          ))}
        </div>
      </div>
      <MapContainer center={[39.5, -98.35]} zoom={4} className="leaflet-map" scrollWheelZoom>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBounds incidents={mapIncidents} />
        {mapIncidents.map((incident) => {
          const clusterCount = Number((incident as Partial<ClusterIncident>).clusterCount ?? frequency.get(incident.airport_code) ?? 1);
          const active = selected?.id === incident.id;
          const color = mode === "heatmap" || mode === "hotspots" ? heatColor(clusterCount) : severityColor[incident.severity_level];
          return (
            <CircleMarker
              key={incident.id}
              center={[incident.latitude, incident.longitude]}
              radius={active ? 13 : Math.min(mode === "severity" ? 12 : mode === "hotspots" ? 30 : 24, 4 + Math.sqrt(clusterCount) * (mode === "severity" ? 1 : 2.2))}
              pathOptions={{
                color: active ? "#ffffff" : color,
                fillColor: color,
                fillOpacity: mode === "heatmap" ? 0.48 : active ? 0.96 : 0.68,
                weight: active ? 3 : 1
              }}
              eventHandlers={{ click: () => {
                onSelect(incident);
                onAirportSelect?.(incident.airport_code, (incident as Partial<ClusterIncident>).clusterIncidents ?? [incident]);
              } }}
            >
              <Tooltip>
                <strong>{incident.airport_code}</strong> {incident.incident_type}<br />
                {clusterCount.toLocaleString()} report{clusterCount === 1 ? "" : "s"} - {incident.severity_level.toUpperCase()} risk, score {incident.risk_score}<br />
                Coordinates: {incident.coordinateConfidence ?? "low"} confidence
              </Tooltip>
              <Popup>
                <strong>{incident.airport_name}</strong><br />
                {incident.report_date} - {incident.flight_phase}<br />
                {incident.incident_type}
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
