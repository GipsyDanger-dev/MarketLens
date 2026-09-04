import { expect, test } from "@playwright/test";

test("presents a responsive private-workspace access gate", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/access?next=/research/new");

  await expect(
    page.getByRole("heading", {
      name: "Private data stays behind one clear gate.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Open the workspace." }),
  ).toBeVisible();

  const token = page.locator('input[autocomplete="current-password"]');
  await expect(token).toHaveAttribute("type", "password");
  await token.fill("local-test-token");
  await page.getByRole("button", { name: "Show access token" }).click();
  await expect(token).toHaveAttribute("type", "text");
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
});
