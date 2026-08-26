# Provider SDK

MarketLens treats place-data sources as adapters. Core research and analytics
code must depend on provider-neutral contracts, never directly on OpenStreetMap,
Google Places, or another vendor SDK.

## Target contract

```ts
interface PlaceProvider {
  id: string;
  name: string;
  capabilities: ProviderCapabilities;
  search(request: PlaceSearchRequest): Promise<PlaceSearchResponse>;
  getDetails?(externalId: string): Promise<RawPlaceDetails>;
  healthCheck?(): Promise<ProviderHealth>;
}
```

Each adapter maps provider responses into raw candidate records. Normalization
then produces the canonical place model used by persistence and analytics.

## Adapter requirements

- Declare capabilities truthfully, including unavailable rating/review fields.
- Map pagination, timeouts, quotas, and provider errors into typed failures.
- Keep external IDs stable and preserve provider/source attribution.
- Document terms of service, attribution, retention, and rate-limit behavior.
- Do not implement browser automation, CAPTCHA bypass, private-data collection,
  or session/login scraping.
- Supply fixtures for mapping, error handling, and pagination tests.

## Capability-aware analytics

Some free providers do not expose ratings or review counts. Analytics must treat
these fields as nullable, reweight only available competition-score dimensions,
and disclose the missing dimensions instead of fabricating values.

The provider registry, test kit, and OpenStreetMap adapter are delivered in
Sprint 2.
