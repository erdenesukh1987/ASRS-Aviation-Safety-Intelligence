import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import type { AirportType, AsrsIncident, FlightPhase, OperationType, SeverityLevel } from "../src/data/schema";

type CsvRecord = Record<string, string>;
type AirportRef = {
  code: string;
  ident: string;
  gpsCode: string;
  localCode: string;
  iataCode: string;
  name: string;
  latitude: number;
  longitude: number;
  state?: string;
  normalizedName: string;
  keywords: string[];
};
type AirportIndex = { byCode: Map<string, AirportRef[]>; airports: AirportRef[] };

const rawPath = resolve("data/raw/ASRS_DBOnline.csv");
const processedPath = resolve("data/processed/asrs_incidents.json");
const serverPath = resolve("server/data/asrs_incidents.json");
const airportReferencePath = resolve("data/reference/airports.csv");

const stateCentroids: Record<string, { latitude: number; longitude: number; region: string }> = {
  AL: { latitude: 32.8067, longitude: -86.7911, region: "Southeast" },
  AK: { latitude: 61.3707, longitude: -152.4044, region: "Alaska" },
  AZ: { latitude: 33.7298, longitude: -111.4312, region: "Southwest" },
  AR: { latitude: 34.9697, longitude: -92.3731, region: "South Central" },
  CA: { latitude: 36.1162, longitude: -119.6816, region: "West" },
  CO: { latitude: 39.0598, longitude: -105.3111, region: "Mountain" },
  CT: { latitude: 41.5978, longitude: -72.7554, region: "Northeast" },
  DE: { latitude: 39.3185, longitude: -75.5071, region: "Mid-Atlantic" },
  FL: { latitude: 27.7663, longitude: -81.6868, region: "Southeast" },
  GA: { latitude: 33.0406, longitude: -83.6431, region: "Southeast" },
  HI: { latitude: 21.0943, longitude: -157.4983, region: "Pacific" },
  ID: { latitude: 44.2405, longitude: -114.4788, region: "Mountain" },
  IL: { latitude: 40.3495, longitude: -88.9861, region: "Midwest" },
  IN: { latitude: 39.8494, longitude: -86.2583, region: "Midwest" },
  IA: { latitude: 42.0115, longitude: -93.2105, region: "Midwest" },
  KS: { latitude: 38.5266, longitude: -96.7265, region: "Midwest" },
  KY: { latitude: 37.6681, longitude: -84.6701, region: "Southeast" },
  LA: { latitude: 31.1695, longitude: -91.8678, region: "South Central" },
  ME: { latitude: 44.6939, longitude: -69.3819, region: "Northeast" },
  MD: { latitude: 39.0639, longitude: -76.8021, region: "Mid-Atlantic" },
  MA: { latitude: 42.2302, longitude: -71.5301, region: "Northeast" },
  MI: { latitude: 43.3266, longitude: -84.5361, region: "Midwest" },
  MN: { latitude: 45.6945, longitude: -93.9002, region: "Midwest" },
  MS: { latitude: 32.7416, longitude: -89.6787, region: "Southeast" },
  MO: { latitude: 38.4561, longitude: -92.2884, region: "Midwest" },
  MT: { latitude: 46.9219, longitude: -110.4544, region: "Mountain" },
  NE: { latitude: 41.1254, longitude: -98.2681, region: "Midwest" },
  NV: { latitude: 38.3135, longitude: -117.0554, region: "West" },
  NH: { latitude: 43.4525, longitude: -71.5639, region: "Northeast" },
  NJ: { latitude: 40.2989, longitude: -74.521, region: "Mid-Atlantic" },
  NM: { latitude: 34.8405, longitude: -106.2485, region: "Southwest" },
  NY: { latitude: 42.1657, longitude: -74.9481, region: "Northeast" },
  NC: { latitude: 35.6301, longitude: -79.8064, region: "Southeast" },
  ND: { latitude: 47.5289, longitude: -99.784, region: "Midwest" },
  OH: { latitude: 40.3888, longitude: -82.7649, region: "Midwest" },
  OK: { latitude: 35.5653, longitude: -96.9289, region: "South Central" },
  OR: { latitude: 44.572, longitude: -122.0709, region: "Northwest" },
  PA: { latitude: 40.5908, longitude: -77.2098, region: "Northeast" },
  RI: { latitude: 41.6809, longitude: -71.5118, region: "Northeast" },
  SC: { latitude: 33.8569, longitude: -80.945, region: "Southeast" },
  SD: { latitude: 44.2998, longitude: -99.4388, region: "Midwest" },
  TN: { latitude: 35.7478, longitude: -86.6923, region: "Southeast" },
  TX: { latitude: 31.0545, longitude: -97.5635, region: "South Central" },
  UT: { latitude: 40.15, longitude: -111.8624, region: "Mountain" },
  VT: { latitude: 44.0459, longitude: -72.7107, region: "Northeast" },
  VA: { latitude: 37.7693, longitude: -78.17, region: "Mid-Atlantic" },
  WA: { latitude: 47.4009, longitude: -121.4905, region: "Northwest" },
  WV: { latitude: 38.4912, longitude: -80.9545, region: "Mid-Atlantic" },
  WI: { latitude: 44.2685, longitude: -89.6165, region: "Midwest" },
  WY: { latitude: 42.756, longitude: -107.3025, region: "Mountain" }
};

const phrasePatterns = [
  /near\s+midair|near\s+miss|nmac/i,
  /runway\s+conflict/i,
  /traffic\s+pattern/i,
  /visual\s+contact/i,
  /loss\s+of\s+separation/i,
  /go\s*around/i,
  /\bctaf\b/i,
  /runway\s+incursion/i
] as const;

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }
  if (value || row.length) {
    row.push(value);
    if (row.some((cell) => cell.trim())) rows.push(row);
  }
  return rows;
}

function normalizeName(value: string) {
  return value.trim().replace(/\s*\/\s*/g, " ").replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "").toLowerCase();
}

function normalizeAirportText(value: string) {
  return value
    .toLowerCase()
    .replace(/\b(airport|airfield|municipal|regional|international|field|ap|arpt|the|at|near|from|to|into)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function airportKeywords(value: string) {
  return unique(normalizeAirportText(value).split(/\s+/).filter((word) => word.length > 2));
}

function makeHeaders(groupRow: string[], fieldRow: string[]) {
  const counts = new Map<string, number>();
  return fieldRow.map((field, index) => {
    const group = normalizeName(groupRow[index] ?? "");
    const baseField = normalizeName(field || `unnamed_${index}`);
    const base = group && group !== baseField ? `${group}_${baseField}` : baseField;
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    return count ? `${base}_${count + 1}` : base;
  });
}

function first(record: CsvRecord, candidates: string[]) {
  for (const candidate of candidates) {
    const value = record[candidate]?.trim();
    if (value) return value;
  }
  return "";
}

function joined(record: CsvRecord, includes: string[]) {
  return Object.entries(record)
    .filter(([key, value]) => value.trim() && includes.some((part) => key.includes(part)))
    .map(([, value]) => value.trim())
    .join(" ");
}

function unique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function toDate(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length >= 8) return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  if (digits.length >= 6) return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-01`;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
}

function inferAirportCode(locale: string, advisory: string, narrative: string) {
  const localeToken = locale.match(/\b([A-Z0-9]{3,4})\.(?:AIRPORT|TRACON|TOWER|ARTCC|CENTER|CTAF)\b/i)?.[1];
  const advisoryToken = advisory.match(/\b(?:CTAF|UNICOM|TOWER|GROUND|TRACON)\s+([A-Z0-9]{3,4})\b/i)?.[1];
  const narrativeToken = narrative.match(/\b(?:at|into|from|near)\s+([A-Z][A-Z0-9]{2,3})\b/)?.[1];
  return (localeToken || advisoryToken || narrativeToken || "UNKNOWN").toUpperCase();
}

function inferAirportName(locale: string, code: string) {
  const cleaned = locale.replace(/\.(Airport|TRACON|Tower|ARTCC|Center|CTAF)$/i, "").trim();
  if (!cleaned) return code === "UNKNOWN" ? "Unknown location" : `${code} airport`;
  return cleaned.includes(".") ? cleaned.split(".")[0] : cleaned;
}

function locationSearchText(locale: string, narrative: string) {
  const localeName = locale.replace(/\.(Airport|TRACON|Tower|ARTCC|Center|CTAF)$/i, " ").replace(/\bZZZ+\b/gi, " ");
  const narrativePlaces = [
    ...narrative.matchAll(/\b(?:at|near|from|into|departing|arriving|approaching)\s+([A-Z][A-Za-z0-9' -]{3,45}?)\s+(?:airport|field|airfield)\b/g)
  ].map((match) => match[1]);
  return `${localeName} ${narrativePlaces.join(" ")}`.trim();
}

function isGenericAirportCode(code: string) {
  return !code || code === "UNKNOWN" || /^Z{3,4}$/i.test(code);
}

function findAirportByCode(index: AirportIndex, code: string, state: string) {
  if (isGenericAirportCode(code)) return undefined;
  const normalized = code.toUpperCase();
  const candidates = [...(index.byCode.get(normalized) ?? []), ...(index.byCode.get(`K${normalized}`) ?? [])];
  return candidates.find((airport) => airport.state === state) ?? candidates.find((airport) => airport.ident.startsWith("K")) ?? candidates[0];
}

function fuzzyAirportMatch(index: AirportIndex, query: string, state: string) {
  const queryKeywords = airportKeywords(query);
  if (!queryKeywords.length) return undefined;
  let best: { airport: AirportRef; score: number } | undefined;
  for (const airport of index.airports) {
    const stateBoost = airport.state && state && airport.state === state ? 0.28 : airport.state && state ? -0.18 : 0;
    const overlap = queryKeywords.filter((word) => airport.keywords.includes(word)).length;
    const queryContains = airport.normalizedName && normalizeAirportText(query).includes(airport.normalizedName) ? 0.45 : 0;
    const score = overlap / Math.max(airport.keywords.length, queryKeywords.length) + stateBoost + queryContains;
    if (score > (best?.score ?? 0)) best = { airport, score };
  }
  return best && best.score >= 0.46 ? best.airport : undefined;
}

function resolveAirport(index: AirportIndex, code: string, locale: string, narrative: string, state: string) {
  const codeMatch = findAirportByCode(index, code, state);
  if (codeMatch) return { airport: codeMatch, confidence: "high" as const, method: "code" as const };
  const fuzzyMatch = fuzzyAirportMatch(index, locationSearchText(locale, narrative), state);
  if (fuzzyMatch) return { airport: fuzzyMatch, confidence: "medium" as const, method: "fuzzy_name" as const };
  return { airport: undefined, confidence: "low" as const, method: "state_centroid" as const };
}

function classifyAirportType(text: string): AirportType {
  if (/\bnon[-\s]?towered\b/i.test(text)) return "non_towered";
  if (/\buncontrolled\b/i.test(text)) return "uncontrolled";
  if (/\bCTAF\b|\bUNICOM\b/i.test(text)) return "non_towered";
  if (/\btower\b|\bground\s+control\b/i.test(text)) return "towered";
  return "unknown";
}

function normalizeMission(value: string): OperationType {
  const text = value.toLowerCase();
  if (text.includes("train")) return "training";
  if (text.includes("uas") || text.includes("drone")) return "UAS";
  if (text.includes("business") || text.includes("corporate")) return "business";
  if (text.includes("private") || text.includes("personal")) return "private";
  if (text.includes("general")) return "general_aviation";
  return "other";
}

function normalizePhase(value: string): FlightPhase {
  const text = value.toLowerCase();
  if (text.includes("taxi")) return "taxi";
  if (text.includes("takeoff") || text.includes("take off")) return "takeoff";
  if (text.includes("climb")) return "climb";
  if (text.includes("cruise") || text.includes("enroute") || text.includes("en route")) return "cruise";
  if (text.includes("approach") || text.includes("initial")) return "approach";
  if (text.includes("land") || text.includes("final")) return "landing";
  if (text.includes("pattern") || text.includes("downwind") || text.includes("base")) return "pattern";
  return "unknown";
}

function extractKeywords(text: string) {
  const phrases = phrasePatterns.flatMap((pattern) => {
    const match = text.match(pattern);
    return match ? [match[0].toLowerCase().replace(/\s+/g, " ")] : [];
  });
  const terms = text.toLowerCase().match(/\b(?:ctaf|unicom|tower|runway|incursion|nmac|midair|collision|separation|pattern|traffic|communication|visual|evasive|go-around|conflict|approach|landing|takeoff)\b/g) ?? [];
  return unique([...phrases, ...terms]).slice(0, 18);
}

function contributingFactors(record: CsvRecord, narrative: string) {
  const source = [
    joined(record, ["human_factors"]),
    joined(record, ["communication_breakdown"]),
    first(record, ["assessments_contributing_factors_situations"]),
    first(record, ["assessments_primary_problem"])
  ].join("; ");
  const factors = source.split(";").map((item) => item.trim()).filter(Boolean);
  if (/ctaf|unicom|frequency|radio|communication/i.test(narrative)) factors.push("Communication issue");
  if (/procedure|deviation|policy|far/i.test(narrative)) factors.push("Procedural deviation");
  if (/see|visual|sight|lookout/i.test(narrative)) factors.push("See-and-avoid limitation");
  return unique(factors).slice(0, 10);
}

function classifyEvent(anomaly: string, narrative: string, synopsis: string) {
  const text = `${anomaly} ${synopsis} ${narrative}`;
  if (/nmac|near\s+midair|near\s+miss/i.test(text)) return "Near midair collision";
  if (/runway\s+incursion/i.test(text)) return "Runway incursion";
  if (/loss\s+of\s+separation/i.test(text)) return "Loss of separation";
  if (/runway\s+conflict|runway/i.test(text)) return "Runway conflict";
  if (/ctaf|unicom|communication|radio/i.test(text)) return "Communication issue";
  if (/procedural|procedure|deviation/i.test(text)) return "Procedural deviation";
  if (/traffic\s+pattern|downwind|base|final/i.test(text)) return "Traffic pattern conflict";
  return anomaly.split(";")[0]?.trim() || "ASRS event";
}

function scoreRisk(eventType: string, factors: string[], narrative: string) {
  const text = `${eventType} ${factors.join(" ")} ${narrative}`;
  if (/nmac|collision|runway\s+incursion|loss\s+of\s+separation/i.test(text)) return { severity: "critical" as SeverityLevel, score: 92 };
  if (/airborne\s+conflict|evasive\s+maneuver|go\s*around|near\s+miss/i.test(text)) return { severity: "high" as SeverityLevel, score: 76 };
  if (/communication\s+issue|communication\s+breakdown|procedural\s+deviation|procedure/i.test(text)) return { severity: "medium" as SeverityLevel, score: 52 };
  return { severity: "low" as SeverityLevel, score: 24 };
}

function eventCategory(eventType: string, keywords: string[]) {
  const text = `${eventType} ${keywords.join(" ")}`.toLowerCase();
  if (text.includes("communication") || text.includes("ctaf") || text.includes("unicom")) return "Communication";
  if (text.includes("runway")) return "Runway conflict";
  if (text.includes("pattern")) return "Traffic pattern";
  if (text.includes("separation") || text.includes("midair") || text.includes("nmac")) return "Airborne conflict";
  if (text.includes("procedural")) return "Procedure";
  return "Historical ASRS report";
}

async function loadAirportReferences() {
  const byCode = new Map<string, AirportRef[]>();
  const airports: AirportRef[] = [];
  if (!existsSync(airportReferencePath)) return { byCode, airports };
  const parsed = parseCsv(await readFile(airportReferencePath, "utf8"));
  const headers = parsed[0].map(normalizeName);
  for (const row of parsed.slice(1)) {
    const record = Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""]));
    const ident = (record.ident || "").toUpperCase();
    const gpsCode = (record.gps_code || "").toUpperCase();
    const localCode = (record.local_code || "").toUpperCase();
    const iataCode = (record.iata_code || "").toUpperCase();
    const code = (gpsCode || localCode || iataCode || ident).toUpperCase();
    const latitude = Number(record.latitude_deg);
    const longitude = Number(record.longitude_deg);
    if (code && Number.isFinite(latitude) && Number.isFinite(longitude)) {
      const airport: AirportRef = {
        code,
        ident,
        gpsCode,
        localCode,
        iataCode,
        name: record.name || code,
        latitude,
        longitude,
        state: record.iso_region?.split("-")[1],
        normalizedName: normalizeAirportText(record.name || code),
        keywords: airportKeywords(record.name || code)
      };
      airports.push(airport);
      unique([ident, gpsCode, localCode, iataCode, code, code.startsWith("K") ? code.slice(1) : `K${code}`]).forEach((candidate) => {
        if (!candidate) return;
        byCode.set(candidate, [...(byCode.get(candidate) ?? []), airport]);
      });
    }
  }
  return { byCode, airports };
}

async function main() {
  await Promise.all([
    mkdir(resolve("data/raw"), { recursive: true }),
    mkdir(resolve("data/processed"), { recursive: true }),
    mkdir(resolve("data/reference"), { recursive: true }),
    mkdir(resolve("server/data"), { recursive: true })
  ]);

  const rows = parseCsv(await readFile(rawPath, "utf8"));
  if (rows.length < 3) throw new Error(`${basename(rawPath)} does not contain ASRS header and data rows.`);
  const headers = makeHeaders(rows[0], rows[1]);
  const airportRefs = await loadAirportReferences();
  const incidents: AsrsIncident[] = rows.slice(2).map((row, index) => {
    const rawFields = Object.fromEntries(headers.map((header, column) => [header, row[column]?.trim() ?? ""]));
    const narrative = joined(rawFields, ["report_1_narrative", "report_2_narrative"]) || first(rawFields, ["report_1_synopsis"]);
    const synopsis = first(rawFields, ["report_1_synopsis"]);
    const advisory = joined(rawFields, ["atc_advisory"]);
    const locale = first(rawFields, ["place_locale_reference"]);
    const state = first(rawFields, ["place_state_reference"]).toUpperCase() || "NA";
    const reportDate = toDate(first(rawFields, ["time_date"]));
    const year = Number(reportDate.slice(0, 4)) || 0;
    const month = Number(reportDate.slice(5, 7)) || 1;
    const airportCode = inferAirportCode(locale, advisory, narrative);
    const airportMatch = resolveAirport(airportRefs, airportCode, locale, narrative, state);
    const airportRef = airportMatch.airport;
    const stateRef = stateCentroids[state] ?? { latitude: 39.5, longitude: -98.35, region: "Unknown" };
    const latitude = airportRef?.latitude ?? stateRef.latitude;
    const longitude = airportRef?.longitude ?? stateRef.longitude;
    const coordinateConfidence = airportMatch.confidence;
    const missionRaw = first(rawFields, ["aircraft_1_mission", "aircraft_2_mission"]);
    const flightPhase = normalizePhase(first(rawFields, ["aircraft_1_flight_phase", "aircraft_2_flight_phase"]) || narrative);
    const anomaly = first(rawFields, ["events_anomaly"]);
    const eventType = classifyEvent(anomaly, narrative, synopsis);
    const extractedKeywords = extractKeywords(`${anomaly} ${synopsis} ${narrative}`);
    const factors = contributingFactors(rawFields, narrative);
    const risk = scoreRisk(eventType, factors, narrative);
    const airportType = classifyAirportType(`${locale} ${advisory} ${narrative}`);

    return {
      id: first(rawFields, ["acn"]) || `ASRS-${index + 1}`,
      reportDate,
      report_date: reportDate,
      year,
      month,
      state,
      region: stateRef.region,
      airportCode,
      airport_code: airportCode,
      airportName: airportRef?.name ?? inferAirportName(locale, airportCode),
      airport_name: airportRef?.name ?? inferAirportName(locale, airportCode),
      latitude,
      longitude,
      coordinateConfidence,
      coordinateMatchMethod: airportMatch.method,
      airportType,
      airport_type: airportType,
      aircraft_type: first(rawFields, ["aircraft_1_make_model_name", "aircraft_2_make_model_name"]) || "Unknown",
      mission: missionRaw || "Unknown",
      operation_type: normalizeMission(missionRaw),
      flightPhase,
      flight_phase: flightPhase,
      eventType,
      incident_type: eventType,
      event_category: eventCategory(eventType, extractedKeywords),
      severityLevel: risk.severity,
      severity_level: risk.severity,
      altitude_ft: Number(first(rawFields, ["place_altitude_msl_single_value", "place_altitude_agl_single_value"])) || 0,
      weather_condition: first(rawFields, ["environment_flight_conditions"]) || "Unknown",
      visibility: first(rawFields, ["environment_weather_elements_visibility"]) || "Unknown",
      contributingFactors: factors,
      contributing_factors: factors,
      narrative,
      extractedKeywords,
      extracted_keywords: extractedKeywords,
      riskScore: risk.score,
      risk_score: risk.score,
      rawFields
    };
  }).filter((incident) => incident.narrative || incident.eventType !== "ASRS event");

  const json = `${JSON.stringify(incidents, null, 2)}\n`;
  await Promise.all([writeFile(processedPath, json), writeFile(serverPath, json)]);
  console.log(`Imported ${incidents.length.toLocaleString()} ASRS records from ${rawPath}`);
  console.log(`Wrote ${processedPath}`);
  console.log(`Wrote ${serverPath}`);
}

await main();
