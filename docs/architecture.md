# Architecture

MarketLens follows a provider-neutral pipeline:

```text
Providers → Collection → Normalization → Deduplication → Analytics
          → Competitor intelligence → Optional AI → Export
```

## Layers

- **Presentation:** Next.js pages, components, maps, charts, and user states.
- **Application:** server actions/routes, authorization, research orchestration,
  job progress, and commands/queries.
- **Domain:** normalized types, normalization, deduplication, deterministic
  analytics, scoring, and geospatial calculations.
- **Infrastructure:** Prisma/PostgreSQL, provider adapters, AI adapters, export,
  logging, and external HTTP clients.

Dependencies point inward: UI and infrastructure may depend on contracts in the
application/domain layers, but deterministic domain logic must not depend on a
specific provider, ORM, map, or AI SDK.

## Workspace boundaries

- `apps/web` is the running Next.js application.
- `packages/core` will contain provider-neutral domain logic.
- `packages/provider-sdk` will expose provider contracts and test utilities.
- `packages/providers/*` will host individual integrations.
- `packages/ai-sdk` will contain optional AI contracts.

Packages are introduced when their public boundary is implemented, rather than
as empty scaffolding.

## Non-negotiable rules

- Analytics produces canonical metrics deterministically.
- AI receives facts and calculated metrics, then returns interpretation only.
- Provider-specific payloads remain in adapter/snapshot boundaries.
- Cross-provider matches use confidence and cannot silently merge low-confidence
  records.
- Secrets are only read on the server.
