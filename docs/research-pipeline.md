# Research Collection Pipeline

Sprint 3 turns a provider response into a persisted research dataset without a
queue service or Redis. A collection runs on the server that received the
request; each state and progress counter is written to PostgreSQL so the UI can
be refreshed or polled safely.

## Lifecycle

```text
DRAFT / READY / FAILED
          ↓
        QUEUED
          ↓
      COLLECTING
          ↓
      NORMALIZING
          ↓
       ANALYZING
          ↓
         READY
```

Any provider or orchestration failure sets both the project and its job to
`FAILED`. The job stores an error message, counts, completion time, and a
terminal progress value. Candidates that cannot be persisted—for example an
unnamed place—increment `totalFailed` while the remaining candidates continue.

## API

All endpoints are Node runtime route handlers.

```text
POST /api/research/:researchId/run
GET  /api/research/:researchId/progress
```

`POST` executes the current MVP collection synchronously and returns the final
persisted progress payload. It returns `404` for an unknown project and `409`
when an active job has already claimed it. `GET` returns the latest job and
project status. The progress page lives at `/research/:researchId` and polls the
second endpoint while collection is active.

## Retry and idempotency

Retry is explicit: call `POST .../run` again after a `FAILED` job. A project in
`DRAFT`, `READY`, or `FAILED` can claim a new job; active states cannot. Each
place is upserted by `(researchProjectId, providerId, externalId)`, so a repeat
run does not create duplicate place rows. Every successful provider payload is
recorded as a new `PlaceSnapshot` for auditability.

This sprint uses a lightweight persistence key only for writing the required
`normalizedName` field. Full name/address/category normalization and
cross-provider deduplication are deliberately delivered in Sprint 4.

## Operational notes

- No automatic retry loop is used for the default public Overpass endpoint.
  This avoids amplifying rate limits; the persisted failure and UI retry make
  retries deliberate.
- A deployment with a long-running or high-volume provider should use an
  approved/self-hosted provider endpoint and move collection to a worker in a
  later deployment profile.
- Authentication/authorization is not yet implemented. Do not expose the
  mutable research routes publicly until the auth sprint adds ownership checks.
