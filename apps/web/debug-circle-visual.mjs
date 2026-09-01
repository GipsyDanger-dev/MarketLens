import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
  });

  await page.goto("http://localhost:3000/research/new", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(5000);

  const centerHandle = await page.$(".handle-center");
  const edgeHandle = await page.$(".handle-edge");
  if (!centerHandle || !edgeHandle) {
    console.error("Handles not found!");
    await browser.close();
    return;
  }

  let edgeBox = await edgeHandle.boundingBox();
  const startX = edgeBox.x + edgeBox.width / 2;
  const startY = edgeBox.y + edgeBox.height / 2;

  console.log(`Edge at (${startX.toFixed(0)}, ${startY.toFixed(0)})`);

  // Screenshot BEFORE drag
  await page.screenshot({ path: "screenshots/map-picker/debug-00-before.png" });
  console.log("📸 debug-00-before.png");

  await page.mouse.move(startX, startY);
  await page.waitForTimeout(200);
  await page.mouse.down();

  // Take screenshot at each drag step
  for (let step = 1; step <= 15; step++) {
    const x = startX + step * 8;
    await page.mouse.move(x, startY);
    await page.waitForTimeout(80);
    await page.screenshot({
      path: `screenshots/map-picker/debug-drag-${String(step).padStart(2, "0")}.png`,
    });
    console.log(
      `📸 debug-drag-${String(step).padStart(2, "0")}.png — mouse at (${x.toFixed(0)}, ${startY.toFixed(0)})`,
    );
  }

  await page.mouse.up();
  await page.waitForTimeout(1500);

  // Screenshot AFTER drag + auto-zoom
  await page.screenshot({ path: "screenshots/map-picker/debug-99-after.png" });
  console.log("📸 debug-99-after.png");

  // Check radius text
  const radius = await page.evaluate(() => {
    const spans = document.querySelectorAll("span");
    for (const s of spans) {
      if (s.textContent?.match(/\d+\.\d+ km/)) return s.textContent.trim();
    }
    return "not found";
  });
  console.log(`\nFinal radius: ${radius}`);

  // Check if circle elements exist
  const circleInfo = await page.evaluate(() => {
    const svgs = document.querySelectorAll("svg");
    const canvases = document.querySelectorAll("canvas");
    return {
      svgCount: svgs.length,
      canvasCount: canvases.length,
    };
  });
  console.log(
    `SVG elements: ${circleInfo.svgCount}, Canvas elements: ${circleInfo.canvasCount}`,
  );

  await browser.close();
  console.log("\nDone! Check screenshots/map-picker/debug-*.png");
}

main().catch((err) => {
  console.error("Debug failed:", err);
  process.exit(1);
});
