import { expect, test } from "@playwright/test";

test("describes the two-step research collection workflow accurately", async ({
  page,
}) => {
  await page.goto("/research/new");

  await expect(
    page.getByText(
      "Create the study, then start collection from the next screen.",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Create study" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Create & Run" })).toHaveCount(
    0,
  );
  await expect(page.getByText("Up to 250")).toBeVisible();
  await page.getByLabel("Data provider").selectOption("google-maps-scraper");
  await expect(
    page.getByText(/Experimental browser collection requires Chromium/),
  ).toBeVisible();
  await page.route("**/api/research", async (route) => {
    expect(route.request().postDataJSON()).toMatchObject({
      maxResults: 250,
      providerId: "google-maps-scraper",
    });
    await route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({ error: "Test submission received" }),
    });
  });
  await page.getByRole("button", { name: "Create study" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Test submission received" }),
  ).toBeVisible();
});
