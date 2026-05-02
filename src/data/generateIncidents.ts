import type { AirportType, AsrsIncident, FlightPhase, OperationType, SeverityLevel } from "./schema";

type AirportSeed = {
  code: string;
  name: string;
  state: string;
  region: string;
  lat: number;
  lon: number;
  type: AirportType;
  weight: number;
};

const airports: AirportSeed[] = [
  { code: "KSEE", name: "Gillespie Field", state: "CA", region: "West", lat: 32.8262, lon: -116.9724, type: "towered", weight: 1.2 },
  { code: "KSQL", name: "San Carlos Airport", state: "CA", region: "West", lat: 37.5119, lon: -122.2495, type: "non_towered", weight: 1.5 },
  { code: "KPAO", name: "Palo Alto Airport", state: "CA", region: "West", lat: 37.4611, lon: -122.1151, type: "towered", weight: 1.1 },
  { code: "KOSH", name: "Wittman Regional", state: "WI", region: "Midwest", lat: 43.9844, lon: -88.557, type: "regional", weight: 1.6 },
  { code: "KAPA", name: "Centennial Airport", state: "CO", region: "Mountain", lat: 39.5701, lon: -104.8493, type: "towered", weight: 1.1 },
  { code: "KBDU", name: "Boulder Municipal", state: "CO", region: "Mountain", lat: 40.0394, lon: -105.2258, type: "non_towered", weight: 1.7 },
  { code: "KGAI", name: "Montgomery County Airpark", state: "MD", region: "Mid-Atlantic", lat: 39.1683, lon: -77.166, type: "non_towered", weight: 1.4 },
  { code: "KJYO", name: "Leesburg Executive", state: "VA", region: "Mid-Atlantic", lat: 39.0779, lon: -77.5575, type: "non_towered", weight: 1.5 },
  { code: "KFFC", name: "Atlanta Regional Falcon Field", state: "GA", region: "Southeast", lat: 33.3573, lon: -84.5718, type: "regional", weight: 1.2 },
  { code: "KISM", name: "Kissimmee Gateway", state: "FL", region: "Southeast", lat: 28.2898, lon: -81.4371, type: "towered", weight: 1.1 },
  { code: "KXBP", name: "Bridgeport Municipal", state: "TX", region: "South Central", lat: 33.1753, lon: -97.8284, type: "uncontrolled", weight: 1.6 },
  { code: "KDTO", name: "Denton Enterprise", state: "TX", region: "South Central", lat: 33.2007, lon: -97.1979, type: "towered", weight: 1 },
  { code: "KRYN", name: "Ryan Field", state: "AZ", region: "Southwest", lat: 32.1422, lon: -111.1746, type: "non_towered", weight: 1.8 },
  { code: "KCHD", name: "Chandler Municipal", state: "AZ", region: "Southwest", lat: 33.2691, lon: -111.8111, type: "towered", weight: 1.1 },
  { code: "KAWO", name: "Arlington Municipal", state: "WA", region: "Northwest", lat: 48.1607, lon: -122.159, type: "non_towered", weight: 1.5 },
  { code: "KMEV", name: "Minden-Tahoe", state: "NV", region: "West", lat: 39.0003, lon: -119.7519, type: "rural", weight: 1.3 },
  { code: "KLVK", name: "Livermore Municipal", state: "CA", region: "West", lat: 37.6934, lon: -121.8204, type: "towered", weight: 0.9 },
  { code: "KFDK", name: "Frederick Municipal", state: "MD", region: "Mid-Atlantic", lat: 39.4176, lon: -77.3743, type: "towered", weight: 1.2 },
  { code: "KLOM", name: "Wings Field", state: "PA", region: "Northeast", lat: 40.1375, lon: -75.2651, type: "non_towered", weight: 1.5 },
  { code: "KPYM", name: "Plymouth Municipal", state: "MA", region: "Northeast", lat: 41.909, lon: -70.7288, type: "regional", weight: 1.2 },
  { code: "KGMU", name: "Greenville Downtown", state: "SC", region: "Southeast", lat: 34.8479, lon: -82.35, type: "non_towered", weight: 1.3 },
  { code: "KMQJ", name: "Indianapolis Regional", state: "IN", region: "Midwest", lat: 39.8435, lon: -85.8971, type: "regional", weight: 1.2 },
  { code: "KANE", name: "Anoka County-Blaine", state: "MN", region: "Midwest", lat: 45.145, lon: -93.2114, type: "towered", weight: 1 },
  { code: "KBFI", name: "Boeing Field", state: "WA", region: "Northwest", lat: 47.5299, lon: -122.3019, type: "towered", weight: 0.8 },
  { code: "KHND", name: "Henderson Executive", state: "NV", region: "West", lat: 35.9728, lon: -115.1344, type: "regional", weight: 1 },
  { code: "KXLL", name: "Allentown Queen City", state: "PA", region: "Northeast", lat: 40.5703, lon: -75.4883, type: "non_towered", weight: 1.4 },
  { code: "KPLU", name: "Pierce County", state: "WA", region: "Northwest", lat: 47.1039, lon: -122.2872, type: "non_towered", weight: 1.4 },
  { code: "KOWD", name: "Norwood Memorial", state: "MA", region: "Northeast", lat: 42.1905, lon: -71.1729, type: "towered", weight: 0.9 },
  { code: "KAVQ", name: "Marana Regional", state: "AZ", region: "Southwest", lat: 32.4096, lon: -111.2184, type: "uncontrolled", weight: 1.7 },
  { code: "KCGZ", name: "Casa Grande Municipal", state: "AZ", region: "Southwest", lat: 32.9549, lon: -111.7668, type: "non_towered", weight: 1.6 }
];

const incidentTypes = [
  "Runway incursion", "Near midair collision", "CTAF communication breakdown", "Traffic pattern conflict",
  "Wrong runway alignment", "Loss of separation", "Unannounced entry", "Wildlife/runway conflict",
  "UAS proximity event", "Taxiway/runway confusion", "Go-around conflict", "Position report ambiguity"
];
const eventCategories = ["Runway conflict", "Traffic pattern", "Surveillance gap", "Communication", "Airport surface", "Weather/visibility", "UAS encounter", "Human factors"];
const aircraftTypes = ["C172", "PA-28", "SR22", "BE36", "C182", "DA40", "RV-7", "Bonanza", "King Air", "C152", "Experimental", "UAS small"];
const phases: FlightPhase[] = ["taxi", "takeoff", "climb", "cruise", "approach", "landing", "pattern"];
const operations: OperationType[] = ["general_aviation", "training", "private", "business", "UAS", "other"];
const weather = ["VMC", "MVFR", "IMC", "night VMC", "gusty crosswind", "low sun", "haze/smoke"];
const visibility = [">10 SM", "6-10 SM", "3-5 SM", "1-3 SM", "<1 SM"];
const factors = ["CTAF congestion", "no ADS-B target", "late position report", "similar call signs", "pilot expectation bias", "non-standard pattern entry", "runway geometry", "student workload", "sun glare", "high traffic volume", "frequency change timing", "lack of tower services", "terrain masking", "UAS observer limitation"];
const keywords = ["CTAF", "uncontrolled", "pattern", "runway", "ADS-B", "see-and-avoid", "base-to-final", "opposite direction", "go-around", "position report", "situational awareness", "non-towered", "surveillance", "separation"];

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickWeighted<T extends { weight: number }>(items: T[], rand: () => number): T {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let cursor = rand() * total;
  for (const item of items) {
    cursor -= item.weight;
    if (cursor <= 0) return item;
  }
  return items[items.length - 1];
}

function pick<T>(items: T[], rand: () => number): T {
  return items[Math.floor(rand() * items.length)];
}

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

function severityFor(type: string, category: string, rand: () => number): SeverityLevel {
  const base = type.includes("Near midair") || type.includes("Runway incursion") || category === "Surveillance gap" ? 0.62 : 0.34;
  const value = Math.min(0.98, base + rand() * 0.45);
  if (value > 0.88) return "critical";
  if (value > 0.68) return "high";
  if (value > 0.42) return "medium";
  return "low";
}

function riskScore(severity: SeverityLevel, category: string, factorsForRecord: string[], rand: () => number) {
  const severityBase = { low: 22, medium: 48, high: 73, critical: 91 }[severity];
  const categoryBoost = category === "Surveillance gap" || category === "Runway conflict" ? 5 : 0;
  const factorBoost = Math.min(10, factorsForRecord.length * 2);
  return Math.min(100, Math.round(severityBase + categoryBoost + factorBoost + rand() * 7));
}

function narrative(record: Omit<AsrsIncident, "narrative" | "extracted_keywords">, chosenFactors: string[], chosenKeywords: string[]) {
  const phrase = record.airport_type === "non_towered" || record.airport_type === "uncontrolled"
    ? "non-towered airport environment"
    : "mixed towered and advisory environment";
  return `During ${record.flight_phase} at ${record.airport_name} (${record.airport_code}), the reporting pilot described a ${record.incident_type.toLowerCase()} in a ${phrase}. The event involved ${record.aircraft_type} operations at approximately ${record.altitude_ft} ft with ${record.weather_condition} and visibility ${record.visibility}. Contributing factors included ${chosenFactors.join(", ")}. The narrative emphasized ${chosenKeywords.slice(0, 3).join(", ")} and a degraded shared traffic picture before crews restored separation or discontinued the operation.`;
}

export function generateIncidents(count = 1250, seed = 20260427): AsrsIncident[] {
  const rand = mulberry32(seed);
  const incidents: AsrsIncident[] = [];
  for (let index = 0; index < count; index += 1) {
    const airport = pickWeighted(airports, rand);
    const year = 2018 + Math.floor(rand() * 8);
    const month = 1 + Math.floor(rand() * 12);
    const day = 1 + Math.floor(rand() * 27);
    const incident_type = pick(incidentTypes, rand);
    const event_category = incident_type.includes("CTAF") || incident_type.includes("Position") ? "Communication" : pick(eventCategories, rand);
    const severity_level = severityFor(incident_type, event_category, rand);
    const factorCount = 2 + Math.floor(rand() * 3);
    const chosenFactors = unique(Array.from({ length: factorCount }, () => pick(factors, rand)));
    const chosenKeywords = unique([event_category.toLowerCase(), incident_type.toLowerCase(), ...Array.from({ length: 5 }, () => pick(keywords, rand))]);
    const phase = incident_type.includes("Taxi") ? "taxi" : incident_type.includes("Go-around") ? "landing" : pick(phases, rand);
    const baseAltitude = phase === "taxi" ? 0 : phase === "takeoff" ? 400 : phase === "pattern" ? 1100 : phase === "approach" || phase === "landing" ? 900 : 2500;
    const partial: Omit<AsrsIncident, "narrative" | "extracted_keywords"> = {
      id: `ASRS-SYN-${String(index + 1).padStart(5, "0")}`,
      report_date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      year,
      month,
      state: airport.state,
      region: airport.region,
      airport_code: airport.code,
      airport_name: airport.name,
      latitude: Number((airport.lat + (rand() - 0.5) * 0.18).toFixed(4)),
      longitude: Number((airport.lon + (rand() - 0.5) * 0.18).toFixed(4)),
      airport_type: airport.type,
      aircraft_type: pick(aircraftTypes, rand),
      operation_type: pick(operations, rand),
      flight_phase: phase,
      incident_type,
      event_category,
      severity_level,
      altitude_ft: Math.max(0, Math.round(baseAltitude + rand() * 1800 - 350)),
      weather_condition: pick(weather, rand),
      visibility: pick(visibility, rand),
      contributing_factors: chosenFactors,
      risk_score: 0
    };
    partial.risk_score = riskScore(severity_level, event_category, chosenFactors, rand);
    incidents.push({
      ...partial,
      extracted_keywords: chosenKeywords,
      narrative: narrative(partial, chosenFactors, chosenKeywords)
    });
  }
  return incidents;
}

export const INCIDENTS = generateIncidents();
