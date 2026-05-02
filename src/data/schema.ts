export type SeverityLevel = "low" | "medium" | "high" | "critical";
export type AirportType = "non_towered" | "towered" | "uncontrolled" | "rural" | "regional";
export type OperationType = "general_aviation" | "training" | "private" | "business" | "UAS" | "other";
export type FlightPhase = "taxi" | "takeoff" | "climb" | "cruise" | "approach" | "landing" | "pattern";

export interface AsrsIncident {
  id: string;
  report_date: string;
  year: number;
  month: number;
  state: string;
  region: string;
  airport_code: string;
  airport_name: string;
  latitude: number;
  longitude: number;
  airport_type: AirportType;
  aircraft_type: string;
  operation_type: OperationType;
  flight_phase: FlightPhase;
  incident_type: string;
  event_category: string;
  severity_level: SeverityLevel;
  altitude_ft: number;
  weather_condition: string;
  visibility: string;
  contributing_factors: string[];
  narrative: string;
  extracted_keywords: string[];
  risk_score: number;
}

export interface IncidentFilters {
  year?: number;
  startYear?: number;
  endYear?: number;
  incidentType?: string;
  severity?: SeverityLevel | "all";
  aircraftType?: string;
  flightPhase?: FlightPhase | "all";
  state?: string;
  region?: string;
  airportType?: AirportType | "all";
  altitudeMin?: number;
  altitudeMax?: number;
  keyword?: string;
  weather?: string;
  visibility?: string;
  operationType?: OperationType | "all";
  eventCategory?: string;
  contributingFactor?: string;
  airportCode?: string;
}

export interface FilterOptions {
  years: number[];
  states: string[];
  regions: string[];
  incidentTypes: string[];
  severities: SeverityLevel[];
  aircraftTypes: string[];
  flightPhases: FlightPhase[];
  airportTypes: AirportType[];
  weatherConditions: string[];
  visibility: string[];
  operationTypes: OperationType[];
  eventCategories: string[];
  contributingFactors: string[];
}
