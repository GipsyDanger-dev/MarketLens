/**
 * Screenshot test for MarketLens research results.
 *
 * Uses Playwright to navigate to the results page,
 * waits for collection to complete, and takes screenshots.
 */
import { chromium } from "playwright-core";

const PROJECT_ID = "cmtgz27en006r14pvxejfd05t";
const BASE_URL = "http://localhost:3000";
const SCREENSHOT_DIR = "screenshots";

async function waitForCollection(projectId, maxWaitMs = 300_000) {
  const deadline = Date.now() + maxWaitMs;

  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE_URL}/api/research/${projectId}/progress`);
      const data = await res.json();

      console.log(
        `  Status: ${data.projectStatus} | Progress: ${data.progress}% | Discovered: ${data.totalDiscovered}`,
      );

      if (data.projectStatus === "READY" || data.projectStatus === "FAILED") {
        return data;
      }
    } catch {
      // Server might be busy
    }

    await new Promise((r) => setTimeout(r, 3000));
  }

  throw new Error("Collection did not complete within timeout");
}

async function main() {
  console.log("🚀 Starting Playwright screenshot test...\n");

  // Step 1: Wait for collection to finish
  console.log("⏳ Waiting for collection to complete...");
  const progress = await waitForCollection(PROJECT_ID);
  console.log(`\n✅ Collection complete: ${progress.projectStatus}\n`);

  // Step 2: Launch browser
  console.log("🌐 Launching browser...");
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: "en-US",
  });

  const page = await context.newPage();

  try {
    // Step 3: Navigate to results page
    const resultsUrl = `${BASE_URL}/research/${PROJECT_ID}`;
    console.log(`📄 Navigating to ${resultsUrl}...`);
    await page.goto(resultsUrl, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    // Give time for client-side React hydration + data fetch
    await page.waitForTimeout(8000);

    // Step 4: Take full page screenshot
    const screenshot1 = `${SCREENSHOT_DIR}/01-results-full.png`;
    await page.screenshot({ path: screenshot1, fullPage: true });
    console.log(`📸 Screenshot saved: ${screenshot1}`);

    // Step 5: Take viewport screenshot (top section)
    const screenshot2 = `${SCREENSHOT_DIR}/02-results-header.png`;
    await page.screenshot({ path: screenshot2 });
    console.log(`📸 Screenshot saved: ${screenshot2}`);

    // Step 6: Scroll to business table and screenshot
    await page.evaluate(() => {
      const table = document.querySelector("table");
      if (table) table.scrollIntoView({ behavior: "instant" });
    });
    await page.waitForTimeout(1000);
    const screenshot3 = `${SCREENSHOT_DIR}/03-business-table.png`;
    await page.screenshot({ path: screenshot3 });
    console.log(`📸 Screenshot saved: ${screenshot3}`);

    // Step 7: Scroll to map section
    await page.evaluate(() => {
      const mapEl =
        document.querySelector("[class*='maplibregl']") ||
        document.querySelector("canvas");
      if (mapEl) mapEl.scrollIntoView({ behavior: "instant" });
    });
    await page.waitForTimeout(2000);
    const screenshot4 = `${SCREENSHOT_DIR}/04-map-section.png`;
    await page.screenshot({ path: screenshot4 });
    console.log(`📸 Screenshot saved: ${screenshot4}`);

    // Step 8: Get page content summary
    const summary = await page.evaluate(() => {
      const h1 = document.querySelector("h1")?.textContent ?? "N/A";
      const metrics = Array.from(
        document.querySelectorAll("dd.type-display"),
      ).map((el) => el.textContent?.trim());
      const tableRows = document.querySelectorAll("tbody tr");
      const firstRows = Array.from(tableRows)
        .slice(0, 5)
        .map((row) => {
          const cells = row.querySelectorAll("td");
          return {
            name: cells[0]?.textContent?.trim(),
            rating: cells[1]?.textContent?.trim(),
            reviews: cells[2]?.textContent?.trim(),
          };
        });

      return { h1, metrics, firstRows, totalRows: tableRows.length };
    });

    console.log("\n📊 Page Summary:");
    console.log(`  Title: ${summary.h1}`);
    console.log(`  Metrics: ${summary.metrics.join(" | ")}`);
    console.log(`  Table rows: ${summary.totalRows}`);
    console.log("  Top 5 businesses:");
    summary.firstRows.forEach((row, i) => {
      console.log(
        `    ${i + 1}. ${row.name} | ⭐${row.rating} | ${row.reviews} reviews`,
      );
    });
  } finally {
    await browser.close();
    console.log("\n🏁 Browser closed. Test complete!");
  }
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
