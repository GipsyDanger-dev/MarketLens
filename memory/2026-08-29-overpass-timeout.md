# Overpass collection timeout

- **Symptom:** Research `cmte9m4sm00004wpvp9zzmr4n` ended as `FAILED` with `Overpass request timed out.` No places were discovered or processed.
- **Root cause:** The local provider configuration uses `OVERPASS_TIMEOUT_SECONDS=25`. The job started at `10:56:16.125Z` and completed at `10:56:41.271Z`, matching the 25-second abort window. The provider cancelled the external Overpass request before a response arrived.
- **Scope:** This is an external provider availability or query-latency failure. Embedded storage, AI configuration, and the UI are not involved.
- **Next options:** Retry later, reduce radius/max-results, increase the timeout, configure an alternate Overpass endpoint, or use Google Places when available.
