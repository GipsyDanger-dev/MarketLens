# Database

MarketLens uses PostgreSQL with Prisma ORM. The Sprint 1 schema stores the
provider-neutral research domain: users, research projects and jobs, normalized
places and raw snapshots, deterministic metrics and scores, optional AI insights,
and generated reports. `AppMetadata` remains available for application metadata.

Each `ResearchProject` uses one `providerId` for the MVP. A project can be
unowned when authentication is disabled for self-hosting. Deleting a project
cascades to its jobs, places, snapshots, metrics, scores, insights, and reports.
Provider payloads are retained only in `PlaceSnapshot.payload`; analytics must
use the normalized `Place` fields instead.

## Collection jobs

Sprint 3 creates a `ResearchJob` for every collection attempt. The job and its
project advance through `QUEUED`, `COLLECTING`, `NORMALIZING`, `ANALYZING`, and
`READY`, or both become `FAILED`. `totalDiscovered`, `totalProcessed`,
`totalFailed`, and `progress` are persisted for the progress UI. Retrying after
a failure creates a new job while place upserts preserve one row per provider
external ID and append a fresh `PlaceSnapshot`.

## Commands

```bash
# validates the Prisma schema; DATABASE_URL is required
npm run db:validate

# generates Prisma client output in generated/prisma
npm run db:generate

# applies migrations during local development
npm run db:migrate

# applies committed migrations without creating new ones
npm run db:deploy
```

For the local Compose stack, use the `DATABASE_URL` from `.env.example` and
start PostgreSQL first:

```bash
docker compose up -d postgres
npm run db:migrate
```

Migrations are committed under `prisma/migrations`. Do not edit a migration
that has already been applied outside local development; create a new migration
instead.
