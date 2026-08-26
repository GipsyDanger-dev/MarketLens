# 02_BLUEPRINT.md

# MarketLens Technical Blueprint

## 1. Architecture Objectives

MarketLens must be:
- Self-hostable.
- Provider-agnostic.
- Modular.
- Testable.
- Contributor-friendly.
- Useful without AI.
- Useful without paid APIs.
- Safe to extend.
- Suitable for Docker deployment.

## 2. High-Level Architecture

```text
                    ┌──────────────────────┐
                    │      Web Client      │
                    │ Next.js / React / UI │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Application Layer    │
                    │ Server Actions/API   │
                    └──────────┬───────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
     Research Engine     Analytics Engine     AI Engine
             │                 │                 │
             ▼                 │                 ▼
     Provider Registry         │          AI Provider Registry
             │                 │
       ┌─────┴──────┐          │
       ▼            ▼          │
  OSM Adapter   Google Adapter │
       │            │          │
       └─────┬──────┘          │
             ▼                 ▼
        Normalization ──► PostgreSQL
             │                 │
             ▼                 ▼
        Deduplication      Reports/Exports
```

## 3. Architectural Layers

Presentation Layer:
- Pages
- Components
- Forms
- Charts
- Maps
- Loading/error states

Application Layer:
- Research orchestration
- Authentication
- Authorization
- Server actions
- Commands/queries
- Progress state

Domain Layer:
- Normalization
- Deduplication
- Scoring
- Market metrics
- Opportunity signals
- Geographic calculations

Infrastructure Layer:
- PostgreSQL
- Prisma
- Provider adapters
- AI adapters
- Export
- Logging

## 4. Recommended Repository Structure

```text
marketlens/
├── apps/
│   └── web/
├── packages/
│   ├── core/
│   ├── provider-sdk/
│   ├── providers/
│   │   ├── openstreetmap/
│   │   └── google-places/
│   ├── ai-sdk/
│   └── shared/
├── prisma/
├── docs/
├── .github/
├── docker/
├── docker-compose.yml
├── README.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── CHANGELOG.md
├── LICENSE
└── .env.example
```

A simpler first release may start as a single Next.js app while preserving these logical boundaries.

## 5. Provider SDK

```ts
export interface PlaceProvider {
  id: string;
  name: string;
  capabilities: ProviderCapabilities;
  search(request: PlaceSearchRequest): Promise<PlaceSearchResponse>;
  getDetails?(externalId: string): Promise<RawPlaceDetails>;
  healthCheck?(): Promise<ProviderHealth>;
}
```

```ts
export interface ProviderCapabilities {
  textSearch: boolean;
  nearbySearch: boolean;
  details: boolean;
  ratings: boolean;
  reviewCounts: boolean;
  phone: boolean;
  website: boolean;
  openingHours: boolean;
}
```

Provider Registry:

```text
registerProvider(provider)
getProvider(id)
listProviders()
```

## 6. MVP Providers

OpenStreetMap / Overpass:
- Free/open default provider.
- Basic POI discovery.
- Self-host friendly.
- Ratings/reviews may not exist.

Google Places:
- Optional enriched provider.
- Ratings.
- Review counts.
- Phone.
- Website.
- User-provided API key.
- Provider-specific attribution and retention rules.

## 7. Normalized Place Model

```ts
interface NormalizedPlace {
  id: string;
  provider: string;
  externalId: string;
  name: string;
  normalizedName: string;
  category: string | null;
  providerTypes: string[];
  address: string | null;
  city: string | null;
  district: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
  rating: number | null;
  reviewCount: number | null;
  phone: string | null;
  website: string | null;
  sourceUrl: string | null;
  businessStatus: string | null;
  collectedAt: Date;
}
```

## 8. Deduplication Strategy

Primary:
`provider + externalId`

Cross-provider:
`normalizedName + geographic proximity + category similarity`

Cross-provider dedupe must produce confidence and avoid silent low-confidence merges.

## 9. Research Engine

```text
DRAFT
  ↓
QUEUED
  ↓
COLLECTING
  ↓
NORMALIZING
  ↓
ANALYZING
  ↓
READY
```

Any state may transition to FAILED.

## 10. Job Orchestration

MVP:
- Server-side async task abstraction.
- Progress persisted in database.

Future:
- BullMQ
- Redis
- Worker service
- Temporal
- Cloud queue

Do not require Redis for the first self-hosted release.

## 11. Analytics Engine

Deterministic modules:

```text
calculateBasicMetrics()
calculateRatingDistribution()
calculateReviewDistribution()
calculateDensity()
calculateCompetitorScores()
calculateOpportunitySignals()
calculateDistanceMatrix()
```

AI must never calculate canonical metrics that can be calculated deterministically.

## 12. Competition Scoring

Default configurable formula:

```text
score =
  ratingStrength * 0.30
+ reviewAuthority * 0.30
+ localDensity * 0.20
+ proximity * 0.20
```

If fields are unavailable, reweight available dimensions and disclose missing dimensions.

## 13. Geographic Engine

Responsibilities:
- Haversine distance
- Radius filtering
- Grid-based density
- Bounding box
- Cluster support
- Heatmap values

## 14. AI Engine

```text
Normalized Dataset
      ↓
Deterministic Metrics
      ↓
Compact Insight Context
      ↓
AI Provider
      ↓
Structured Insight
```

```ts
interface MarketInsight {
  executiveSummary: string;
  competitionInsights: InsightItem[];
  opportunitySignals: InsightItem[];
  risks: InsightItem[];
  recommendations: InsightItem[];
  limitations: string[];
}
```

## 15. AI Provider SDK

```ts
interface AIProvider {
  id: string;
  generateStructured<T>(request: AIRequest<T>): Promise<T>;
  healthCheck?(): Promise<ProviderHealth>;
}
```

MVP:
- Gemini adapter

Future:
- OpenAI
- Anthropic
- Ollama
- OpenAI-compatible local endpoints

## 16. Database Blueprint

User:
- id
- name
- email
- image
- createdAt
- updatedAt

ResearchProject:
- id
- userId
- name
- providerId
- query
- category
- locationQuery
- latitude
- longitude
- radiusMeters
- maxResults
- status
- createdAt
- updatedAt

ResearchJob:
- id
- researchProjectId
- status
- totalDiscovered
- totalProcessed
- totalFailed
- progress
- startedAt
- completedAt
- error

Place:
- id
- researchProjectId
- providerId
- externalId
- normalized fields
- collectedAt

Unique:
`researchProjectId + providerId + externalId`

PlaceSnapshot:
- id
- placeId
- payload
- capturedAt

MarketMetrics:
- researchProjectId
- totalBusinesses
- averageRating
- medianRating
- averageReviewCount
- medianReviewCount
- competitionScore
- densityScore
- metricJson
- calculatedAt

CompetitorScore:
- researchProjectId
- placeId
- overallScore
- componentScores
- explanation

AIInsight:
- researchProjectId
- provider
- model
- promptVersion
- insightJson
- generatedAt

Report:
- researchProjectId
- reportData
- generatedAt

## 17. API / Server Action Blueprint

Research:
```text
createResearch()
updateResearch()
deleteResearch()
getResearch()
listResearch()
```

Collection:
```text
startResearch()
retryResearch()
getResearchProgress()
```

Providers:
```text
listProviders()
testProvider()
```

Analytics:
```text
calculateResearchMetrics()
getResearchAnalytics()
```

AI:
```text
generateResearchInsights()
regenerateResearchInsights()
```

Exports:
```text
exportCSV()
exportJSON()
generatePDF()
```

## 18. UI Blueprint

Landing:
- Get Started
- View GitHub
- Self Host

Dashboard:
- Research Projects
- Businesses Analyzed
- Completed Jobs
- Providers Enabled

Research Create Wizard:
1. Provider
2. Market
3. Location
4. Limits
5. Review

Research Progress:
- Discover
- Collect
- Normalize
- Analyze
- Generate Insights

Research Result Tabs:
- Overview
- Businesses
- Map
- Competitors
- AI Insights
- Report

## 19. Map Architecture

Default:
- MapLibre GL or Leaflet

Provider-specific renderer constraints must be enforced by adapters/UI integration when required.

## 20. Export Architecture

CSV:
- normalized tabular data

JSON:
- metadata
- normalized places
- metrics

PDF:
- executive summary
- market statistics
- charts
- competitor ranking
- AI insights
- methodology
- limitations

## 21. Configuration

```env
DATABASE_URL=

AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

DEFAULT_PLACE_PROVIDER=openstreetmap
GOOGLE_MAPS_API_KEY=

DEFAULT_AI_PROVIDER=gemini
GEMINI_API_KEY=

ENABLE_AUTH=true
ENABLE_AI=true

MAX_RESEARCH_RESULTS=250
```

## 22. Docker Blueprint

MVP services:
```text
web
postgres
```

Future:
```text
worker
redis
```

Goal:
`docker compose up` should start a usable local environment without cloud dependencies when OpenStreetMap and AI-disabled mode are selected.

## 23. Testing Strategy

Unit:
- normalization
- deduplication
- scoring
- geo calculations
- provider mapping

Integration:
- research creation
- provider adapter
- DB persistence
- analytics pipeline

E2E:
```text
Create research
→ run collection
→ view results
→ view map
→ export CSV
```

AI tests should use mocks by default.

## 24. CI Pipeline

```text
install
↓
lint
↓
typecheck
↓
unit tests
↓
integration tests
↓
build
```

## 25. Git Workflow

Branches:
```text
main
feature/*
fix/*
docs/*
```

Conventional commits:
```text
feat(provider): add openstreetmap adapter
feat(analytics): add competition scoring
fix(research): prevent duplicate places
docs(provider): document adapter interface
```

## 26. Release Strategy

```text
v0.1.0 — foundation
v0.2.0 — first provider
v0.3.0 — research pipeline
v0.4.0 — analytics
v0.5.0 — visualization
v0.6.0 — AI insights
v0.7.0 — exports
v0.8.0 — self-hosting
v0.9.0 — release candidate
v1.0.0 — fully functional stable release
```

## 27. Documentation Architecture

```text
docs/
├── architecture.md
├── database.md
├── research-pipeline.md
├── scoring.md
├── self-hosting.md
├── provider-sdk.md
├── providers/
│   ├── openstreetmap.md
│   └── google-places.md
├── ai-providers.md
└── troubleshooting.md
```

## 28. Contributor Experience

```text
Fork
↓
Create adapter
↓
Run provider test kit
↓
Add provider docs
↓
Open PR
```

Provider test kit validates:
- interface compatibility
- normalized output
- error handling
- pagination behavior
- capabilities declaration

## 29. Security Blueprint

- Secrets server-side only.
- Zod validation.
- Ownership checks.
- Provider key masking.
- SSRF-safe URL handling.
- Rate limiting.
- No arbitrary code execution through provider configs.
- Dependency scanning.
- SECURITY.md disclosure process.

## 30. Definition of Fully Functional

```text
Clone
↓
Docker Compose
↓
Open app
↓
Create research
↓
Use OpenStreetMap provider
↓
Collect places
↓
Normalize/deduplicate
↓
Calculate metrics
↓
Display map/charts/table
↓
Rank competitors
↓
Optional AI insights
↓
Export CSV/JSON/PDF
```

Contributors can add new providers without modifying core analytics.
