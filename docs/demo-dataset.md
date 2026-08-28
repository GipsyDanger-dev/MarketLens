# Demo dataset

`demo-dataset.csv` is a compact, fictional coffee-shop dataset centered on
Malang. It exists for screenshots, UI walkthroughs, report-layout review, and
provider-adapter development. The business names, addresses, ratings, and review
counts are illustrative; they are not collected place data and must not be used
to make market decisions.

## Shape

The CSV uses the normalized fields common to MarketLens:

- `name`, `category`, and `address` describe the displayed business.
- `latitude` and `longitude` enable the map and proximity calculations.
- `rating` and `review_count` exercise analytics and competitor scoring.
- `source` is `fictional-demo`, making provenance visible at every use.

## Using it today

Open the CSV in a spreadsheet or use it when developing a future CSV provider.
The MVP collection screen intentionally does not yet import CSV files; it
collects from OpenStreetMap by default so first-run research works without a
paid key. Do not present this fixture as live provider output.

For an end-to-end live demo, create a research for `coffee shop` in
`Malang, Indonesia` from `/research/new`, keep OpenStreetMap selected, and run
the project. The default form supplies coordinates and a 5 km radius that match
this walkthrough.
