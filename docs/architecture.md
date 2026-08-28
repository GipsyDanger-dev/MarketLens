# Architecture

MarketLens is a single Next.js application with strict provider and AI adapter
boundaries. It is intentionally useful with just PostgreSQL and OpenStreetMap.

```text
Browser
  │ create / run / inspect / export
  ▼
Next.js pages and route handlers
  │
  ├── Provider registry ──► OpenStreetMap / optional Google Places
  │                              │ raw candidates
  ├── Research pipeline ◄────────┘
  │       │ normalize → deduplicate → persist
  │       ▼
  ├── Deterministic analytics → competitor scores → opportunity signals
  │       │
  │       ├── Results UI: table, charts, MapLibre map
  │       ├── CSV / JSON / PDF exports
  │       └── Optional AI provider → guarded interpretation
  │
  ▼
Prisma adapter → PostgreSQL
```

## Code map

| Area            | Location                                       | Responsibility                                                                                                   |
| --------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Presentation    | `apps/web/src/app`, `components`               | App Router pages, responsive states, charts, map, and research controls.                                         |
| HTTP boundary   | `apps/web/src/app/api`                         | Validates requests, returns safe errors, applies the mutation guard, and exposes progress/results/export APIs.   |
| Research domain | `apps/web/src/lib/research*`, `lib/analytics*` | Orchestration, status transitions, normalization, deduplication, metric calculation, and scoring.                |
| Integrations    | `apps/web/src/providers`, `ai`                 | Provider contracts, registries, capability declarations, mapping, rate/error handling, and optional AI adapters. |
| Persistence     | `prisma`, `generated/prisma`, `lib/prisma.ts`  | Schema, migrations, generated client, and PostgreSQL adapter.                                                    |
| Operations      | `docker`, Compose files, CI workflow           | Standalone production runtime, one-off migration tools, health checks, and verification.                         |

## Request lifecycle

1. A user creates a research project with an approved provider configuration.
2. The run endpoint collects raw candidates through the selected adapter.
3. The pipeline normalizes fields, removes duplicate records, and persists the
   canonical places before moving to analytics.
4. Deterministic metrics and explainable competitor scores are persisted.
5. The results page and exports read the persisted dataset. Optional AI insight
   generation reads only the computed facts and cannot block this path.

## Design rules

- Core analytics must not import a provider, ORM, map, or AI SDK.
- Provider-specific payloads remain in snapshots/adapter boundaries; normalized
  fields are the only input to analytics.
- AI may interpret supplied metrics but must not invent businesses, ratings, or
  causal claims.
- Secrets are read only by server code. Client code never receives provider or
  AI keys.
- A failed AI request does not invalidate an otherwise complete research run.
- Low-confidence cross-provider matches cannot silently merge canonical records.

## Deployment shape

The default Compose stack starts PostgreSQL and the standalone web runtime. The
`migrate` profile uses the builder image only for Prisma operations and exits.
In the production override, PostgreSQL is not published to the host, the web
process is non-root and read-only, and `/api/health` is used for container
health. See [self-hosting](self-hosting.md) for the exact commands and backup
procedure.
