# Changelog

## v0.9.0-beta.1 — Optional Google Places

- Add the optional Google Places (New) Text Search adapter with explicit field
  selection, token pagination, capability mapping, and typed rate handling.
- Register Google Places only when a server-side API key is configured.
- Add provider selection to the research creation workspace and document
  provider attribution, retention, and compliance requirements.

## v0.9.0-alpha.2 — Optional AI Intelligence

- Add a strict, provider-neutral AI insight contract and prompt versioning.
- Add a resilient server-only Gemini adapter with structured JSON, timeout, and
  retry behavior.
- Persist optional market interpretations and expose the insights endpoint and
  results-dashboard controls without blocking core research data.

## v0.9.0-alpha.1 — Competitor Intelligence

- Add competitor rankings, score breakdowns, nearby context, and comparisons.

## v0.8.0 — Map & Geospatial Intelligence

- Add a provider-neutral MapLibre map with GeoJSON clusters and research radius.
- Synchronize selected places and geographic filtering between the map and table.

## v0.7.0 — Results Dashboard

- Add an API payload for persisted research results and analytics.
- Add responsive market metric cards, native distributions, and a searchable,
  sortable business table with competition scores.
- Add explicit loading, error, non-ready, and empty-filter states.

## v0.6.0 — Deterministic Market Analytics

- Calculate and persist market totals, descriptive rating/review metrics, and
  distributions.
- Add Haversine distance and observed business-density calculations.
- Persist explainable, availability-aware competitor scores.
- Add cautious potential and data-coverage opportunity signals without AI.
