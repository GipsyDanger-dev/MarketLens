# Provider development guide

MarketLens treats place-data sources as adapters. Core research and analytics
code must depend on provider-neutral contracts, never directly on OpenStreetMap,
Google Places, or another vendor SDK. This guide is the contributor contract for
adding a provider.

## Before you implement

1. Confirm the provider permits this use through its API and terms. Do not use
   browser automation, CAPTCHA bypasses, private-data collection, or login
   session scraping.
2. Define the adapter's capabilities honestly. A provider without ratings or
   reviews must report those fields as unavailable rather than fabricating them.
3. Decide the source attribution shown in the UI and preserved in exports.
4. Add mapping, pagination/limit, and error fixtures before registering the
   adapter in the default registry.

## Implementation path

1. Add an adapter under `apps/web/src/providers` that implements
   `PlaceProvider`.
2. Map the upstream response into `PlaceCandidate`; preserve stable external IDs
   and raw provider data only at the adapter boundary.
3. Translate quota, timeout, and upstream failures into `ProviderError` with an
   accurate retryability flag.
4. Register the provider behind an explicit server-side configuration check.
5. Add unit tests for successful mapping and every meaningful error path.
6. Document configuration, attribution, field coverage, retention, and terms in
   a provider-specific document.

## Target contract

```ts
interface PlaceProvider {
  readonly id: string;
  readonly name: string;
  readonly capabilities: ProviderCapabilities;
  search(request: PlaceSearchRequest): Promise<PlaceSearchResponse>;
  getDetails?(externalId: string): Promise<PlaceCandidate>;
  healthCheck?(): Promise<ProviderHealth>;
}
```

Each adapter maps provider responses into raw candidate records. Normalization
then produces the canonical place model used by persistence and analytics.

`PlaceCandidate` contains stable provider and external IDs, common place fields,
coordinates, source attribution, collection time, and `rawData`. The last field
preserves the provider payload; it must not be used as canonical analytics data.

## Adapter requirements

- Declare capabilities truthfully, including unavailable rating/review fields.
- Map pagination, timeouts, quotas, and provider errors into typed failures.
- Keep external IDs stable and preserve provider/source attribution.
- Document terms of service, attribution, retention, and rate-limit behavior.
- Do not implement browser automation, CAPTCHA bypass, private-data collection,
  or session/login scraping.
- Supply fixtures for mapping, error handling, and pagination tests.

## Pull request checklist

- [ ] No provider credential is present in client code, fixtures, screenshots,
      logs, or documentation examples.
- [ ] A stable provider + external ID forms the primary deduplication key.
- [ ] Coordinates, names, categories, and addresses map to the shared candidate
      shape or are explicitly unavailable.
- [ ] 429, 5xx, timeout, malformed-payload, and unsupported-pagination behavior
      are tested or documented as inapplicable.
- [ ] Attribution and source URLs are preserved.
- [ ] The adapter does not leak upstream raw payloads into analytics fields.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build`
      pass.

## Built-in OpenStreetMap / Overpass adapter

`OpenStreetMapProvider` is the free default. It sends a server-side `POST` to
the configured Overpass `interpreter` endpoint, uses JSON output with `out
center`, and maps nodes, ways, and relations into `PlaceCandidate` values. Ways
and relations use their returned center point. Candidates without valid
coordinates are discarded.

Searches are bounded by `MAX_RESEARCH_RESULTS` (250 by default). Overpass has
no cursor pagination in this adapter: sending a `pageToken` is rejected rather
than silently returning an inconsistent page. A 429 or 5xx response is exposed
as a retryable `ProviderError`; invalid requests and invalid provider payloads
are not retryable. `healthCheck()` returns a health result instead of throwing.

When a user chooses a category, the adapter queries its exact OpenStreetMap tag
within the requested radius (for example, `amenity=cafe`). The free-text query
is retained as the research label but is not combined with a broad name-regex
filter on the Overpass server. This keeps common local-category searches within
the response budget; name-only searches continue to use an escaped name lookup.

Transient failures use bounded retries with exponential backoff. You may add
approved, global-data interpreter endpoints through a comma-separated fallback
list. MarketLens tries every retry on the primary endpoint before moving to the
next fallback; non-retryable response and payload errors stop immediately.
Attempts share the configured timeout budget, so adding fallbacks does not turn a
single stalled request into an unbounded wait.

Configure the endpoint and timeout only on the server:

```env
OVERPASS_API_URL="https://overpass-api.de/api/interpreter"
OVERPASS_TIMEOUT_SECONDS=25
OVERPASS_FALLBACK_URLS=""
OVERPASS_MAX_RETRIES=1
OVERPASS_RETRY_DELAY_MILLISECONDS=750
```

Point `OVERPASS_API_URL` at a self-hosted or otherwise approved Overpass
instance for heavier workloads. The public endpoint receives an identifying
MarketLens user agent, but it is still a shared community service: respect the
instance policy and back off when it returns 429. Public instance availability
changes, so choose fallback URLs from the current OpenStreetMap Overpass API
instance list and verify each instance's coverage and usage policy before use.

Server code obtains the default adapter through the registry:

```ts
import { createProviderRegistry } from "@/providers";

const registry = createProviderRegistry();
const provider = registry.get("openstreetmap");
const response = await provider.search({
  query: "coffee",
  latitude: -6.2088,
  longitude: 106.8456,
  radiusMeters: 5_000,
  maxResults: 100,
});
```

OpenStreetMap data is available under ODbL and requires appropriate attribution
when it is publicly used. Keep the source URL attached to candidates and render
an attribution such as `© OpenStreetMap contributors` linked to
https://www.openstreetmap.org/copyright in a relevant UI, report, or export.

Provider-supplied address, phone, website, source URL, and social links are
shown only when present in the collected record. MarketLens does not crawl a
business website or social profile to manufacture missing contact data; CSV,
JSON, and PDF exports preserve the collected contact fields for follow-up.

## Capability-aware analytics

Some free providers do not expose ratings or review counts. Analytics must treat
these fields as nullable, reweight only available competition-score dimensions,
and disclose the missing dimensions instead of fabricating values.

The provider registry, test kit, and OpenStreetMap adapter are delivered in
Sprint 2. A future provider must pass the test kit before registration.
