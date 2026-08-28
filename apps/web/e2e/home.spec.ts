import { expect, test } from "@playwright/test";

test("renders a public landing page with a usable research CTA", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "See the local market before you enter it.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Create your first research" }),
  ).toHaveAttribute("href", "/research/new");
});

test("keeps the research CTA available on a mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  await expect(
    page.getByRole("link", { name: "Create your first research" }),
  ).toBeVisible();
});
