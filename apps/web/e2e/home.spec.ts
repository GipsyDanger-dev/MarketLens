import { expect, test } from "@playwright/test";

test("renders the MarketLens landing page", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Local market intelligence, on your terms.",
    }),
  ).toBeVisible();
});
