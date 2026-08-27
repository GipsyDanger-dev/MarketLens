# Map and Geospatial Intelligence

Sprint 7 uses MapLibre GL JS in a client-only component. It renders an open
demo tile style, a GeoJSON source of normalized places, native marker clusters,
and a polygon for the configured research radius. MapLibre is provider-neutral;
the map never depends on an individual place provider.

The map source and business table share the same active filter set. The **In
radius** toggle uses Haversine distance from the persisted research center, so
only matching places remain in both views. Clicking an unclustered map place
selects its table row; clicking a row selects the matching place state.

Map tiles are an external display service. A production deployment should
configure an appropriate tile style and follow its provider terms before
high-volume use.
