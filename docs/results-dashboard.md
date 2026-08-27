# Results Dashboard

Sprint 6 presents persisted research results at `/research/:researchId`.
Collection progress stays visible above the dashboard, while completed research
loads a single no-store request from:

```text
GET /api/research/:researchId/results
```

The response contains project metadata, `MarketMetrics`, places, and each
place's persisted competitor score. The endpoint uses the Node runtime and
returns `404` for an unknown project.

The dashboard provides responsive metric cards, native bar visualizations for
rating and review distributions, a searchable business table, and sorting by
competition score, rating, or name. It reports loading, fetch errors, research
that is not yet `READY`, and a filter with no matching places explicitly.

Charts intentionally use semantic HTML and CSS rather than a chart dependency
at this stage. Values remain accessible as text and the table remains usable on
narrow screens through horizontal scrolling.
