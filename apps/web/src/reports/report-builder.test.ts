import { describe, expect, it } from "vitest";
import { buildResearchReport } from "./report-builder";

describe("buildResearchReport", () => {
  it("builds an evidence-bound report with methodology and limitations", () => {
    const report = buildResearchReport({
      project: {
        id: "r1",
        name: "Coffee",
        query: "coffee",
        category: "cafe",
        locationQuery: "Malang",
        updatedAt: new Date(),
        marketMetrics: {
          totalBusinesses: 1,
          averageRating: 4.5,
          medianRating: 4.5,
          averageReviewCount: 8,
          medianReviewCount: 8,
          competitionScore: 0.6,
          densityScore: 0.2,
          metricJson: { opportunitySignals: [{ message: "Validate gap." }] },
        },
        places: [
          {
            name: "Kopi",
            category: "cafe",
            address: null,
            rating: 4.5,
            reviewCount: 8,
            latitude: -7.9,
            longitude: 112.6,
            collectedAt: new Date("2026-08-28T00:00:00.000Z"),
            competitorScores: [
              { overallScore: 0.6, explanation: "Available data." },
            ],
          },
        ],
        aiInsights: [],
      },
      generatedAt: new Date("2026-08-29T00:00:00.000Z"),
    });
    expect(report).toMatchObject({
      metadata: { generatedAt: "2026-08-29T00:00:00.000Z" },
      metrics: { opportunitySignals: ["Validate gap."] },
      competitors: [{ name: "Kopi" }],
    });
    expect(report.limitations).toContain(
      "No optional AI insight has been generated for this report.",
    );
  });
});
