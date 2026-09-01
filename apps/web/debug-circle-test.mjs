import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
  });

  await page.goto("http://localhost:3000/research/new", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(4000);

  // Helper to get circle source data from the map
  const getCircleData = async () => {
    return page.evaluate(() => {
      // Access the maplibregl map instance through the canvas
      const mapEl = document.querySelector(".maplibregl-map");
      if (!mapEl) return { error: "no map" };
      // Try to find map instance via __maplibregl property or internal state
      const canvas = document.querySelector(".maplibregl-canvas");
      if (!canvas) return { error: "no canvas" };
      // Check if circle fill layer is visible
      const layers = document.querySelectorAll(
        ".maplibregl-canvas-container canvas",
      );
      return {
        canvasCount: layers.length,
        mapExists: !!mapEl,
        circleSourceExists: true, // We'll check via the GeoJSON
      };
    });
  };

  // Get circle source data via page injection
  const checkCircleSource = async (label) => {
    const result = await page.evaluate(() => {
      // Find map instance through the MapLibre internal registry
      const mapContainer = document.querySelector(".maplibregl-map");
      if (!mapContainer) return { found: false, reason: "no map container" };

      // MapLibre stores map instance internally
      // Check if we can access it through the _mapId or similar
      const keys = Object.keys(mapContainer);
      for (const key of keys) {
        if (
          mapContainer[key] &&
          typeof mapContainer[key].getSource === "function"
        ) {
          const map = mapContainer[key];
          const src = map.getSource("radius-circle");
          if (src) {
            const data = src._data;
            return {
              found: true,
              type:
                typeof data === "string" ? JSON.parse(data).type : data?.type,
              coordsCount: data?.geometry?.coordinates?.[0]?.length ?? 0,
            };
          }
        }
      }
      return { found: false, reason: "could not access map instance" };
    });
    console.log(`  [${label}] Circle source:`, JSON.stringify(result));
    return result;
  };

  // Find center and edge handles
  const centerHandle = await page.$(".handle-center");
  const edgeHandle = await page.$(".handle-edge");
  if (!centerHandle || !edgeHandle) {
    console.error("Handles not found!");
    await browser.close();
    return;
  }

  let edgeBox = await edgeHandle.boundingBox();
  let centerBox = await centerHandle.boundingBox();
  console.log("Initial positions:");
  console.log(
    `  Center: (${centerBox.x.toFixed(0)}, ${centerBox.y.toFixed(0)})`,
  );
  console.log(`  Edge: (${edgeBox.x.toFixed(0)}, ${edgeBox.y.toFixed(0)})`);

  await checkCircleSource("BEFORE drag");

  // Simulate edge drag
  const startX = edgeBox.x + edgeBox.width / 2;
  const startY = edgeBox.y + edgeBox.height / 2;

  console.log(
    `\nDragging edge from (${startX.toFixed(0)}, ${startY.toFixed(0)}) to the right...`,
  );

  await page.mouse.move(startX, startY);
  await page.waitForTimeout(100);
  await page.mouse.down();

  // Drag step by step and check circle at each step
  for (let step = 1; step <= 10; step++) {
    const x = startX + step * 10;
    await page.mouse.move(x, startY);
    await page.waitForTimeout(50);

    if (step === 5 || step === 10) {
      await checkCircleSource(`DRAG step ${step}`);

      // Also check if circle fill layer is rendering
      const circleVisible = await page.evaluate(() => {
        // Check the map canvas for green pixels
        const canvas = document.querySelector(".maplibregl-canvas");
        if (!canvas) return false;
        const ctx = canvas.getContext("2d");
        if (!ctx) return "no ctx (webgl)";
        return "canvas checked";
      });
      console.log(`  [step ${step}] Canvas check: ${circleVisible}`);
    }
  }

  await page.mouse.up();
  await page.waitForTimeout(1000);

  await checkCircleSource("AFTER drag");

  // Check if circle is visible by looking at the map canvas
  const afterDragInfo = await page.evaluate(() => {
    const mapContainer = document.querySelector(".maplibregl-map");
    const keys = Object.keys(mapContainer || {});
    for (const key of keys) {
      if (
        mapContainer[key] &&
        typeof mapContainer[key].getSource === "function"
      ) {
        const map = mapContainer[key];
        const src = map.getSource("radius-circle");
        if (src) {
          const data =
            typeof src._data === "string" ? JSON.parse(src._data) : src._data;
          const coords = data?.geometry?.coordinates?.[0] || [];
          // Get bounding box of the circle
          const lngs = coords.map((c) => c[0]);
          const lats = coords.map((c) => c[1]);
          const minLng = Math.min(...lngs);
          const maxLng = Math.max(...lngs);
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);

          // Project bounds to screen
          const topLeft = map.project([minLng, maxLat]);
          const bottomRight = map.project([maxLng, minLat]);

          return {
            found: true,
            coordsCount: coords.length,
            boundsPixels: {
              left: topLeft.x.toFixed(0),
              top: topLeft.y.toFixed(0),
              right: bottomRight.x.toFixed(0),
              bottom: bottomRight.y.toFixed(0),
            },
            widthPx: (bottomRight.x - topLeft.x).toFixed(0),
            heightPx: (bottomRight.y - topLeft.y).toFixed(0),
            zoom: map.getZoom().toFixed(2),
            center: map.getCenter(),
          };
        }
      }
    }
    return { found: false };
  });
  console.log(
    "\nAfter drag circle info:",
    JSON.stringify(afterDragInfo, null, 2),
  );

  // Take screenshot
  await page.screenshot({
    path: "screenshots/map-picker/debug-circle-after-drag.png",
  });
  console.log("\n📸 Saved debug screenshot");

  await browser.close();
}

main().catch((err) => {
  console.error("Debug test failed:", err);
  process.exit(1);
});
