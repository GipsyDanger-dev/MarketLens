# Browser Pool Concurrency Fix

**Date:** 2026-09-01  
**Status:** DONE

## Symptom

The browser-pool concurrent acquire/release test timed out in its cleanup hook.

## Root cause

Concurrent `acquire()` calls could each observe an empty pool before an
asynchronous browser creation completed. That race exceeded the configured
browser/page allocation boundary and left cleanup with inconsistent shared
resources.

## Fix

- Serialized page reservation and browser creation with an allocation queue.
- Delayed marking a page reusable until its reset navigation completes.
- Changed waiters to observe availability and then reserve through the same
  allocation path.

## Evidence

The regression assertion verifies that three concurrent requests with a
three-page browser limit create one browser. The focused web suite passed:

```text
Test Files  36 passed | 2 skipped (38)
Tests       117 passed | 3 skipped (120)
```

## Related

Browser pooling and parallel collection are described in
`memory/2026-08-31-browser-pooling-parallel-scraping.md`.
