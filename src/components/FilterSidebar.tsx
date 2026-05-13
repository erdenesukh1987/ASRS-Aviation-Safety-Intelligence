import { RotateCcw } from "lucide-react";
import type { FilterOptions, IncidentFilters } from "../data/schema";

type Props = {
  filters: IncidentFilters;
  options: FilterOptions;
  onChange: (filters: IncidentFilters) => void;
};

const labels: Record<string, string> = {
  exact_only: "Exact airport matches only",
  include_approximate: "Include approximate/state-level locations",
  include_deidentified: "Include de-identified records",
  high: "High",
  medium: "Medium",
  low: "Low",
  unknown: "Unknown"
};

const label = (value: string | number) => labels[String(value)] ?? String(value).replaceAll("_", " ");

function SelectField({ name, value, options, onChange }: { name: string; value?: string | number; options: (string | number)[]; onChange: (value: string) => void }) {
  return (
    <label>
      <span>{name}</span>
      <select value={value ?? "all"} onChange={(event) => onChange(event.target.value)}>
        <option value="all">All</option>
        {options.map((option) => <option key={option} value={option}>{label(option)}</option>)}
      </select>
    </label>
  );
}

export function FilterSidebar({ filters, options, onChange }: Props) {
  const set = (patch: Partial<IncidentFilters>) => onChange({ ...filters, ...patch });
  const minYear = options.years[0] ?? 2015;
  const maxYear = options.years.at(-1) ?? 2025;
  return (
    <div className="filters">
      <div className="filter-header">
        <strong>Filters</strong>
        <button onClick={() => onChange({ startYear: minYear, endYear: maxYear, altitudeMin: 0, altitudeMax: 6000 })} title="Reset filters">
          <RotateCcw size={15} />
        </button>
      </div>
      <div className="range-row">
        <label><span>Start year</span><input type="number" min={minYear} max={maxYear} value={filters.startYear ?? minYear} onChange={(event) => set({ startYear: Number(event.target.value) })} /></label>
        <label><span>End year</span><input type="number" min={minYear} max={maxYear} value={filters.endYear ?? maxYear} onChange={(event) => set({ endYear: Number(event.target.value) })} /></label>
      </div>
      <SelectField name="Mission" value={filters.operationType} options={options.operationTypes} onChange={(value) => set({ operationType: value as IncidentFilters["operationType"] })} />
      <SelectField name="Flight phase" value={filters.flightPhase} options={options.flightPhases} onChange={(value) => set({ flightPhase: value as IncidentFilters["flightPhase"] })} />
      <SelectField name="Event type / anomaly" value={filters.eventType ?? filters.incidentType} options={options.eventTypes} onChange={(value) => set({ eventType: value, incidentType: value })} />
      <SelectField name="Severity / risk level" value={filters.severity} options={options.severities} onChange={(value) => set({ severity: value as IncidentFilters["severity"] })} />
      <SelectField name="Primary problem" value={filters.primaryProblem} options={options.primaryProblems} onChange={(value) => set({ primaryProblem: value })} />
      <SelectField name="Operating environment (inferred)" value={filters.operatingEnvironment} options={options.operatingEnvironments} onChange={(value) => set({ operatingEnvironment: value as IncidentFilters["operatingEnvironment"] })} />
      <SelectField name="Location confidence" value={filters.coordinateConfidence} options={options.coordinateConfidences} onChange={(value) => set({ coordinateConfidence: value as IncidentFilters["coordinateConfidence"] })} />
      <SelectField name="Map display" value={filters.mapDisplay} options={["exact_only", "include_approximate", "include_deidentified"]} onChange={(value) => set({ mapDisplay: value as IncidentFilters["mapDisplay"] })} />
      <SelectField name="State" value={filters.state} options={options.states} onChange={(value) => set({ state: value })} />
      <SelectField name="Flight conditions" value={filters.flightConditions} options={options.flightConditions} onChange={(value) => set({ flightConditions: value })} />
      <SelectField name="Light condition" value={filters.lightCondition} options={options.lightConditions} onChange={(value) => set({ lightCondition: value })} />
      <SelectField name="Airspace" value={filters.airspace} options={options.airspaces} onChange={(value) => set({ airspace: value })} />
      <SelectField name="ATC / advisory" value={filters.atcAdvisory} options={options.atcAdvisories} onChange={(value) => set({ atcAdvisory: value })} />
      <SelectField name="Aircraft make / model" value={filters.aircraftType} options={options.aircraftTypes} onChange={(value) => set({ aircraftType: value })} />
      <SelectField name="Detector" value={filters.detector} options={options.detectors} onChange={(value) => set({ detector: value })} />
      <SelectField name="Result" value={filters.result} options={options.results} onChange={(value) => set({ result: value })} />
      <div className="range-row">
        <label><span>Alt min</span><input type="number" value={filters.altitudeMin ?? 0} onChange={(event) => set({ altitudeMin: Number(event.target.value) })} /></label>
        <label><span>Alt max</span><input type="number" value={filters.altitudeMax ?? 6000} onChange={(event) => set({ altitudeMax: Number(event.target.value) })} /></label>
      </div>
    </div>
  );
}
