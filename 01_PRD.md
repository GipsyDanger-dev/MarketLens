# 01_PRD.md

# MarketLens — Open-Source Local Business Intelligence Platform

## 1. Product Summary

MarketLens is an open-source local business intelligence platform that helps users collect, normalize, analyze, visualize, and interpret local business data from configurable data providers.

The project is designed to be self-hostable, provider-agnostic, contributor-friendly, and useful for researchers, entrepreneurs, students, consultants, and developers who need structured local-market insights.

MarketLens is not positioned as a generic Google Maps scraper.

Its core value proposition is:

> Collect local business data, transform it into structured market intelligence, compare competitors, analyze geographic patterns, and generate explainable insights.

## 2. Product Vision

Build the most accessible open-source toolkit for local market intelligence.

A user should be able to:
1. Search a category and location.
2. Collect business/place data from one or more providers.
3. Normalize and deduplicate the data.
4. Explore the market through tables, charts, maps, and metrics.
5. Rank competitors using explainable scoring.
6. Generate optional AI-assisted market insights.
7. Export the result for further analysis.
8. Self-host the entire application.

## 3. Open-Source Positioning

MarketLens should be:
- Open source.
- Self-hostable.
- Easy to fork.
- Easy to extend.
- Provider-agnostic.
- AI-provider-agnostic where possible.
- Contributor-friendly.
- Useful even without paid APIs.

The project should avoid architecture that requires a single commercial provider.

## 4. Core Problems

Local market research is often manual and fragmented.

Typical workflow today:
1. Search businesses one by one.
2. Copy names, ratings, addresses, categories, and links.
3. Put data into spreadsheets.
4. Remove duplicates manually.
5. Calculate statistics.
6. Compare competitors.
7. Interpret geographic patterns.
8. Write conclusions manually.

MarketLens turns this process into a reproducible intelligence pipeline.

## 5. Target Users

Primary users:
- Entrepreneurs evaluating a local market.
- Small business owners studying competitors.
- Students doing market research.
- Business consultants.
- Market researchers.
- Data analysts.
- Developers experimenting with geospatial/business data.

Secondary users:
- Incubators.
- Universities.
- Local economic researchers.
- Open-source contributors.
- Franchise expansion teams.
- Community mapping projects.

## 6. Example Use Cases

### Market Research
Input:
- Category: Coffee Shop
- Location: Malang
- Radius: 5 km

Output:
- Business count
- Average rating
- Median reviews
- Market density
- Top competitors
- Competition score
- Geographic distribution
- Opportunity signals

### Competitor Analysis
Input:
- Selected business
- Search radius

Output:
- Nearby competitors
- Comparative ratings
- Review authority
- Distance
- Competition ranking
- Strengths and weaknesses

### Location Intelligence
Input:
- Category
- Candidate area

Output:
- Density map
- Competition intensity
- Business clusters
- Underserved zones
- Opportunity signals

### Research Export
Output:
- CSV
- JSON
- PDF report

## 7. Data Provider Architecture

MarketLens must use a provider adapter pattern.

Supported MVP providers:
1. OpenStreetMap / Overpass
2. Google Places API (optional)

Future providers:
- Foursquare
- Yelp
- Custom CSV
- Custom REST provider
- Community-developed adapters

Provider interface:

```ts
interface PlaceProvider {
  search(params: SearchParams): Promise<RawPlace[]>;
  getDetails?(externalId: string): Promise<RawPlaceDetails>;
  healthCheck?(): Promise<ProviderHealth>;
}
```

Core business logic must never depend directly on a specific provider implementation.

## 8. AI Provider Architecture

AI is optional.

The product must remain useful without AI.

```ts
interface AIProvider {
  generateInsight(input: InsightInput): Promise<InsightResult>;
}
```

Possible providers:
- Gemini
- OpenAI
- Claude
- Ollama
- Local models

## 9. Core User Flow

```text
Sign In / Local Mode
        ↓
Create Research
        ↓
Choose Provider
        ↓
Enter Category + Location
        ↓
Collect Places
        ↓
Normalize
        ↓
Deduplicate
        ↓
Persist
        ↓
Calculate Metrics
        ↓
Map + Charts + Table
        ↓
Competitor Analysis
        ↓
Optional AI Insights
        ↓
Export / Report
```

## 10. Core MVP Features

### Research Management
- Create research.
- List research.
- View research.
- Delete research.
- Duplicate research configuration.
- Track research status.

### Data Collection
- Search by text/category/location.
- Radius-based search where provider supports it.
- Pagination.
- Retry failed provider requests.
- Provider-specific rate handling.
- Collection progress.

### Normalization
- Normalize names.
- Normalize categories.
- Normalize coordinates.
- Normalize addresses.
- Normalize provider metadata.

### Deduplication
Primary:
- provider + external ID

Secondary:
- normalized name + coordinates

### Market Analytics
- Business count.
- Average rating.
- Median rating.
- Average review count.
- Median review count.
- Rating distribution.
- Review distribution.
- Geographic density.
- Competitor ranking.
- Competition score.

### Visualization
- Interactive map.
- Business markers.
- Marker clustering.
- Business table.
- Rating distribution chart.
- Review distribution chart.
- Rating vs review scatter plot.
- Competitor ranking chart.

### AI Insights
Optional:
- Market summary.
- Competition insights.
- Opportunity signals.
- Risks.
- Recommendations.
- Limitations.

### Export
- CSV
- JSON
- PDF report

## 11. Explainable Scoring

Example default:

```text
Competition Score =
  Rating Strength     30%
  Review Authority    30%
  Local Density       20%
  Proximity           20%
```

All weights must be configurable and exposed.

## 12. Opportunity Signals

MarketLens may produce opportunity signals, but must not claim guaranteed commercial success.

Possible signals:
- Low competitor density.
- Moderate-to-high review activity nearby.
- Lack of highly rated incumbents.
- Geographic gaps.
- Category underrepresentation.

Use wording such as:
- Potential opportunity.
- Market signal.
- Possible gap.
- Area worth further validation.

## 13. AI Guardrails

AI must:
- Use only supplied data and computed metrics.
- Never invent businesses.
- Never invent ratings.
- Never invent review counts.
- Clearly separate facts from interpretation.
- Mention sample size.
- Mention collection timestamp.
- Include limitations.
- Avoid claiming causality without evidence.
- Avoid guaranteed recommendations.

## 14. Research Statuses

```text
DRAFT
QUEUED
COLLECTING
NORMALIZING
ANALYZING
READY
FAILED
```

## 15. Main Screens

Landing Page:
- Product overview.
- Open-source positioning.
- Screenshots.
- Features.
- Supported providers.
- GitHub CTA.
- Self-hosting CTA.

Dashboard:
- Total research projects.
- Total businesses analyzed.
- Recently completed research.
- Provider usage.
- Quick create.

Create Research:
- Research name.
- Data provider.
- Category/query.
- Location.
- Radius.
- Maximum results.
- Optional filters.

Research Progress:
- Current stage.
- Places discovered.
- Places processed.
- Failures.
- Duration.

Research Results:
- Overview metrics.
- Map.
- Charts.
- Competitor table.
- Rankings.
- AI insights.
- Export buttons.

Settings:
- Data providers.
- API keys.
- AI provider.
- Scoring configuration.
- Privacy/storage options.

## 16. Authentication Modes

Hosted/public deployment:
- Auth.js
- Google OAuth

Self-hosted/local mode:
- Optional authentication.
- Environment-configurable local mode.

Future:
- GitHub OAuth.
- Email/password.
- SSO.

## 17. High-Level Data Model

Core entities:
- User
- ResearchProject
- ResearchJob
- Place
- PlaceSnapshot
- MarketMetrics
- CompetitorScore
- AIInsight
- Report
- ProviderConfig

Provider-specific raw data should be isolated from normalized application data.

## 18. Privacy and Data Handling

MarketLens should:
- Keep API keys server-side.
- Avoid exposing provider secrets.
- Allow users to delete research.
- Provide configurable retention.
- Clearly identify external data sources.
- Respect provider terms.
- Avoid bypassing anti-bot systems.
- Avoid CAPTCHA bypass.
- Avoid login/session scraping.
- Support compliant provider adapters.

## 19. Non-Goals

The MVP is not intended to:
- Circumvent Google Maps protections.
- Bypass CAPTCHAs.
- Scrape private data.
- Build user profiles.
- Estimate real revenue without reliable data.
- Guarantee business success.
- Replace professional market research.
- Monitor businesses continuously in real time.
- Perform aggressive high-volume scraping.

## 20. Open-Source Requirements

Repository must contain:
- README.md
- LICENSE
- CONTRIBUTING.md
- CODE_OF_CONDUCT.md
- SECURITY.md
- CHANGELOG.md
- .env.example
- Docker support
- Issue templates
- Pull request template
- Development setup guide
- Provider adapter guide
- Architecture documentation

Recommended license:
- Apache-2.0 or MIT

Recommended default:
- Apache-2.0 for explicit patent protection.

## 21. Repository Goals

A new contributor should be able to:
1. Clone repository.
2. Copy `.env.example`.
3. Start PostgreSQL with Docker.
4. Run migrations.
5. Start application.
6. Use OpenStreetMap provider without paid API.
7. Create research.
8. See market analytics.
9. Add a provider through documented interface.

Target onboarding:
`clone → install → configure → run < 15 minutes`

## 22. Technology Stack

Frontend:
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Recharts

Backend:
- Next.js Server Actions / Route Handlers

Database:
- PostgreSQL
- Prisma ORM

Maps:
- Leaflet or MapLibre for provider-neutral visualization

Data Providers:
- OpenStreetMap / Overpass
- Google Places adapter

AI:
- Provider adapter
- Gemini initially

Export:
- CSV
- JSON
- @react-pdf/renderer

Deployment:
- Docker
- Docker Compose
- Vercel-compatible hosted frontend
- PostgreSQL-compatible database

## 23. Performance Goals

- Dashboard initial load: < 2.5 s
- Cached research load: < 1.5 s
- Analytics calculation: < 3 s for 1,000 normalized places
- Research progress visible during long jobs
- AI failure must not invalidate collected data

## 24. Reliability Goals

```text
Collect
↓
Persist
↓
Analytics
↓
AI
```

AI is never a blocking dependency for core research data.

If AI fails:
- Dataset remains available.
- Charts remain available.
- Metrics remain available.
- User can retry insight generation.

## 25. Success Criteria

MVP is successful when a user can:
1. Self-host MarketLens.
2. Create research.
3. Select a provider.
4. Collect local business/place data.
5. Deduplicate results.
6. View normalized results.
7. View businesses on a map.
8. View market statistics.
9. View competitor rankings.
10. Generate optional AI insights.
11. Export CSV/JSON.
12. Generate PDF report.
13. Configure providers.
14. Use the application without a paid data provider.
15. Add a new provider using documented interfaces.

## 26. Product Success Metrics

Open-source:
- GitHub stars.
- Forks.
- Contributors.
- Issues resolved.
- Provider adapters contributed.
- Releases.

Product:
- Research projects completed.
- Businesses analyzed.
- Report exports.
- Repeat research sessions.

Quality:
- Collection success rate.
- Provider error rate.
- AI failure rate.
- Test coverage.
- Build reliability.

## 27. Final Product Statement

> MarketLens is an open-source local business intelligence platform that transforms place data into explainable market analytics, competitor intelligence, geographic insights, and optional AI-assisted recommendations.

The differentiator is the reusable intelligence pipeline:

```text
DATA PROVIDERS
      ↓
COLLECTION
      ↓
NORMALIZATION
      ↓
DEDUPLICATION
      ↓
GEOSPATIAL ANALYTICS
      ↓
COMPETITOR INTELLIGENCE
      ↓
OPTIONAL AI
      ↓
EXPORTABLE INSIGHTS
```
