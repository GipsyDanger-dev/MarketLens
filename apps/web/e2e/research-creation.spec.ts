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
  await expect(
    page.getByRole("button", { name: "Create & Run" }),
  ).toHaveCount(0);
});
