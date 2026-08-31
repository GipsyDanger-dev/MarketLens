# Overpass category query fix

## Symptom

The Malang coffee-shop research project repeatedly failed with `Overpass request timed out.` The failure happened before any places were discovered or persisted.

## Investigation

- The embedded MarketLens web runtime was initially stopped; it was restarted before reproducing the collection through the same `/api/research/:id/run` route used by the UI.
- The configured fallback list was empty. The previously suggested `overpass.kumi.systems` endpoint returned HTTP 502 and must not be used as a current fallback.
- A lightweight request to the primary endpoint succeeded, but the actual query generated for the project timed out after about 25 seconds.
- The generated query combined `nwr`, an unindexed name regex for `coffee shop`, and the exact `amenity=cafe` tag.
- The equivalent category-only query completed against the primary endpoint in about 1.3 seconds and returned 60 elements.

## Root cause

For a selected category, the adapter unnecessarily applied a broad server-side name regex in addition to the indexed category filter. On the overloaded public primary instance, this pushed an otherwise bounded local category search beyond the request timeout.

## Fix

- Category-selected searches now use the exact mapped OpenStreetMap category tag within the requested radius.
- Name-only searches retain the escaped name regex behavior.
- Regression coverage verifies both query modes.

## Verification

- Targeted query tests passed after the change.
- Web lint and typecheck passed.
- `npm run test` passed: CLI 8/8 tests and web 64/64 active tests (3 skipped).
- After rebuilding the embedded runtime, rerunning project `cmte9m4sm00004wpvp9zzmr4n` completed in about 3.8 seconds with `READY`, 60 discovered, 60 processed, and zero failures.

## Operational note

The FOSSGIS public endpoint remains a shared service and can be overloaded. The adapter still supports approved fallback endpoints and bounded retries, but the current primary configuration works for the reproduced category search.
