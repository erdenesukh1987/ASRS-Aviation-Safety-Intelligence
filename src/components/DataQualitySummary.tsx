import type { AsrsIncident } from "../data/schema";

function pct(value: number, total: number) {
  return total ? `${Math.round((value / total) * 100)}%` : "0%";
}

export function DataQualitySummary({ incidents }: { incidents: AsrsIncident[] }) {
  const total = incidents.length;
  const exact = incidents.filter((item) => item.locationStatus === "exact_airport_match").length;
  const fuzzy = incidents.filter((item) => item.locationStatus === "airport_name_match").length;
  const state = incidents.filter((item) => item.locationStatus === "state_fallback").length;
  const deidentified = incidents.filter((item) => item.locationStatus === "deidentified_location").length;
  const unmapped = incidents.filter((item) => item.locationStatus === "unknown_location" || item.latitude === null || item.longitude === null).length;
  const coverage = exact + fuzzy;
  const cards = [
    ["Total records", total.toLocaleString()],
    ["Exact airport matches", exact.toLocaleString()],
    ["Airport name matches", fuzzy.toLocaleString()],
    ["State-level approximations", state.toLocaleString()],
    ["De-identified records", deidentified.toLocaleString()],
    ["Unmapped records", unmapped.toLocaleString()],
    ["Mappable coverage", pct(coverage, total)]
  ];

  return (
    <section className="data-quality">
      <div className="section-title">
        <div>
          <strong>Data Quality Summary</strong>
          <span>Location precision is explicit because ASRS reports may be de-identified or generalized.</span>
        </div>
      </div>
      <div className="quality-grid">
        {cards.map(([label, value]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
