import { generateIncidents } from "../data/generateIncidents";
import type { AsrsIncident, FilterOptions } from "../data/schema";
import { buildFilterOptions } from "./filtering";

export type ApiFilterOptions = FilterOptions & { dataSource?: string };

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json() as Promise<T>;
}

export async function loadDashboardData() {
  try {
    const incidents = await getJson<AsrsIncident[]>("/data/asrs_incidents.json");
    return {
      incidents,
      filterOptions: buildFilterOptions(incidents),
      dataSource: "NASA ASRS Historical Reports",
      fallback: false
    };
  } catch {
    // Static JSON is the deployment path. The local API remains a development fallback.
  }

  try {
    const [incidents, filters] = await Promise.all([
      getJson<AsrsIncident[]>("/api/asrs/incidents"),
      getJson<ApiFilterOptions>("/api/asrs/filters")
    ]);
    return {
      incidents,
      filterOptions: filters,
      dataSource: filters.dataSource ?? "NASA ASRS Historical Reports",
      fallback: false
    };
  } catch {
    const incidents = generateIncidents();
    return {
      incidents,
      filterOptions: buildFilterOptions(incidents),
      dataSource: "Synthetic fallback dataset",
      fallback: true
    };
  }
}
