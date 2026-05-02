# ASRS Aviation Safety Data Visualization Dashboard

Research-grade prototype dashboard for exploring ASRS-style aviation safety events at non-towered, uncontrolled, rural, regional, and towered airports. The first prototype focuses on General Aviation, CTAF/uncontrolled airport operations, traffic-pattern conflicts, runway conflicts, and surveillance or situational-awareness gaps.

## Features

- Interactive U.S. incident map with severity-colored, frequency-sized markers and detail selection.
- Flexible ASRS-style data model with 1,250 deterministic synthetic records across multiple years and states.
- Sidebar filtering by year range, incident type, severity, aircraft type, flight phase, airport type, state/region, altitude, weather, visibility, operation type, event category, contributing factor, and keyword.
- KPI cards, trend charts, category distributions, altitude-vs-severity analysis, seasonal patterns, airport ranking, contributing-factor frequency, and keyword/topic frequency.
- Incident detail panel with research classification for the selected event.
- Research insights that summarize dominant risk patterns, high-risk clusters, time trends, surveillance gaps, and candidate taxonomy categories.
- CSV, selected incident CSV, and Markdown research summary export buttons.
- Express API endpoints matching the prototype contract.

## Run Locally

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://127.0.0.1:5173`.

## API

The local Express API runs on `http://127.0.0.1:8787`.

- `GET /api/asrs/incidents`
- `GET /api/asrs/incidents/:id`
- `GET /api/asrs/stats`
- `GET /api/asrs/filters`
- `GET /api/asrs/insights`
- `GET /api/asrs/export`

Supported query parameters include `year`, `startYear`, `endYear`, `incidentType`, `severity`, `aircraftType`, `flightPhase`, `state`, `airportType`, `altitudeMin`, `altitudeMax`, `keyword`, `weather`, `visibility`, `operationType`, `eventCategory`, `contributingFactor`, and `airportCode`.

## Data Generation

The prototype uses deterministic synthetic ASRS-style data in `src/data/generateIncidents.ts`, built from realistic U.S. airport anchors, weighted aviation safety categories, flight phases, aircraft classes, weather conditions, contributing factors, and narrative templates.

To materialize the generated sample dataset as JSON:

```bash
npm run generate:data
```

The output is written to `public/asrs-synthetic-incidents.json`.

## Project Structure

```text
server/                 Express API wrapper
scripts/                Utility scripts
src/components/         Map, charts, KPIs, table, filters, detail panel
src/data/               Data generation and schema
src/services/           API-compatible filtering, stats, exports, insights
src/styles/             Application styles
```

## Research Use

This prototype is designed for screenshots, demos, and early evidence-package framing. It supports an ASRS-based safety analysis workflow by linking map clusters, operational contexts, contributing factors, narrative keywords, and candidate taxonomy classes for non-towered and uncontrolled-airport risk patterns.
