import { expect, test } from "@playwright/test";

test("renders a public landing page with a usable research CTA", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Read the ground before you make a move.",
    }),
  ).toBeVisible();
  const researchCta = page.getByRole("link", { name: "Start a field study" });
  await expect(researchCta).toHaveAttribute("href", "/research/new");
  await researchCta.click();
  await expect(page).toHaveURL(/\/research\/new$/u);
  await expect(
    page.getByRole("textbox", { name: "What are you researching?" }),
  ).toBeVisible();
  await expect(page.getByLabel("Data provider")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Create study" }),
  ).toBeVisible();
});

test("keeps the research CTA available on a mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  await expect(
    page.getByRole("link", { name: "Start a field study" }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
});
