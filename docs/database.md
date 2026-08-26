# Database

MarketLens uses PostgreSQL with Prisma ORM. Sprint 0 establishes the connection
configuration and an `AppMetadata` table used only to verify the migration path;
the research, provider, and analytics domain models begin in Sprint 1.

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
