import { describe, expect, it } from "vitest";
import { researchReportToPdf } from "./pdf";
import type { ResearchReport } from "./types";

describe("researchReportToPdf", () => {
  it("renders a valid PDF document", async () => {
    const report: ResearchReport = {
      metadata: {
        researchId: "r1",
        name: "Coffee",
        query: "coffee",
        category: null,
        location: "Malang",
        generatedAt: "2026-08-28T00:00:00.000Z",
        collectedAt: null,
        methodology: "test",
      },
      metrics: {
        totalBusinesses: 0,
        averageRating: null,
        medianRating: null,
        averageReviewCount: null,
        medianReviewCount: null,
        competitionScore: null,
        densityScore: null,
        opportunitySignals: [],
      },
      competitors: [],
      places: [],
      aiInsight: null,
      limitations: ["test"],
    };
    const pdf = await researchReportToPdf(report);
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
  });
});
