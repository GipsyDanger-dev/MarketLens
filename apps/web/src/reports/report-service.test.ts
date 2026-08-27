import { describe, expect, it, vi } from "vitest";
import {
  createResearchReportService,
  type ResearchReportRepository,
} from "./report-service";

describe("createResearchReportService", () => {
  it("builds and persists one reproducible report snapshot", async () => {
    const repository: ResearchReportRepository = {
      getResearchReportSource: vi.fn().mockResolvedValue({
        id: "r1",
        name: "Coffee",
        query: "coffee",
        category: null,
        locationQuery: "Malang",
        updatedAt: new Date(),
        marketMetrics: {
          totalBusinesses: 0,
          averageRating: null,
          medianRating: null,
          averageReviewCount: null,
          medianReviewCount: null,
          competitionScore: null,
          densityScore: null,
          metricJson: {},
        },
        places: [],
        aiInsights: [],
      }),
      saveResearchReport: vi.fn().mockResolvedValue({
        id: "report-1",
        generatedAt: new Date("2026-08-29T00:00:00.000Z"),
      }),
    };
    const result = await createResearchReportService(repository).generate(
      "r1",
      new Date("2026-08-29T00:00:00.000Z"),
    );
    expect(result).toMatchObject({
      id: "report-1",
      report: { metadata: { researchId: "r1" } },
    });
    expect(repository.saveResearchReport).toHaveBeenCalledOnce();
  });
});
