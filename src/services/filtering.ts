import type { AsrsIncident, FilterOptions, IncidentFilters } from "../data/schema";

function matches(value: string, filter?: string) {
  return !filter || filter === "all" || value === filter;
}

export function applyFilters(incidents: AsrsIncident[], filters: IncidentFilters) {
  const keyword = filters.keyword?.trim().toLowerCase();
  return incidents.filter((incident) => {
    if (filters.year && incident.year !== Number(filters.year)) return false;
    if (filters.startYear && incident.year < Number(filters.startYear)) return false;
    if (filters.endYear && incident.year > Number(filters.endYear)) return false;
    if (!matches(incident.incident_type, filters.incidentType)) return false;
    if (!matches(incident.severity_level, filters.severity)) return false;
    if (!matches(incident.aircraft_type, filters.aircraftType)) return false;
    if (!matches(incident.flight_phase, filters.flightPhase)) return false;
    if (!matches(incident.state, filters.state)) return false;
    if (!matches(incident.region, filters.region)) return false;
    if (!matches(incident.airport_type, filters.airportType)) return false;
    if (!matches(incident.weather_condition, filters.weather)) return false;
    if (!matches(incident.visibility, filters.visibility)) return false;
    if (!matches(incident.operation_type, filters.operationType)) return false;
    if (!matches(incident.event_category, filters.eventCategory)) return false;
    if (!matches(incident.airport_code, filters.airportCode)) return false;
    if (filters.contributingFactor && !incident.contributing_factors.includes(filters.contributingFactor)) return false;
    if (filters.altitudeMin !== undefined && incident.altitude_ft < Number(filters.altitudeMin)) return false;
    if (filters.altitudeMax !== undefined && incident.altitude_ft > Number(filters.altitudeMax)) return false;
    if (keyword) {
      const haystack = [
        incident.id,
        incident.airport_code,
        incident.airport_name,
        incident.incident_type,
        incident.event_category,
        incident.narrative,
        ...incident.contributing_factors,
        ...incident.extracted_keywords
      ].join(" ").toLowerCase();
      if (!haystack.includes(keyword)) return false;
    }
    return true;
  });
}

const sortText = (a: string, b: string) => a.localeCompare(b);

export function buildFilterOptions(incidents: AsrsIncident[]): FilterOptions {
  return {
    years: [...new Set(incidents.map((item) => item.year))].sort(),
    states: [...new Set(incidents.map((item) => item.state))].sort(sortText),
    regions: [...new Set(incidents.map((item) => item.region))].sort(sortText),
    incidentTypes: [...new Set(incidents.map((item) => item.incident_type))].sort(sortText),
    severities: ["low", "medium", "high", "critical"],
    aircraftTypes: [...new Set(incidents.map((item) => item.aircraft_type))].sort(sortText),
    flightPhases: ["taxi", "takeoff", "climb", "cruise", "approach", "landing", "pattern", "unknown"],
    airportTypes: ["non_towered", "towered", "uncontrolled", "unknown", "rural", "regional"],
    weatherConditions: [...new Set(incidents.map((item) => item.weather_condition))].sort(sortText),
    visibility: [...new Set(incidents.map((item) => item.visibility))],
    operationTypes: ["general_aviation", "training", "private", "business", "UAS", "other"],
    eventCategories: [...new Set(incidents.map((item) => item.event_category))].sort(sortText),
    contributingFactors: [...new Set(incidents.flatMap((item) => item.contributing_factors))].sort(sortText)
  };
}
