import { describe, expect, it, vi } from "vitest";

import { AiProviderError } from "../ai/errors";
import type { AiProvider, MarketInsight } from "../ai/types";
import {
  createResearchAiService,
  type ResearchAiRepository,
} from "./research-ai-service";

const insight: MarketInsight = {
  marketSummary: ["The sample has two businesses."],
  competitionInsights: ["Scores are based on observed data."],
  opportunitySignals: ["A potential gap needs validation."],
  risks: ["Coverage can be incomplete."],
  recommendations: ["Conduct primary research."],
  limitations: ["Only collected data was used."],
};

function createRepository(): ResearchAiRepository {
  return {
    getResearchInsightContext: vi.fn().mockResolvedValue({
      id: "research-1",
      query: "coffee shops",
      category: "Cafe",
      locationQuery: "Malang",
      updatedAt: new Date("2026-08-28T00:00:00.000Z"),
      marketMetrics: {
        totalBusinesses: 2,
        averageRating: 4.2,
        medianRating: 4.2,
        averageReviewCount: 30,
        medianReviewCount: 30,
        competitionScore: 0.6,
        densityScore: 0.4,
        metricJson: {
          opportunitySignals: [{ message: "Possible geographic gap." }],
        },
      },
      places: [
        {
          name: "Alpha Cafe",
          rating: 4.5,
          reviewCount: 100,
          collectedAt: new Date("2026-08-27T00:00:00.000Z"),
          competitorScores: [{ overallScore: 0.8 }],
        },
      ],
    }),
    saveResearchInsight: vi.fn().mockResolvedValue({
      id: "insight-1",
      generatedAt: new Date("2026-08-28T01:00:00.000Z"),
    }),
  };
}

describe("createResearchAiService", () => {
  it("uses a mock provider and persists its structured insight snapshot", async () => {
    const repository = createRepository();
    const provider: AiProvider = {
      id: "mock",
      model: "mock-v1",
      generateInsight: vi.fn().mockResolvedValue(insight),
    };
    const service = createResearchAiService({
      repository,
      createProvider: () => provider,
    });

    await expect(service.generate("research-1")).resolves.toMatchObject({
      status: "generated",
      id: "insight-1",
      insight,
    });
    expect(provider.generateInsight).toHaveBeenCalledWith(
      expect.objectContaining({
        collectedAt: new Date("2026-08-28T00:00:00.000Z"),
        topCompetitors: [
          expect.objectContaining({ name: "Alpha Cafe", overallScore: 0.8 }),
        ],
      }),
    );
    expect(repository.saveResearchInsight).toHaveBeenCalledWith(
      expect.objectContaining({ provider: "mock", model: "mock-v1", insight }),
    );
  });

  it("returns disabled without reading or writing research data", async () => {
    const repository = createRepository();
    const service = createResearchAiService({
      repository,
      createProvider: () => {
        throw new AiProviderError({
          code: "DISABLED",
          message: "AI is disabled.",
          retryable: false,
        });
      },
    });

    await expect(service.generate("research-1")).resolves.toEqual({
      status: "disabled",
      reason: "AI is disabled.",
    });
    expect(repository.getResearchInsightContext).not.toHaveBeenCalled();
    expect(repository.saveResearchInsight).not.toHaveBeenCalled();
  });
});
