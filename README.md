# MarketLens

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)

**Open-source local market intelligence that you can inspect, self-host, and
extend.**

MarketLens collects place data, normalizes it into a reusable dataset, and turns
it into explainable market analytics, geographic context, competitor rankings,
optional AI interpretation, and portable reports.

It is not a Google Maps scraper. OpenStreetMap/Overpass is the default provider,
so the core workflow works without paid data APIs or AI credentials.

## What you can do

- Create and run a local-market research project for a category and location.
- Collect from OpenStreetMap/Overpass, or configure Google Places when you have
  an approved API key.
- Normalize and deduplicate place records before calculating metrics.
- Explore businesses in a filterable table, charts, and interactive map.
- Compare competitors with configurable, explainable score components.
- Generate optional AI insights that separate supplied facts from interpretation.
- Export CSV, JSON, and a PDF report with methodology and limitations.
- Deploy the stack yourself with PostgreSQL and Docker Compose.

## In two minutes

```text
Choose a provider + market
          ↓
Collect and persist candidate places
          ↓
Normalize + deduplicate
          ↓
Calculate deterministic market and competitor metrics
          ↓
Explore map, table, charts, insights, and exports
```

The landing page links directly to `/research/new`. For a live first run, keep
OpenStreetMap selected and use the prefilled `coffee shop` / `Malang, Indonesia`
example. No API key is required.

## Local-first quick start

Requirements: Node.js 24+, npm 11+, and Docker Desktop with Docker Compose.

After the CLI package is published to npm, the shortest path is:

```bash
npx @gipsydanger-dev/marketlens init
npx @gipsydanger-dev/marketlens up
```

The CLI creates local configuration and a strong PostgreSQL password in `.env`,
then serves the dashboard at `http://localhost:3000`. It binds the local web
and PostgreSQL ports to loopback only. See the [local-first guide](docs/local-first.md)
for configuration, diagnostics, external PostgreSQL, and source checkout use.

To run from a cloned checkout today:

```bash
git clone https://github.com/GipsyDanger-dev/MarketLens.git
cd MarketLens
npm install
node apps/cli/src/index.js init
node apps/cli/src/index.js up
```

Open [http://localhost:3000](http://localhost:3000), create a project, and run
it. Process health is available at [http://localhost:3000/api/health](http://localhost:3000/api/health).

For a hardened production stack, backups, environment configuration, and
migration commands, follow the [self-hosting guide](docs/self-hosting.md).

## Providers and AI

| Integration              | Included | Key required | Notes                                                                        |
| ------------------------ | -------- | ------------ | ---------------------------------------------------------------------------- |
| OpenStreetMap / Overpass | Yes      | No           | Default, free provider; respect instance limits and attribution.             |
| Google Places (New)      | Optional | Yes          | Server-side key only; uses approved API access, never scraping.              |
| Gemini                   | Optional | Yes          | Produces guarded interpretation; data and exports remain usable if it fails. |

Read the [provider development guide](docs/provider-sdk.md) before adding an
adapter. The [AI guide](docs/ai-insights.md) documents inputs, guardrails,
timeouts, and retry behavior.

## Documentation

- [Architecture](docs/architecture.md)
- [Research pipeline](docs/research-pipeline.md)
- [Analytics and scoring](docs/analytics.md)
- [Map and geospatial UI](docs/map.md)
- [Competitor intelligence](docs/competitors.md)
- [Exports and reports](docs/exports.md)
- [Demo dataset](docs/demo-dataset.md)
- [Local-first CLI](docs/local-first.md)
- [Self-hosting and operations](docs/self-hosting.md)
- [Known limitations](docs/known-limitations.md)
- [Public roadmap](docs/roadmap.md)
- [v1.0.0 release notes](docs/release-v1.0.md)

The project direction is recorded in the [PRD](01_PRD.md),
[Blueprint](02_BLUEPRINT.md), and [Sprint Plan](03_SPRINT_PLAN.md).

## Development

Run the quality gate before opening a pull request:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Browser tests require a local Playwright browser installation:

```bash
npx playwright install chromium
npm run test:e2e --workspace=@marketlens/web
```

## Contributing and security

Contributions are welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md), follow
the [Code of Conduct](CODE_OF_CONDUCT.md), and use the GitHub issue and pull
request templates. Please report vulnerabilities privately according to
[SECURITY.md](SECURITY.md), never in a public issue.

## License

MarketLens is dual-licensed under the [Apache License 2.0](LICENSE) or the
[MIT License](LICENSE-MIT), at your option. The Apache license remains the
repository's primary `LICENSE` file; retain the applicable copyright and
license notices when redistributing the project.
