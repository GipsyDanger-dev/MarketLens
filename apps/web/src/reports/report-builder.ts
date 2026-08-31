import { researchReportSchema, type ResearchReport } from "./types";

export function buildResearchReport(input: {
  project: {
    id: string;
    name: string;
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
      category: string | null;
      address: string | null;
      rating: number | null;
      reviewCount: number | null;
      phone?: string | null;
      website?: string | null;
      socialLinks?: unknown;
      sourceUrl?: string | null;
      latitude: number;
      longitude: number;
      collectedAt: Date;
      competitorScores: Array<{
        overallScore: number;
        explanation: string | null;
      }>;
    }>;
    aiInsights: Array<{ insightJson: unknown }>;
  };
  generatedAt?: Date;
}): ResearchReport {
  const metrics = input.project.marketMetrics;
  if (!metrics)
    throw new Error("Research analytics must be ready before export.");
  const opportunitySignals = messagesFromMetricJson(metrics.metricJson);
  const aiInsight = input.project.aiInsights[0]?.insightJson ?? null;
  const collectedAt = input.project.places.reduce<Date | null>(
    (latest, place) =>
      !latest || place.collectedAt > latest ? place.collectedAt : latest,
    null,
  );
  const report = {
    metadata: {
      researchId: input.project.id,
      name: input.project.name,
      query: input.project.query,
      category: input.project.category,
      location: input.project.locationQuery,
      generatedAt: (input.generatedAt ?? new Date()).toISOString(),
      collectedAt: collectedAt?.toISOString() ?? null,
      methodology:
        "Places are collected through the selected provider, normalized, deduplicated, and analyzed with deterministic MarketLens metrics.",
    },
    metrics: {
      totalBusinesses: metrics.totalBusinesses,
      averageRating: metrics.averageRating,
      medianRating: metrics.medianRating,
      averageReviewCount: metrics.averageReviewCount,
      medianReviewCount: metrics.medianReviewCount,
      competitionScore: metrics.competitionScore,
      densityScore: metrics.densityScore,
      opportunitySignals,
    },
    competitors: input.project.places
      .flatMap((place) =>
        place.competitorScores.map((score) => ({
          name: place.name,
          rating: place.rating,
          reviewCount: place.reviewCount,
          overallScore: score.overallScore,
          explanation: score.explanation,
        })),
      )
      .sort((a, b) => (b.overallScore ?? 0) - (a.overallScore ?? 0)),
    places: input.project.places.map((place) => ({
      name: place.name,
      category: place.category,
      address: place.address,
      rating: place.rating,
      reviewCount: place.reviewCount,
      phone: place.phone ?? null,
      website: place.website ?? null,
      socialLinks: socialLinksFromUnknown(place.socialLinks),
      sourceUrl: place.sourceUrl ?? null,
      latitude: place.latitude,
      longitude: place.longitude,
    })),
    aiInsight,
    limitations: [
      "Results reflect the collected provider dataset and timestamp, not the complete market.",
      "Opportunity signals are potential indicators and require further validation.",
      ...(aiInsight
        ? []
        : ["No optional AI insight has been generated for this report."]),
    ],
  };
  return researchReportSchema.parse(report);
}

function socialLinksFromUnknown(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value).flatMap(([network, href]) =>
      typeof href === "string" && /^https?:\/\//iu.test(href)
        ? [[network, href]]
        : [],
    ),
  );
}

function messagesFromMetricJson(metricJson: unknown): string[] {
  if (!metricJson || typeof metricJson !== "object") return [];
  const value = (metricJson as { opportunitySignals?: unknown })
    .opportunitySignals;
  return Array.isArray(value)
    ? value.flatMap((item) =>
        typeof (item as { message?: unknown })?.message === "string"
          ? [(item as { message: string }).message]
          : [],
      )
    : [];
}
