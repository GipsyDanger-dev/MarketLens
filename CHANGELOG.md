# Changelog

## v1.1.1 — MIT License Alternative

- Add the official MIT License as `LICENSE-MIT` with the 2026 copyright notice
  for Adam Fairuz Akmal Aryaguna, while retaining the existing Apache-2.0
  `LICENSE` unchanged.
- Declare `Apache-2.0 OR MIT` in root and CLI package metadata and document the
  choice with MIT and Apache badges in the README.

## v1.1.0 — Local-First Runtime

- Add a publish-ready `marketlens` CLI with non-interactive init, up, down,
  status, open, doctor, logs, and configuration commands.
- Generate local-only configuration and a random PostgreSQL password; retain
  user-supplied provider keys and external database URLs through config updates.
- Bind default Docker ports to localhost, support configurable web ports, and
  add a tested Compose override for external PostgreSQL.
- Add local-first onboarding, source workflow, diagnostics, and npm package
  documentation.

## v1.0.0 — Public Open-Source Release

- Publish a functional public landing page with responsive, production-runtime
  screenshots and end-to-end coverage for its first-research CTA.
- Add a fictional demo dataset, an up-to-date architecture diagram, release
  notes, roadmap, expanded quick start, provider contribution guide, and known
  limitations.
- Stabilize the full research pipeline: compliant providers, persistence,
  deterministic analytics, map and competitor intelligence, optional AI, exports,
  self-hosting, and production hardening.

## v0.9.0-rc.1 — Production Hardening

- Add a non-root standalone production image and Compose production override.
- Add request rate limiting, structured operational events, and recovery error
  boundaries.
- Add production self-hosting, backup, secret-handling, and security guidance.

## v0.9.0-beta.2 — Exports and Professional Reports

- Add reproducible report snapshots containing metadata, methodology, metrics,
  competitors, optional AI interpretation, and limitations.
- Add CSV, JSON, and professional PDF report downloads from ready research.
- Add dashboard export controls and report-format documentation.

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
