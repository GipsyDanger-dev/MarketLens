# Optional AI insights

Sprint 9 adds an optional interpretation layer after a research project has
reached `READY`. It is not part of collection, normalization, deduplication, or
analytics, so a failed or disabled AI provider never invalidates the dataset.

## Configure Gemini

AI is off by default. Keep this setting for self-hosted installations that do
not need an external model:

```env
ENABLE_AI=false
```

To enable Gemini, configure its key only on the server and restart the app:

```env
ENABLE_AI=true
DEFAULT_AI_PROVIDER=gemini
GEMINI_API_KEY="your-server-side-key"
AI_TIMEOUT_MILLISECONDS=20000
AI_MAX_RETRIES=1
```

`GEMINI_API_KEY` is never prefixed with `NEXT_PUBLIC_`, is read only by the
server-side adapter, and is sent to Gemini in an HTTP request header. The
adapter uses `gemini-2.5-flash` by default, asks Gemini for JSON structured
output, applies an abort timeout, and retries only transient HTTP failures
(429 and 5xx) or timeouts. See Google's [structured-output documentation](https://ai.google.dev/gemini-api/docs/structured-output?lang=rest)
for the supported JSON-schema subset.

## Insight contract and guardrails

Each persisted snapshot records the provider, model, prompt version, generation
timestamp, and a strict JSON object with:

- market summary
- competition insights
- opportunity signals
- risks
- recommendations
- limitations

The prompt contains only persisted research metadata, computed market metrics,
the five highest competitor scores, deterministic opportunity signals, and the
latest collection timestamp. It instructs the model not to invent businesses,
ratings, reviews, demand, revenue, or causal claims. Opportunity language is
explicitly tentative and every response must include limitations.

Generated text is interpretation, not a guarantee of commercial success.
Validate it against the displayed source data and primary research before
acting.

## API and UI

For a ready project, the results dashboard loads the latest stored snapshot and
offers **Generate AI insight**:

```text
GET  /api/research/:researchId/insights
POST /api/research/:researchId/insights
```

`POST` returns `201` with a newly persisted structured insight. When AI is
disabled it returns `200` and `{ "status": "disabled" }`; no research data is
read or written in that path. Missing configuration returns `400`; provider
network or timeout failures return `502`. The user can retry without rerunning
collection or analytics.
