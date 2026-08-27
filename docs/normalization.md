# Place Normalization and Deduplication

Sprint 4 makes provider candidates comparable before MarketLens persists them.
The original provider payload remains in `PlaceSnapshot`; the `Place` fields
are deterministic canonical values used by later analytics and review flows.

## Canonical fields

- **Business name:** Unicode is decomposed, diacritics and punctuation are
  removed, whitespace is collapsed, and the result is lower-cased. An empty
  canonical name is rejected as a failed collection item.
- **Category:** known provider variants such as `coffee shop` resolve to
  `cafe`; otherwise the canonical category is lower-case words joined by
  underscores. The first provider type is used when no category is supplied.
- **Address:** text becomes a lower-case comparison key with collapsed
  whitespace. Indonesian abbreviations `Jl.` and `No.` resolve to `jalan` and
  `nomor`.
- **Coordinates:** latitude and longitude must be finite geographic values and
  are rounded to six decimal places. Invalid values are rejected instead of
  being persisted.

## Duplicate policy

The primary identity is `(researchProjectId, providerId, externalId)` and is
enforced by the database upsert. Re-running a provider collection therefore
updates the existing `Place` row and adds an audit snapshot rather than adding
a duplicate row.

Cross-provider matching is deliberately non-destructive groundwork. It returns
probable candidates only when confidence is at least `0.75`; it never merges,
deletes, or hides records. The score combines normalized-name token similarity
(up to 0.55), geographic proximity (up to 0.25), matching category (0.15), and
matching normalized address (0.10). A result includes its score, distance, and
the reasons contributing to it so a future review workflow can remain
explainable.

## Data-quality metrics

`getResearchDataQuality(projectId)` calculates metrics from persisted places:
record count; populated normalized names, categories, addresses, coordinates,
phones, and websites; records complete across the four core fields; duplicate
primary identities; field completeness; and record completeness. Percentages
are whole numbers, so they can be rendered consistently by a later dashboard
without a database migration.
