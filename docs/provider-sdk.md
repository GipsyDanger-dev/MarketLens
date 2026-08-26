# Provider SDK

MarketLens treats place-data sources as adapters. Core research and analytics
code must depend on provider-neutral contracts, never directly on OpenStreetMap,
Google Places, or another vendor SDK.

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

Configure the endpoint and timeout only on the server:

```env
OVERPASS_API_URL="https://overpass-api.de/api/interpreter"
OVERPASS_TIMEOUT_SECONDS=25
```

Point `OVERPASS_API_URL` at a self-hosted or otherwise approved Overpass
instance for heavier workloads. The public endpoint receives an identifying
MarketLens user agent, but it is still a shared community service: respect the
instance policy and back off when it returns 429.

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

## Capability-aware analytics

Some free providers do not expose ratings or review counts. Analytics must treat
these fields as nullable, reweight only available competition-score dimensions,
and disclose the missing dimensions instead of fabricating values.

The provider registry, test kit, and OpenStreetMap adapter are delivered in
Sprint 2. A future provider must pass the test kit before registration.
