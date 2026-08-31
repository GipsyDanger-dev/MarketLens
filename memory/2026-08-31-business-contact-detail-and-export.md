# Business contact detail and export completion

## Product gap

The collection pipeline persisted phone numbers, websites, addresses, and source URLs, but the results dashboard did not expose the contact fields when a business was selected. CSV exports omitted them, and PDF exports contained only market summaries. Social links from compliant provider records were not mapped into canonical data.

## Root cause

The result repository selected phone and website, but the client-side result type and table discarded both. The report DTO and CSV serializer independently selected a reduced place shape, which silently removed contact fields from exports.

## Implementation

- Added an optional `Place.socialLinks` JSON field with an embedded-runtime migration.
- Mapped provider-supplied OpenStreetMap contact tags for Instagram, Facebook, LinkedIn, and X without crawling external profiles.
- Persisted and returned social links plus source URLs through the research results API.
- Added a selectable business-detail panel for map, ranking, and table selections with address, phone, website, provider social links, and source-record links.
- Included contact fields in JSON reports, CSV exports, and the PDF business directory.

## Verification

- Current Malang research: 60 places, 7 with phone, 3 with website, and 60 with source URLs.
- CSV output contains `phone`, `website`, `social_links`, and `source_url` columns and retained observed contact data.
- PDF export completed with HTTP 200 and a non-empty document.
- Full tests passed: CLI 8/8; web 65/65 active tests (3 skipped).

## Data boundary

Availability reflects the selected provider data. OpenStreetMap does not supply every business's contact details or social profile. MarketLens renders and exports data the provider supplies; it does not bypass protections or crawl social accounts to fabricate missing details.
