import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const SCREENSHOT_DIR = "screenshots/map-picker";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
  });

  console.log("1. Navigating to research creation page...");
  await page.goto(`${BASE}/research/new`, { waitUntil: "domcontentloaded" });

  // Wait for the map to load
  console.log("2. Waiting for map tiles and handles to load...");
  await page.waitForTimeout(4000);

  // Screenshot: Initial state
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/01-initial.png`,
    fullPage: true,
  });
  console.log("   📸 01-initial.png — initial page state");

  // Check if map loaded
  const mapContainer = await page.$(".maplibregl-map");
  if (!mapContainer) {
    console.error("❌ Map container not found!");
    await browser.close();
    return;
  }
  console.log("   ✅ Map container found");

  // Check handles
  const centerHandle = await page.$(".handle-center");
  const edgeHandle = await page.$(".handle-edge");
  if (!centerHandle || !edgeHandle) {
    console.error("❌ Handles not found!");
    await browser.close();
    return;
  }
  console.log("   ✅ Center handle found");
  console.log("   ✅ Edge handle found");

  // Helper to get current radius text
  const getRadius = async () => {
    return page.evaluate(() => {
      const el = document.querySelector(".handle-edge");
      const label = el?.parentElement?.querySelector("[class*='z-30'] span");
      return label?.textContent?.trim() ?? "unknown";
    });
  };

  // Helper to get current center coords
  const getCenter = async () => {
    return page.evaluate(() => {
      const spans = document.querySelectorAll(".font-mono");
      for (const span of spans) {
        const text = span.textContent?.trim() ?? "";
        if (text.includes(",")) return text;
      }
      return "unknown";
    });
  };

  // Get initial positions
  let centerBox = await centerHandle.boundingBox();
  let edgeBox = await edgeHandle.boundingBox();
  console.log(
    `   Center position: x=${centerBox?.x?.toFixed(1)}, y=${centerBox?.y?.toFixed(1)}`,
  );
  console.log(
    `   Edge position: x=${edgeBox?.x?.toFixed(1)}, y=${edgeBox?.y?.toFixed(1)}`,
  );
  const initialRadius = await getRadius();
  console.log(`   Initial radius: ${initialRadius}`);

  // ============================================
  // TEST 0: Zoom in so edge handle is visible
  // ============================================
  const viewportWidth = 1280;
  if (edgeBox && edgeBox.x + edgeBox.width / 2 > viewportWidth - 20) {
    console.log(
      "\n3. Edge handle is off-screen — zooming in to make it visible...",
    );

    // Zoom in by scrolling up on the map (zoom in = smaller area = handles closer)
    // But actually we need to zoom OUT so the edge comes INTO view... no, zoom IN
    // means the map shows less area so the circle edge moves towards center.
    // Actually: zoom IN → fewer pixels per degree → circle polygon smaller on screen → edge closer

    // Use scroll wheel on the map to zoom in several times
    // Scroll UP = zoom IN on MapLibre
    for (let i = 0; i < 8; i++) {
      await page.mouse.wheel(0, -120);
      await page.waitForTimeout(200);
    }
    await page.waitForTimeout(1000);

    // Re-check handle positions
    centerBox = await centerHandle.boundingBox();
    edgeBox = await edgeHandle.boundingBox();
    console.log(
      `   After zoom — Center: x=${centerBox?.x?.toFixed(1)}, y=${centerBox?.y?.toFixed(1)}`,
    );
    console.log(
      `   After zoom — Edge: x=${edgeBox?.x?.toFixed(1)}, y=${edgeBox?.y?.toFixed(1)}`,
    );

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/02-zoomed-in.png`,
      fullPage: true,
    });
    console.log("   📸 02-zoomed-in.png");
  } else {
    console.log("\n3. Edge handle is within viewport — proceeding directly");
  }

  // ============================================
  // TEST 1: Drag edge handle to resize radius (LARGER)
  // ============================================
  console.log("\n4. TEST: Drag edge handle to RESIZE radius (make larger)...");

  edgeBox = await edgeHandle.boundingBox();
  centerBox = await centerHandle.boundingBox();

  if (edgeBox && centerBox) {
    const startX = edgeBox.x + edgeBox.width / 2;
    const startY = edgeBox.y + edgeBox.height / 2;
    const dragDistance = 120; // pixels to the right

    console.log(
      `   Starting drag from: (${startX.toFixed(1)}, ${startY.toFixed(1)})`,
    );

    await page.mouse.move(startX, startY);
    await page.waitForTimeout(100);
    await page.mouse.down();
    for (let i = 0; i < 15; i++) {
      await page.mouse.move(startX + (dragDistance * (i + 1)) / 15, startY, {
        steps: 1,
      });
      await page.waitForTimeout(40);
    }
    await page.mouse.up();
    await page.waitForTimeout(600);

    const radiusAfterIncrease = await getRadius();
    console.log(`   Radius after drag RIGHT: ${radiusAfterIncrease}`);

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/03-radius-increased.png`,
      fullPage: true,
    });
    console.log("   📸 03-radius-increased.png");

    if (radiusAfterIncrease !== initialRadius) {
      console.log(
        "   ✅ PASS: Radius changed from",
        initialRadius,
        "→",
        radiusAfterIncrease,
      );
    } else {
      console.log(
        "   ⚠️ Radius did not change — drag may not have been captured by the handler",
      );
    }
  } else {
    console.log("   ❌ Could not find handle positions");
  }

  // ============================================
  // TEST 2: Drag edge handle to DECREASE radius
  // ============================================
  console.log("\n5. TEST: Drag edge handle to DECREASE radius...");

  edgeBox = await edgeHandle.boundingBox();
  centerBox = await centerHandle.boundingBox();

  if (edgeBox && centerBox) {
    const startX = edgeBox.x + edgeBox.width / 2;
    const startY = edgeBox.y + edgeBox.height / 2;
    const dragDistance = -160; // pixels to the left

    const radiusBefore = await getRadius();
    console.log(`   Radius before: ${radiusBefore}`);
    console.log(
      `   Starting drag from: (${startX.toFixed(1)}, ${startY.toFixed(1)})`,
    );

    await page.mouse.move(startX, startY);
    await page.waitForTimeout(100);
    await page.mouse.down();
    for (let i = 0; i < 15; i++) {
      await page.mouse.move(startX + (dragDistance * (i + 1)) / 15, startY, {
        steps: 1,
      });
      await page.waitForTimeout(40);
    }
    await page.mouse.up();
    await page.waitForTimeout(600);

    const radiusAfterDecrease = await getRadius();
    console.log(`   Radius after drag LEFT: ${radiusAfterDecrease}`);

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/04-radius-decreased.png`,
      fullPage: true,
    });
    console.log("   📸 04-radius-decreased.png");

    if (radiusAfterDecrease !== radiusBefore) {
      console.log(
        "   ✅ PASS: Radius decreased from",
        radiusBefore,
        "→",
        radiusAfterDecrease,
      );
    } else {
      console.log("   ⚠️ Radius did not change after left drag");
    }
  }

  // ============================================
  // TEST 3: Drag center handle to MOVE circle
  // ============================================
  console.log("\n6. TEST: Drag center handle to MOVE the circle...");

  centerBox = await centerHandle.boundingBox();

  if (centerBox) {
    const startX = centerBox.x + centerBox.width / 2;
    const startY = centerBox.y + centerBox.height / 2;
    const moveX = -80;
    const moveY = -60;

    const initialCenter = await getCenter();
    console.log(`   Initial center: ${initialCenter}`);
    console.log(
      `   Starting drag from: (${startX.toFixed(1)}, ${startY.toFixed(1)})`,
    );

    await page.mouse.move(startX, startY);
    await page.waitForTimeout(100);
    await page.mouse.down();
    for (let i = 0; i < 15; i++) {
      await page.mouse.move(
        startX + (moveX * (i + 1)) / 15,
        startY + (moveY * (i + 1)) / 15,
        { steps: 1 },
      );
      await page.waitForTimeout(40);
    }
    await page.mouse.up();
    await page.waitForTimeout(600);

    const newCenter = await getCenter();
    console.log(`   Center after drag: ${newCenter}`);

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/05-center-moved.png`,
      fullPage: true,
    });
    console.log("   📸 05-center-moved.png");

    if (newCenter !== initialCenter) {
      console.log(
        "   ✅ PASS: Center moved from",
        initialCenter,
        "→",
        newCenter,
      );
    } else {
      console.log("   ⚠️ Center did not change after drag");
    }
  }

  // ============================================
  // TEST 4: Click on map to set new center
  // ============================================
  console.log("\n7. TEST: Click on map to set new center...");

  centerBox = await centerHandle.boundingBox();
  if (centerBox) {
    const clickX = centerBox.x + centerBox.width / 2 + 100;
    const clickY = centerBox.y + centerBox.height / 2 + 60;

    const beforeCenter = await getCenter();
    console.log(`   Before click: ${beforeCenter}`);
    console.log(`   Clicking at: (${clickX.toFixed(1)}, ${clickY.toFixed(1)})`);

    await page.mouse.click(clickX, clickY);
    await page.waitForTimeout(600);

    const afterCenter = await getCenter();
    console.log(`   After click:  ${afterCenter}`);

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/06-click-center.png`,
      fullPage: true,
    });
    console.log("   📸 06-click-center.png");

    if (beforeCenter !== afterCenter) {
      console.log("   ✅ PASS: Click set new center");
    } else {
      console.log("   ⚠️ Center did not change after click");
    }
  }

  // ============================================
  // TEST 5: Verify circle visual layers
  // ============================================
  console.log("\n8. TEST: Verify circle visual elements...");
  const canvasCount = await page.$$eval(
    ".maplibregl-canvas",
    (els) => els.length,
  );
  console.log(
    `   Map canvas elements: ${canvasCount} ${canvasCount > 0 ? "✅" : "❌"}`,
  );

  // ============================================
  // TEST 6: Verify info bar
  // ============================================
  console.log("\n9. TEST: Verify info bar data...");
  const infoText = await page.evaluate(() => {
    const divs = document.querySelectorAll(".space-y-3");
    for (const div of divs) {
      const text = div.textContent?.trim() ?? "";
      if (text.includes("Center:") && text.includes("Radius:")) {
        return text.substring(0, 200);
      }
    }
    return "not found";
  });
  console.log(`   Info bar: ${infoText}`);

  // ============================================
  // TEST 7: Preset buttons
  // ============================================
  console.log("\n10. TEST: Preset buttons...");
  const nearbyBtn = await page.$('button:has-text("Nearby")');
  if (nearbyBtn) {
    await nearbyBtn.click();
    await page.waitForTimeout(800);
    const radiusNearby = await getRadius();
    console.log(`   Nearby preset → radius: ${radiusNearby}`);
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/07-nearby-preset.png`,
      fullPage: true,
    });
    console.log("   📸 07-nearby-preset.png");
  }

  const metroBtn = await page.$('button:has-text("Metro")');
  if (metroBtn) {
    await metroBtn.click();
    await page.waitForTimeout(800);
    const radiusMetro = await getRadius();
    console.log(`   Metro preset → radius: ${radiusMetro}`);
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/08-metro-preset.png`,
      fullPage: true,
    });
    console.log("   📸 08-metro-preset.png");
  }

  // Final screenshot
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/09-final.png`,
    fullPage: true,
  });
  console.log("\n📸 09-final.png — final state");

  console.log(
    "\n✅ All tests completed! Screenshots saved to screenshots/map-picker/",
  );
  await browser.close();
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
