import { expect, test } from "@playwright/test";

test("initializes the interactive map canvas for selecting research coverage", async ({
  page,
}) => {
  await page.goto("/research/new");

  await expect(page.locator("canvas.maplibregl-canvas")).toBeVisible({
    timeout: 10_000,
  });

  const centerHandle = page.getByRole("button", {
    name: /Move research area center/u,
  });
  const radiusHandle = page.getByRole("button", {
    name: /Resize research area/u,
  });
  await expect(centerHandle).toBeVisible();
  await expect(radiusHandle).toBeVisible();

  await radiusHandle.focus();
  await radiusHandle.press("ArrowRight");
  await expect(page.getByText("5.3 km").first()).toBeVisible();
});
