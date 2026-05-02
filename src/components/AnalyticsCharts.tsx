import { Bar, BarChart, CartesianGrid, Cell, ComposedChart, Line, LineChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";
import type { AsrsIncident } from "../data/schema";
import type { computeStats } from "../services/analytics";

type Stats = ReturnType<typeof computeStats>;

const palette = ["#38bdf8", "#f97316", "#57c785", "#f43f5e", "#a78bfa", "#facc15", "#2dd4bf", "#fb7185"];

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="chart-card">
      <strong>{title}</strong>
      <div className="chart-body">{children}</div>
    </article>
  );
}

export function AnalyticsCharts({ stats, incidents }: { stats: Stats; incidents: AsrsIncident[] }) {
  const scatter = incidents.slice(0, 350).map((item) => ({ altitude: item.altitude_ft, risk: item.risk_score, severity: item.severity_level }));
  return (
    <section className="charts-grid">
      <ChartCard title="Yearly Incident Trend">
        <ResponsiveContainer>
          <LineChart data={stats.yearlyTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Incident Type Distribution">
        <ResponsiveContainer>
          <BarChart data={stats.incidentDistribution.slice(0, 8)} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={135} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>{stats.incidentDistribution.slice(0, 8).map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Severity Distribution">
        <ResponsiveContainer>
          <BarChart data={stats.severityDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#f97316" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Top Airports By Incident Count">
        <ResponsiveContainer>
          <BarChart data={stats.topAirports} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={135} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="#2dd4bf" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Contributing Factor Frequency">
        <ResponsiveContainer>
          <BarChart data={stats.contributingFactors.slice(0, 8)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-28} textAnchor="end" height={76} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#a78bfa" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Altitude vs Severity / Risk">
        <ResponsiveContainer>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="altitude" name="Altitude" unit=" ft" />
            <YAxis dataKey="risk" name="Risk" />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter data={scatter} fill="#f43f5e" />
          </ScatterChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Monthly / Seasonal Pattern">
        <ResponsiveContainer>
          <ComposedChart data={stats.monthlyPattern}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#38bdf8" radius={[6, 6, 0, 0]} />
            <Line type="monotone" dataKey="value" stroke="#facc15" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Narrative Keyword / Topic Frequency">
        <ResponsiveContainer>
          <BarChart data={stats.keywordFrequency.slice(0, 10)} layout="vertical" margin={{ left: 18 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="#57c785" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </section>
  );
}
