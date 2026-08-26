# 03_SPRINT_PLAN.md

# MarketLens Sprint Plan — Zero to Fully Functional

## Delivery Model

Recommended duration: **1 week per sprint**

Total: **13 development sprints + 1 release sprint**

Every sprint ends with:

- working build
- tests for new core logic
- docs update
- clean Git history
- push to GitHub
- demoable increment

## Sprint 0 — Product & Repository Foundation

Goal: professional open-source repository before feature development.

Tasks:

- Initialize repository.
- Next.js + TypeScript.
- Tailwind + shadcn/ui.
- Prisma.
- PostgreSQL.
- ESLint.
- Prettier.
- Vitest.
- Playwright skeleton.
- Docker Compose.
- `.env.example`.
- README.
- LICENSE.
- CONTRIBUTING.
- CODE_OF_CONDUCT.
- SECURITY.
- GitHub issue templates.
- PR template.
- CI workflow.

Exit criteria:

```text
git clone
npm install
docker compose up -d
npm run dev
```

works.

Release: `v0.1.0`

## Sprint 1 — Core Domain & Database

Goal: provider-neutral domain models and persistence.

Tasks:

- Prisma schema.
- User.
- ResearchProject.
- ResearchJob.
- Place.
- MarketMetrics.
- CompetitorScore.
- AIInsight.
- Report.
- Migrations.
- Prisma singleton.
- Core types.
- Zod validators.
- Research status machine.
- Database tests.

Exit criteria:
Research projects can be created, stored, loaded, and deleted.

Release: `v0.2.0`

## Sprint 2 — Provider SDK + OpenStreetMap Adapter

Goal: extensible data collection with a free default.

Tasks:

- PlaceProvider interface.
- Provider capabilities.
- Provider registry.
- Provider test kit.
- OpenStreetMap/Overpass adapter.
- Search mapping.
- Pagination/limits.
- Provider error handling.
- Health check.
- Provider docs.

Exit criteria:
User can run a provider search and receive normalized raw candidate places.

Release: `v0.3.0`

## Sprint 3 — Research Collection Pipeline

Goal: convert provider results into persistent research datasets.

Tasks:

- Research orchestration.
- Job status tracking.
- Progress updates.
- Persist places.
- Retry strategy.
- Failed-item handling.
- Idempotency.
- Retry behavior.
- Progress UI.

Exit criteria:
Research can run from QUEUED to READY/FAILED with visible progress.

Release: `v0.4.0`

## Sprint 4 — Normalization & Deduplication

Goal: clean, consistent datasets.

Tasks:

- Normalize business names.
- Normalize categories.
- Normalize addresses.
- Normalize coordinates.
- Primary dedupe.
- Cross-provider dedupe groundwork.
- Confidence score for probable duplicates.
- Data quality metrics.
- Unit tests.

Exit criteria:
Repeated provider results do not create duplicate research rows.

Release: `v0.5.0`

## Sprint 5 — Market Analytics Engine

Goal: deterministic local market intelligence.

Tasks:

- Total businesses.
- Rating statistics.
- Review statistics.
- Rating distribution.
- Review distribution.
- Haversine distance.
- Density metrics.
- Competition scoring.
- Explainable score components.
- Opportunity signal rules.
- Analytics tests.

Exit criteria:
Completed research produces deterministic metrics without AI.

Release: `v0.6.0`

## Sprint 6 — Results Dashboard & Visualization

Goal: make research visually understandable.

Tasks:

- Research results page.
- Metric cards.
- Business table.
- Search/filter/sort.
- Rating chart.
- Review chart.
- Rating vs review scatter.
- Competitor ranking chart.
- Empty/error/loading states.
- Responsive design.

Exit criteria:
A non-technical user can understand the market without raw JSON.

Release: `v0.7.0`

## Sprint 7 — Map & Geospatial Intelligence

Goal: add geographic context.

Tasks:

- MapLibre/Leaflet integration.
- Markers.
- Clustering.
- Selected place state.
- Radius visualization.
- Density visualization.
- Table ↔ map sync.
- Map filters.
- Geospatial UI polish.

Exit criteria:
User can understand business distribution and clusters.

Release: `v0.8.0`

## Sprint 8 — Competitor Intelligence

Goal: actionable competitive analysis.

Tasks:

- Competitor ranking.
- Competitor detail.
- Score breakdown.
- Nearby competitor logic.
- Strongest competitor identification.
- Weak competitor identification.
- Explainable strengths/weaknesses.
- Comparison table.

Exit criteria:
User can answer:

```text
Who are the strongest competitors?
Why are they strong?
How do they compare?
```

Release: `v0.9.0-alpha.1`

## Sprint 9 — AI Intelligence Layer

Goal: optional AI interpretation without making AI a dependency.

Tasks:

- AI provider interface.
- Gemini adapter.
- Structured output.
- Prompt versioning.
- Market summary.
- Competition insights.
- Opportunity interpretation.
- Risks.
- Recommendations.
- Limitations.
- Retry.
- Timeout.
- AI-disabled mode.
- Mock AI for tests.

Exit criteria:
AI-enabled research generates structured insights, while AI-disabled mode remains fully usable.

Release: `v0.9.0-alpha.2`

## Sprint 10 — Google Places Optional Adapter

Goal: richer optional provider.

Tasks:

- Google Places adapter.
- Provider config UI.
- API-key validation.
- Field selection.
- Provider attribution.
- Data retention considerations.
- Capability mapping.
- Provider docs.
- Adapter tests.

Exit criteria:
Users with Google API credentials can choose Google Places without changing core code.

Release: `v0.9.0-beta.1`

## Sprint 11 — Export & Professional Reports

Goal: make research portable.

Tasks:

- CSV export.
- JSON export.
- PDF report.
- Executive summary.
- Research methodology.
- Metrics.
- Competitors.
- AI insights.
- Limitations.
- Report metadata.

Exit criteria:
User can export research as CSV, JSON, and PDF.

Release: `v0.9.0-beta.2`

## Sprint 12 — Self-Hosting & Production Hardening

Goal: genuinely usable open-source deployment.

Tasks:

- Production Docker image.
- Docker Compose production profile.
- Self-hosting guide.
- Environment validation.
- Security audit.
- Rate limiting.
- Error boundaries.
- Retry UI.
- Logging.
- Database backup docs.
- API key security.
- Performance pass.
- Accessibility pass.
- Mobile pass.

Exit criteria:
A new user can deploy MarketLens from documentation without maintainer help.

Release: `v0.9.0-rc.1`

## Sprint 13 — Public Open-Source Release

Goal: polished v1.0.0.

Tasks:

- Landing page.
- GitHub screenshots.
- Architecture diagram.
- Demo dataset.
- Demo video/GIF.
- README overhaul.
- Quick-start guide.
- Provider development guide.
- Contribution guide review.
- Known limitations.
- Changelog.
- Release notes.
- GitHub topics.
- Repository description.
- First good issues.
- Roadmap.

Exit criteria:

```text
Discover MarketLens
↓
Open GitHub
↓
Understand product in < 2 minutes
↓
Run locally in < 15 minutes
↓
Complete first research
↓
Export results
```

Release: `v1.0.0`

## Fully Functional v1.0 Goal

Installation:

- local npm development
- Docker Compose
- PostgreSQL

Providers:

- OpenStreetMap / Overpass
- Google Places optional

Research:

- create
- run
- track
- retry
- delete

Data Pipeline:

- collection
- normalization
- deduplication
- persistence

Intelligence:

- market metrics
- geographic density
- competition scoring
- competitor ranking
- opportunity signals

Visualization:

- table
- charts
- interactive map

AI:

- optional provider
- market insights
- risks
- recommendations
- limitations

Export:

- CSV
- JSON
- PDF

Open Source:

- contributor docs
- provider SDK
- tests
- CI
- Docker
- security policy

## Sprint Quality Gate

A sprint is NOT complete unless:

```text
npm run lint        ✓
npm run typecheck   ✓
npm run test        ✓
npm run build       ✓
```

For UI:

```text
responsive check    ✓
loading state       ✓
error state         ✓
empty state         ✓
```

For provider code:

```text
provider tests      ✓
error mapping       ✓
rate handling       ✓
documentation       ✓
```

## Git Rule

Recommended:

```text
1 logical task
=
1 commit
```

Push commits to the remote after at most every 3 logical changes (3 commits).
Push sooner when a milestone, handoff, or backup point requires it.

Examples:

```text
feat(provider): add provider registry
feat(osm): implement overpass search
feat(analytics): calculate market density
feat(map): add clustered business markers
fix(dedupe): prevent duplicate external ids
docs(self-hosting): add docker quick start
```

Never accumulate an entire sprint into one commit.

## Post-v1.0 Roadmap

v1.1:

- Research comparison.
- Custom scoring profiles.
- Better heatmaps.

v1.2:

- Provider plugin packages.
- Foursquare/Yelp adapters.
- CSV import provider.

v1.3:

- Ollama/local AI support.
- Local embeddings.
- Offline reports.

v1.4:

- Historical snapshots.
- Change tracking.
- Scheduled research.

v2.0:

- Worker architecture.
- Queue support.
- Multi-user organizations.
- Collaborative research.
- Plugin marketplace.
