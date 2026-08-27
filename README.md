# MarketLens

MarketLens is an open-source, self-hostable local business intelligence
platform. It turns place data into normalized business records, deterministic
market analytics, competitor intelligence, optional AI insights, and portable
exports.

MarketLens is not a Google Maps scraper. OpenStreetMap/Overpass is the default
provider so a local installation remains useful without paid data or AI APIs.

## Status

Sprint 6 (`v0.7.0`) is complete. Completed research now has a responsive
results dashboard with market metric cards, rating/review distributions,
business search and sorting, competition scores, plus clear loading, empty, and
error states.

## Quick start

Requirements:

- Node.js 24+
- npm 11+
- Docker Desktop, for PostgreSQL and the Compose workflow

```bash
git clone https://github.com/GipsyDanger-dev/MarketLens.git
cd MarketLens
copy .env.example .env
npm install
docker compose up -d postgres
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The application health
endpoint is available at [http://localhost:3000/api/health](http://localhost:3000/api/health).

## Development checks

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Run browser tests after installing a Playwright browser:

```bash
npx playwright install chromium
npm run test:e2e --workspace=@marketlens/web
```

## Architecture principles

- Core analytics must work without AI.
- Core business logic must not depend on Google Places.
- Place and AI integrations use provider adapters.
- Provider-specific data stays outside normalized analytics models.
- Secrets remain server-side and the project remains self-hostable.

See [docs/provider-sdk.md](docs/provider-sdk.md) for Overpass configuration,
limits, attribution, and the contract for new adapters.
See [docs/research-pipeline.md](docs/research-pipeline.md) for the collection
lifecycle, API, retry behavior, and operational constraints.
See [docs/normalization.md](docs/normalization.md) for canonicalization,
deduplication confidence, and data-quality metrics.
See [docs/analytics.md](docs/analytics.md) for deterministic metric, scoring,
and opportunity-signal rules.
See [docs/results-dashboard.md](docs/results-dashboard.md) for the results
endpoint and dashboard behavior.

See the product and implementation plans in [01_PRD.md](01_PRD.md),
[02_BLUEPRINT.md](02_BLUEPRINT.md), and [03_SPRINT_PLAN.md](03_SPRINT_PLAN.md).

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md), follow the
[Code of Conduct](CODE_OF_CONDUCT.md), and report vulnerabilities according to
[SECURITY.md](SECURITY.md).

## License

MarketLens is licensed under the [Apache License 2.0](LICENSE).
