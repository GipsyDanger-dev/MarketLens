# Map Radius Picker — Testing & Fixes

## Date: 2026-09-01

## Issue: Edge handle off-screen

The edge handle was positioned at x=1341 (viewport 1280px), making it impossible to drag.

### Root Cause

The map used a fixed zoom level (13) regardless of radius. For a 5km radius, the circle extended beyond the viewport.

### Fix: fitBounds auto-zoom

Replaced `radiusToZoom()` with `fitBounds()` that calculates bounds from center + radius and fits the map to show the entire circle with padding.

```typescript
const circleToBounds = (center, r) => {
  const rDegLat = r / 111_320;
  const rDegLng = r / (111_320 * Math.cos((center[1] * Math.PI) / 180));
  return [
    [center[0] - rDegLng, center[1] - rDegLat],
    [center[0] + rDegLng, center[1] + rDegLat],
  ];
};

const fitMapToCircle = (center, r) => {
  map.fitBounds(circleToBounds(center, r), {
    padding: 60,
    maxZoom: 16,
    duration: 0,
  });
};
```

### Applied to:

1. Initial map load (after `map.on("load")`)
2. Edge drag release (`handlePointerUp`)
3. Preset button changes (useEffect watching `initialRadius`)

## Playwright Test Results (7/7 PASS)

| #   | Test                              | Result                      |
| --- | --------------------------------- | --------------------------- |
| 1   | Initial state — handles visible   | ✅ PASS                     |
| 2   | Edge drag RIGHT → increase radius | ✅ 5.0 → 6.2 km             |
| 3   | Edge drag LEFT → decrease radius  | ✅ 6.2 → 4.6 km             |
| 4   | Center drag → move circle         | ✅ Coordinates updated      |
| 5   | Click map → set new center        | ✅ Center changed           |
| 6   | Preset buttons (Nearby/Metro)     | ✅ 1.0 km / 15.0 km         |
| 7   | Map canvas + visual elements      | ✅ OSM tiles, circle layers |

## Files Changed

- `apps/web/src/components/research/map-radius-picker.tsx` — fitBounds auto-zoom

## Screenshots

- `screenshots/map-picker/01-initial.png` through `09-final.png`
- `~/.agent/diagrams/map-picker-test-results.html` — visual summary
