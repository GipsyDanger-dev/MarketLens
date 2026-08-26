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

## Production note

Sprint 0 provides a development Compose stack. Production image hardening,
backups, rate limits, observability, and deployment runbooks are scheduled for
Sprint 12.
