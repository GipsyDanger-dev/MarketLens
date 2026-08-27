# Deterministic Market Analytics

Sprint 5 calculates analytics locally from persisted normalized places whenever
a research collection reaches `ANALYZING`. AI is not involved in these values.

## Market metrics

`MarketMetrics` stores total businesses plus average and median ratings and
review counts. Missing ratings and review counts are omitted from their own
statistics rather than treated as zero. `metricJson` retains five rating buckets
(`0-1` through `4-5`), five review buckets (`0`, `1-9`, `10-99`, `100-999`, and
`1000+`), and opportunity signals.

Density is observed businesses per square kilometre in the requested circular
radius. It is `null` if the radius is invalid.

## Competitor score

Each `CompetitorScore` uses available dimensions from the default formula:

```text
rating strength  × 0.30
review authority × 0.30
local density    × 0.20
proximity        × 0.20
```

Rating strength is rating divided by five. Review authority is logarithmically
normalized against the largest observed review count. Local density is the
share of other places within 500 m, and proximity expresses distance from the
research center within its requested radius. Missing dimensions are reweighted
out of the score and stated in the saved explanation.

## Opportunity signals

Signals are deliberately cautious. Low density and a low average composite
competitor score can be marked `potential`; limited rating coverage is marked
`info`. They describe the observed dataset only and never promise commercial
success. Future UI and AI flows must preserve that limitation.
