import { z } from "zod";

export const reportInsightSchema = z
  .object({
    marketSummary: z.array(z.string()),
    competitionInsights: z.array(z.string()),
    opportunitySignals: z.array(z.string()),
    risks: z.array(z.string()),
    recommendations: z.array(z.string()),
    limitations: z.array(z.string()),
  })
  .strict();

export const researchReportSchema = z.object({
  metadata: z.object({
    researchId: z.string(),
    name: z.string(),
    query: z.string(),
    category: z.string().nullable(),
    location: z.string(),
    generatedAt: z.string().datetime(),
    collectedAt: z.string().datetime().nullable(),
    methodology: z.string(),
  }),
  metrics: z.object({
    totalBusinesses: z.number(),
    averageRating: z.number().nullable(),
    medianRating: z.number().nullable(),
    averageReviewCount: z.number().nullable(),
    medianReviewCount: z.number().nullable(),
    competitionScore: z.number().nullable(),
    densityScore: z.number().nullable(),
    opportunitySignals: z.array(z.string()),
  }),
  competitors: z.array(
    z.object({
      name: z.string(),
      rating: z.number().nullable(),
      reviewCount: z.number().nullable(),
      overallScore: z.number().nullable(),
      explanation: z.string().nullable(),
    }),
  ),
  places: z.array(
    z.object({
      name: z.string(),
      category: z.string().nullable(),
      address: z.string().nullable(),
      rating: z.number().nullable(),
      reviewCount: z.number().nullable(),
      phone: z.string().nullable().optional(),
      website: z.url().nullable().optional(),
      emails: z.array(z.string()).optional(),
      socialLinks: z.record(z.string(), z.url()).optional(),
      sourceUrl: z.url().nullable().optional(),
      latitude: z.number(),
      longitude: z.number(),
    }),
  ),
  aiInsight: reportInsightSchema.nullable(),
  limitations: z.array(z.string()),
});

export type ResearchReport = z.infer<typeof researchReportSchema>;
