import { AiProviderError } from "../ai/errors";
import {
  AI_PROMPT_VERSION,
  type AiProvider,
  type InsightRequest,
  type MarketInsight,
} from "../ai/types";
import { ResearchCollectionError } from "./collection-error";

interface ResearchInsightContext {
  id: string;
  query: string;
  category: string | null;
  locationQuery: string;
  updatedAt: Date;
  marketMetrics: {
    totalBusinesses: number;
    averageRating: number | null;
    medianRating: number | null;
    averageReviewCount: number | null;
    medianReviewCount: number | null;
    competitionScore: number | null;
    densityScore: number | null;
    metricJson: unknown;
  } | null;
  places: Array<{
    name: string;
    rating: number | null;
    reviewCount: number | null;
    collectedAt: Date;
    competitorScores: Array<{ overallScore: number }>;
  }>;
}

export interface ResearchAiRepository {
  getResearchInsightContext(
    projectId: string,
  ): Promise<ResearchInsightContext | null>;
  saveResearchInsight(input: {
    projectId: string;
    provider: string;
    model: string;
    promptVersion: string;
    insight: MarketInsight;
  }): Promise<{ id: string; generatedAt: Date }>;
}

export type InsightGenerationResult =
  | { status: "disabled"; reason: string }
  | {
      status: "generated";
      id: string;
      generatedAt: Date;
      insight: MarketInsight;
    };

export function createResearchAiService(options: {
  repository: ResearchAiRepository;
  createProvider: () => AiProvider;
}) {
  return {
    async generate(projectId: string): Promise<InsightGenerationResult> {
      let provider: AiProvider;
      try {
        provider = options.createProvider();
      } catch (error) {
        if (error instanceof AiProviderError && error.code === "DISABLED") {
          return { status: "disabled", reason: error.message };
        }
        throw error;
      }

      const context =
        await options.repository.getResearchInsightContext(projectId);
      if (!context) {
        throw new ResearchCollectionError(
          "PROJECT_NOT_FOUND",
          "Research project was not found.",
        );
      }
      const metrics = context.marketMetrics;
      if (!metrics) {
        throw new ResearchCollectionError(
          "COLLECTION_FAILED",
          "Research analytics must be ready before generating an AI insight.",
        );
      }

      const insight = await provider.generateInsight(
        toInsightRequest(context, metrics),
      );
      const saved = await options.repository.saveResearchInsight({
        projectId,
        provider: provider.id,
        model: provider.model,
        promptVersion: AI_PROMPT_VERSION,
        insight,
      });

      return { status: "generated", ...saved, insight };
    },
  };
}

function toInsightRequest(
  context: ResearchInsightContext,
  metrics: NonNullable<ResearchInsightContext["marketMetrics"]>,
): InsightRequest {
  const collectedAt = context.places.reduce(
    (latest, place) =>
      place.collectedAt > latest ? place.collectedAt : latest,
    context.updatedAt,
  );

  return {
    researchId: context.id,
    query: context.query,
    category: context.category,
    location: context.locationQuery,
    collectedAt,
    metrics: {
      totalBusinesses: metrics.totalBusinesses,
      averageRating: metrics.averageRating,
      medianRating: metrics.medianRating,
      averageReviewCount: metrics.averageReviewCount,
      medianReviewCount: metrics.medianReviewCount,
      competitionScore: metrics.competitionScore,
      densityScore: metrics.densityScore,
    },
    topCompetitors: context.places
      .flatMap((place) =>
        place.competitorScores.map((score) => ({
          name: place.name,
          overallScore: score.overallScore,
          rating: place.rating,
          reviewCount: place.reviewCount,
        })),
      )
      .sort((left, right) => right.overallScore - left.overallScore)
      .slice(0, 5),
    opportunitySignals: opportunityMessages(metrics.metricJson),
  };
}

function opportunityMessages(metricJson: unknown): string[] {
  if (!metricJson || typeof metricJson !== "object") return [];
  const value = (metricJson as { opportunitySignals?: unknown })
    .opportunitySignals;
  if (!Array.isArray(value)) return [];

  return value.flatMap((signal) => {
    if (
      signal &&
      typeof signal === "object" &&
      typeof (signal as { message?: unknown }).message === "string"
    ) {
      return [(signal as { message: string }).message];
    }
    return [];
  });
}
