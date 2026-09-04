import { expect, test } from "@playwright/test";

const researchId = "e2e-ready-research";

test("keeps every ready-research tool usable inside the results workspace", async ({
  page,
}) => {
  await page.route(`**/api/research/${researchId}/progress`, async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        projectId: researchId,
        projectStatus: "READY",
        jobId: "job-e2e",
        jobStatus: "READY",
        totalDiscovered: 2,
        totalProcessed: 2,
        totalFailed: 0,
        progress: 100,
        startedAt: "2026-09-04T01:00:00.000Z",
        completedAt: "2026-09-04T01:01:00.000Z",
        error: null,
      }),
    });
  });
  await page.route(`**/api/research/${researchId}/results`, async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        name: "Malang coffee field",
        query: "coffee shops",
        locationQuery: "Malang",
        status: "READY",
        latitude: -7.977,
        longitude: 112.634,
        radiusMeters: 3000,
        marketMetrics: {
          totalBusinesses: 2,
          averageRating: 4.65,
          averageReviewCount: 86,
          competitionScore: 0.68,
          densityScore: 0.07,
          metricJson: {
            ratingDistribution: [
              { label: "4-5", count: 2 },
            ],
            reviewDistribution: [
              { label: "10-99", count: 1 },
              { label: "100-999", count: 1 },
            ],
          },
        },
        places: [
          {
            id: "place-one",
            name: "First Coffee",
            category: "Coffee shop",
            address: "1 Market Street",
            rating: 4.8,
            reviewCount: 120,
            phone: "+62 812 0000 0001",
            website: "https://first.example",
            emails: ["hello@first.example"],
            socialLinks: { instagram: "https://instagram.com/first" },
            sourceUrl: "https://www.openstreetmap.org/node/1",
            latitude: -7.976,
            longitude: 112.633,
            competitorScores: [
              {
                overallScore: 0.82,
                explanation: "Strong review authority and proximity.",
                componentScores: {
                  ratingStrength: 0.88,
                  reviewAuthority: 0.8,
                  localDensity: 0.64,
                  proximity: 0.96,
                },
              },
            ],
          },
          {
            id: "place-two",
            name: "Second Coffee",
            category: "Cafe",
            address: "2 Market Street",
            rating: 4.5,
            reviewCount: 52,
            phone: null,
            website: null,
            emails: null,
            socialLinks: null,
            sourceUrl: "https://www.openstreetmap.org/node/2",
            latitude: -7.979,
            longitude: 112.636,
            competitorScores: [
              {
                overallScore: 0.56,
                explanation: "Moderate authority in the immediate field.",
                componentScores: {
                  ratingStrength: 0.62,
                  reviewAuthority: 0.44,
                  localDensity: 0.58,
                  proximity: 0.72,
                },
              },
            ],
          },
        ],
      }),
    });
  });
  await page.route(`**/api/research/${researchId}/insights`, async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ insight: null }),
    });
  });

  await page.goto(`/research/${researchId}`);
  await expect(
    page.getByRole("heading", { name: "Malang coffee field" }),
  ).toBeVisible();
  await expect(page.getByRole("tab")).toHaveCount(6);

  await page.getByRole("tab", { name: "Competitors" }).click();
  const secondCompetitor = page.getByRole("button", {
    name: /Second Coffee/u,
  });
  await secondCompetitor.click();
  await expect(secondCompetitor).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("heading", { name: "Explainable competitor ranking" }),
  ).toBeVisible();

  await page.getByRole("tab", { name: "Businesses" }).click();
  await expect(
    page.getByRole("heading", { name: "Business directory" }),
  ).toBeVisible();
  await expect(page.getByText("2 shown from 2 collected records")).toBeVisible();

  await page.getByRole("tab", { name: "Map", exact: true }).click();
  await expect(page.locator("button.maplibregl-marker")).toHaveCount(2, {
    timeout: 10_000,
  });
  await page.getByRole("button", { name: /Select First Coffee/u }).click();
  await expect(
    page.getByRole("heading", { name: "First Coffee" }),
  ).toBeVisible();
  await expect(page.getByText("hello@first.example")).toBeVisible();

  await page.getByRole("tab", { name: "AI insights" }).click();
  await expect(
    page.getByRole("heading", { name: "No insight generated yet" }),
  ).toBeVisible();

  await page.getByRole("tab", { name: "Export" }).click();
  await expect(page.getByRole("link", { name: /Download/u })).toHaveCount(3);
});
