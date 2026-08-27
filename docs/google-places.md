# Google Places (New) provider

Google Places is optional. OpenStreetMap/Overpass remains the default and works
without a paid key. To enable Google Places (New), enable Places API in your
Google Cloud project, restrict the key to the server environment, and set:

```env
GOOGLE_MAPS_API_KEY="your-server-side-key"
```

Restart MarketLens. The New Research page then lists **Google Places API (New)**
alongside OpenStreetMap. No key is sent to the browser, and an unconfigured
Google provider is not registered or selectable.

## Request behavior and cost control

The adapter calls the official `places:searchText` POST endpoint. It asks only
for the fields MarketLens needs: stable ID, display name, formatted address,
coordinates, types, rating, review count, phone, website, Google Maps URL, and
business status. It never requests `*`. Google requires a field mask for Text
Search and bills according to selected fields; review the current [field
selection documentation](https://developers.google.com/maps/documentation/places/web-service/choose-fields)
before changing this list.

Text Search uses a circular location bias from the research coordinates and
radius. It returns the provider `nextPageToken` unchanged for subsequent pages;
MarketLens bounds each request to the requested result limit. HTTP 429 and 5xx
responses are retryable typed provider errors; invalid requests are not.

## Attribution, retention, and policy

Google Places content is subject to the applicable Google Maps Platform Terms
and [Places API policies](https://developers.google.com/maps/documentation/places/web-service/policies).
Keep `sourceUrl` (the returned Google Maps URI) with the place and present a
clear Google Maps attribution/link wherever Google-derived place content is
shown, exported, or reported. Do not imply that Google endorses MarketLens.

Do not use this adapter for scraping, browser automation, CAPTCHA bypass,
authentication/session collection, or any attempt to evade Google controls.
Review the current policy before deployment—especially rules governing caching,
storage, redistribution, branding, and regional availability. Configure a
retention period that meets those terms and delete research projects when the
underlying provider data should no longer be retained. MarketLens stores raw
provider snapshots only to support reproducibility; operators remain
responsible for selecting a compliant retention policy.

Google documents that Place Search requires a field mask, supports pagination,
and subjects returned data to policy and attribution requirements. See the
official [Text Search (New)](https://developers.google.com/maps/documentation/places/web-service/text-search)
and [Nearby Search (New)](https://developers.google.com/maps/documentation/places/web-service/nearby-search)
references for current limits, pricing, and regional terms.
