export type SeverityLevel = "low" | "medium" | "high" | "critical";
export type AirportType = "non_towered" | "towered" | "uncontrolled" | "unknown" | "rural" | "regional";
export type OperationType = "general_aviation" | "training" | "private" | "business" | "UAS" | "other";
export type FlightPhase = "taxi" | "takeoff" | "climb" | "cruise" | "approach" | "landing" | "pattern" | "unknown";
export type CoordinateConfidence = "high" | "medium" | "low";

export interface AsrsIncident {
  id: string;
  reportDate: string;
  report_date: string;
  year: number;
  month: number;
  state: string;
  region: string;
  airportCode: string;
  airport_code: string;
  airportName: string;
  airport_name: string;
  latitude: number;
  longitude: number;
  coordinateConfidence?: CoordinateConfidence;
  coordinateMatchMethod?: "code" | "fuzzy_name" | "state_centroid" | "synthetic";
  airportType: AirportType;
  airport_type: AirportType;
  aircraft_type: string;
  mission: string;
  operation_type: OperationType;
  flightPhase: FlightPhase;
  flight_phase: FlightPhase;
  eventType: string;
  incident_type: string;
  event_category: string;
  severityLevel: SeverityLevel;
  severity_level: SeverityLevel;
  altitude_ft: number;
  weather_condition: string;
  visibility: string;
  contributingFactors: string[];
  contributing_factors: string[];
  narrative: string;
  extractedKeywords: string[];
  extracted_keywords: string[];
  riskScore: number;
  risk_score: number;
  rawFields?: Record<string, string>;
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
