import { expect, test } from "@playwright/test";

test("initializes the interactive map canvas for selecting research coverage", async ({
  page,
}) => {
  await page.goto("/research/new");

  await expect(page.locator("canvas.maplibregl-canvas")).toBeVisible({
    timeout: 10_000,
  });
});
