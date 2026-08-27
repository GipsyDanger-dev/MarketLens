import { z } from "zod";

export const AI_PROMPT_VERSION = "marketlens-insight-v1";

export const marketInsightSchema = z
  .object({
    marketSummary: z.array(z.string().min(1)).min(1).max(5),
    competitionInsights: z.array(z.string().min(1)).max(5),
    opportunitySignals: z.array(z.string().min(1)).max(5),
    risks: z.array(z.string().min(1)).max(5),
    recommendations: z.array(z.string().min(1)).max(5),
    limitations: z.array(z.string().min(1)).min(1).max(5),
  })
  .strict();

export type MarketInsight = z.infer<typeof marketInsightSchema>;

export interface InsightMetrics {
  totalBusinesses: number;
  averageRating: number | null;
  medianRating: number | null;
  averageReviewCount: number | null;
  medianReviewCount: number | null;
  competitionScore: number | null;
  densityScore: number | null;
}

export interface InsightCompetitor {
  name: string;
  overallScore: number;
  rating: number | null;
  reviewCount: number | null;
}

export interface InsightRequest {
  researchId: string;
  query: string;
  category: string | null;
  location: string;
  collectedAt: Date;
  metrics: InsightMetrics;
  topCompetitors: InsightCompetitor[];
  opportunitySignals: string[];
}

export interface AiProvider {
  readonly id: string;
  readonly model: string;
  generateInsight(request: InsightRequest): Promise<MarketInsight>;
}
