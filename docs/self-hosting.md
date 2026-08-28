# Self-hosting

MarketLens is designed to run without paid providers or AI services. The local
development stack uses the OpenStreetMap default configuration, a Next.js web
application, and PostgreSQL.

## Requirements

- Docker Desktop with Docker Compose
- Node.js 24+
- npm 11+

## Start locally

```bash
copy .env.example .env
npm install
docker compose up -d postgres
npm run db:migrate
npm run dev
```

Visit `http://localhost:3000`; process health is available at
`http://localhost:3000/api/health`.

## Full Compose workflow

```bash
docker compose up --build
```

The `postgres-data` Docker volume retains PostgreSQL data between container
restarts. To reset local data during development, intentionally remove that
named volume; never run destructive volume commands against an unknown target.

## Configuration

Copy `.env.example` to `.env`. `DATABASE_URL` is required by Prisma commands.
Keep `ENABLE_AI=false` unless an AI provider is deliberately configured.
Credentials for Google Places or any future provider belong only in server-side
environment variables and must never be embedded in browser code.

## Production Compose

Create a production `.env` outside version control with a strong
`POSTGRES_PASSWORD`, the production `DATABASE_URL`, and only the optional
provider/AI keys you intend to use. Never prefix secrets with `NEXT_PUBLIC_`.

Build and start the hardened production stack:

```bash
docker compose -f docker-compose.yml -f docker-compose.production.yml up -d --build
docker compose exec web npm run db:deploy
```

The production override runs a non-root, standalone Next.js image with
`NODE_ENV=production`, a read-only application filesystem, a temporary `/tmp`,
and a web health check. PostgreSQL is not published to the host in that profile.
Terminate TLS at a reverse proxy and expose only the web service.

## Backups and recovery

Back up PostgreSQL before upgrades and test restore procedures regularly. Run
these commands from a trusted host where the production Compose project is
running; keep backup files encrypted and access-controlled:

```bash
docker compose exec -T postgres pg_dump -U marketlens -d marketlens > marketlens-backup.sql
docker compose exec -T postgres psql -U marketlens -d marketlens < marketlens-backup.sql
```

The second command overwrites data according to the SQL backup, so restore only
to an explicitly selected recovery database or after a deliberate maintenance
decision. Retain backups according to your privacy and provider-data policies.

## Operations and safety

- The create-research endpoint applies a per-client fixed-window rate limit and
  returns `429` with `Retry-After` when exceeded. Use a shared reverse-proxy or
  platform limiter for multi-instance deployments.
- Production events are emitted as JSON without API keys or request bodies.
- Global and research error boundaries show a retry action without exposing
  server error messages or secrets.
- Watch `/api/health`, database disk usage, provider error rates, and backup
  completion. Keep application and database images patched.
