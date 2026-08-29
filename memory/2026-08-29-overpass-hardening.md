# Overpass resilience hardening

## Incident

A research collection for coffee shops in Malang failed after approximately 25 seconds with `Overpass request timed out.` No records were discovered because the provider request failed before normalization and persistence began.

## Confirmed cause

The OpenStreetMap adapter made one request to the configured public Overpass endpoint and aborted at the configured timeout. A lightweight direct request also received no response within ten seconds, confirming an upstream endpoint or network availability issue rather than a database, AI, or frontend failure.

## Changes

- Added bounded retries for retryable timeout, rate-limit, server, and network errors.
- Added ordered, configurable fallback Overpass endpoints.
- Split the existing timeout budget across configured attempts, preventing retries from extending an already stalled collection indefinitely.
- Added exponential retry delay configuration.
- Used exact indexed category predicates for common OpenStreetMap categories such as `amenity=cafe`.
- Added unit coverage for retry success, endpoint failover, and the optimized cafe query.

## Configuration

The default remains the configured primary `OVERPASS_API_URL`. Optional backup endpoints can be supplied through `OVERPASS_FALLBACK_URLS` as a comma-separated list. Operators must select endpoints whose published usage policy fits their workload.

## Verification

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`

All checks passed. The local MarketLens runtime was restarted afterward; `/`, `/research/new`, and `/api/health` returned HTTP 200.

## Remaining operational consideration

The existing failed job remains terminal and must be retried after the primary endpoint recovers or an approved fallback endpoint is configured. Public Overpass services can still be temporarily unavailable, so this hardening improves recovery but cannot guarantee external service availability.
