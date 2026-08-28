# MarketLens v1.0.0

MarketLens v1.0.0 is the first stable release of the open-source local business
intelligence platform.

## Highlights

- Provider-neutral research pipeline with OpenStreetMap/Overpass as the free
  default and optional Google Places support.
- Persistent research projects, collection progress, normalization, and
  deduplication.
- Deterministic market metrics, geographic density, explainable competitor
  scoring, and cautious opportunity signals.
- Responsive results with tables, charts, an interactive map, and exports to
  CSV, JSON, and PDF.
- Optional Gemini insights with facts-first prompts, structured output, timeout,
  retry, and AI-disabled operation.
- Production-ready Docker runtime, Compose production override, migrations,
  health endpoint, rate limiting, structured logs, error recovery, and backup
  guidance.

## First run

Follow the [quick start in the README](../README.md#quick-start), then create a
research project with the prefilled `coffee shop` / `Malang, Indonesia` example.
OpenStreetMap requires no key.

## Upgrade notes

Run `npm install`, apply schema changes with `npm run db:deploy`, then restart
the application. Production operators should take and test a PostgreSQL backup
before upgrading; exact Compose commands are in the
[self-hosting guide](self-hosting.md#backups-and-recovery).

## What v1.0 does not claim

MarketLens does not scrape Google Maps, bypass provider protections, estimate
revenue, or guarantee commercial outcomes. Collection coverage and conclusions
depend on the provider, query, radius, timestamp, and available fields. See
[known limitations](known-limitations.md) before relying on a research result.

## Verification

The release candidate has passing formatting, lint, type, unit, production
build, end-to-end browser, Docker Compose, migration, and database-test checks.
