# Research exports and reports

Ready research can be downloaded from its results dashboard as CSV, JSON, or
PDF. Each download first creates a timestamped `Report` snapshot from persisted
research data, so all three formats use the same factual source.

```text
GET /api/research/:researchId/export/csv
GET /api/research/:researchId/export/json
GET /api/research/:researchId/export/pdf
```

The endpoint sets an attachment filename and returns `404` for unsupported
formats. A project must have calculated market metrics before it can be
exported.

## Contents

Every report snapshot includes:

- metadata: research ID, name, query/category, location, generation and latest
  collection timestamps;
- methodology: provider collection followed by normalization, deduplication,
  and deterministic MarketLens analytics;
- market metrics and deterministic opportunity signals;
- observed businesses and ranked competitors;
- the latest optional AI insight, if one was generated;
- explicit limitations.

PDF adds an executive summary (AI summary when available, otherwise the
observed business count), metric cards, top competitors, signals, AI
interpretation, methodology, and limitations.

CSV contains one normalized business per row, including category, address,
rating, review count, coordinates, and competition score. JSON preserves the
complete report structure for programmatic analysis.

## Interpretation limits

Reports represent the data returned by the selected provider at the recorded
timestamp, not the entire market. Provider coverage can be incomplete and AI
text is interpretation rather than a guarantee. Validate opportunity signals
with primary research before making a business decision. Preserve provider
attribution and usage terms when redistributing exports.
