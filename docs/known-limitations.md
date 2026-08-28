# Known limitations

MarketLens is a decision-support toolkit, not a guarantee of business success.
Use these limitations when interpreting a project, report, or AI insight.

## Data coverage

- Results reflect the selected provider, query, radius, collection time, and
  provider field coverage. They are not a census of every local business.
- OpenStreetMap/Overpass may not provide ratings or review counts. Metrics that
  depend on unavailable fields are disclosed rather than inferred.
- Google Places is optional and requires a separately configured, compliant API
  key. MarketLens does not scrape Google Maps or bypass provider controls.
- The included demo CSV contains fictional businesses and is only for product
  walkthroughs or development.

## Analysis

- Competition and opportunity scores are explainable heuristics. They are not
  revenue forecasts, demand estimates, or causal claims.
- Geographic density uses the collected coordinates and configured research
  radius; it does not account for foot traffic, zoning, rent, demographics, or
  unavailable competitors.
- Deduplication protects obvious repeated records but cannot prove that two
  differently named or incomplete records are distinct businesses.

## AI

- AI is optional and never blocks collection, analytics, maps, or exports.
- AI output is constrained to supplied facts and computed metrics, but users
  must still review it as interpretation, not authoritative market advice.
- If insight generation fails, retry it after confirming the provider key and
  network configuration; the completed research remains available.

## Operations

- The built-in mutation limiter is process-local. Multi-instance deployments
  need a shared reverse-proxy or platform rate limiter.
- Production operators are responsible for TLS termination, database backups,
  access control, provider compliance, and retention policies.
- The MVP runs collection in the application process. Very high-volume,
  scheduled, or multi-tenant workloads need a worker/queue architecture.
