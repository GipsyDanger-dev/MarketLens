# Experimental Google Maps browser collection

`google-maps-scraper` is a separate provider from the official `google-places`
API adapter. It uses Playwright Chromium to load public search results and
business detail pages. An API key is not required, but internet access and a
local Chromium installation are required. This is an experimental integration,
not a promise of complete coverage or free, unrestricted Google data access.

## Setup

Use Node.js 24+, npm 11+, and Git. Initialize MarketLens normally. Install the
Chromium revision matching the runtime's Playwright dependency from the runtime
directory: the repository root for a source checkout, or `.marketlens/runtime`
inside a CLI-managed installation after its first start has installed dependencies.

```bash
npx playwright install chromium
```

On Linux the browser may also need operating-system libraries; administrators
can install them with `npx playwright install --with-deps chromium`.
The standard Docker image is intended for OSM/Google Places and does not bundle
Chromium; use the local runtime for experimental browser collection.

Select `Google Maps (Scraper)` in the new-study provider menu. The TUI can also
set the default with `marketlens config provider google-maps-scraper`. Restart
services after configuration changes. AI and paid APIs remain optional.

## Data and limits

The mapper supports name, category, address, phone, website, coordinates,
rating, review count and opening-hours raw data when visible. Missing fields
remain missing. Social links are recognized only when the collected website
is a supported social profile; the adapter does not independently discover
Instagram accounts. Many upstream schema fields (photos, popularity, individual
reviews, reservations) are placeholders and are not currently extracted.

`MAX_RESEARCH_RESULTS` defaults to 250 and cannot exceed 1000. The engine caps
detail-page visits before extraction and stops scrolling once the budget is
reached. Radius filtering may return fewer records. `SCRAPER_MAX_DEPTH` defaults
to 10 and caps the study's scroll-depth request. Browser resources are released
after each collection, including failures.

`SCRAPER_EXTRACT_EMAILS=false` is the default. Enabling it visits a collected
business website to look for email addresses, with private-network navigation
guards. It does not guarantee a contact email. `SCRAPER_EXTRACT_EXTRA_REVIEWS`
is reserved and currently has no extraction implementation.

Proxy URL/list settings are optional. The current pool selects a proxy when an
engine is created; the rotation setting does not rotate each detail request.
Do not depend on per-request rotation. Keep any proxy credentials in the local
server environment and never commit them.

## Access and attribution

Page structure, consent pages, rate limits, CAPTCHA or other access restrictions
can stop collection. Do not use proxies to evade access restrictions. Review
the source's applicable terms and data-use requirements for your intended use;
the code's MIT/Apache license is not permission to reuse third-party data.
Keep source URLs and timestamps in exports. For a supported API workflow use
Google Places; for the default key-free workflow use OpenStreetMap/Overpass.

The adapter draws on the MIT-licensed gosom scraper project; the original notice
is preserved in [third-party notices](../THIRD_PARTY_NOTICES.md).
