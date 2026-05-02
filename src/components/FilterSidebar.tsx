import { RotateCcw } from "lucide-react";
import type { FilterOptions, IncidentFilters } from "../data/schema";

type Props = {
  filters: IncidentFilters;
  options: FilterOptions;
  onChange: (filters: IncidentFilters) => void;
};

const label = (value: string | number) => String(value).replaceAll("_", " ");

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
  return (
    <div className="filters">
      <div className="filter-header">
        <strong>Filters</strong>
        <button onClick={() => onChange({ startYear: 2018, endYear: 2025, altitudeMin: 0, altitudeMax: 6000 })} title="Reset filters">
          <RotateCcw size={15} />
        </button>
      </div>
      <div className="range-row">
        <label><span>Start year</span><input type="number" min="2018" max="2025" value={filters.startYear ?? 2018} onChange={(event) => set({ startYear: Number(event.target.value) })} /></label>
        <label><span>End year</span><input type="number" min="2018" max="2025" value={filters.endYear ?? 2025} onChange={(event) => set({ endYear: Number(event.target.value) })} /></label>
      </div>
      <SelectField name="Incident type" value={filters.incidentType} options={options.incidentTypes} onChange={(value) => set({ incidentType: value })} />
      <SelectField name="Risk severity" value={filters.severity} options={options.severities} onChange={(value) => set({ severity: value as IncidentFilters["severity"] })} />
      <SelectField name="Aircraft type" value={filters.aircraftType} options={options.aircraftTypes} onChange={(value) => set({ aircraftType: value })} />
      <SelectField name="Flight phase" value={filters.flightPhase} options={options.flightPhases} onChange={(value) => set({ flightPhase: value as IncidentFilters["flightPhase"] })} />
      <SelectField name="Airport type" value={filters.airportType} options={options.airportTypes} onChange={(value) => set({ airportType: value as IncidentFilters["airportType"] })} />
      <SelectField name="State" value={filters.state} options={options.states} onChange={(value) => set({ state: value })} />
      <SelectField name="Region" value={filters.region} options={options.regions} onChange={(value) => set({ region: value })} />
      <SelectField name="Weather" value={filters.weather} options={options.weatherConditions} onChange={(value) => set({ weather: value })} />
      <SelectField name="Visibility" value={filters.visibility} options={options.visibility} onChange={(value) => set({ visibility: value })} />
      <SelectField name="Operation" value={filters.operationType} options={options.operationTypes} onChange={(value) => set({ operationType: value as IncidentFilters["operationType"] })} />
      <SelectField name="Event category" value={filters.eventCategory} options={options.eventCategories} onChange={(value) => set({ eventCategory: value })} />
      <SelectField name="Contributing factor" value={filters.contributingFactor} options={options.contributingFactors} onChange={(value) => set({ contributingFactor: value })} />
      <div className="range-row">
        <label><span>Alt min</span><input type="number" value={filters.altitudeMin ?? 0} onChange={(event) => set({ altitudeMin: Number(event.target.value) })} /></label>
        <label><span>Alt max</span><input type="number" value={filters.altitudeMax ?? 6000} onChange={(event) => set({ altitudeMax: Number(event.target.value) })} /></label>
      </div>
    </div>
  );
}
