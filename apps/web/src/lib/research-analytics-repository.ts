import "server-only";

import { Prisma } from "../../../../generated/prisma/client";
import { calculateCompetitorScores } from "../analytics/competition-scoring";
import { calculateDensityScore } from "../analytics/geospatial";
import { calculateBasicMarketMetrics } from "../analytics/market-metrics";
import { calculateOpportunitySignals } from "../analytics/opportunity-signals";
import { ResearchCollectionError } from "../research/collection-error";
import { prisma } from "./prisma";

export async function calculateAndPersistResearchAnalytics(
  projectId: string,
): Promise<void> {
  const project = await prisma.researchProject.findUnique({
    where: { id: projectId },
    select: {
      latitude: true,
      longitude: true,
      radiusMeters: true,
      places: {
        select: {
          id: true,
          name: true,
          latitude: true,
          longitude: true,
          rating: true,
          reviewCount: true,
        },
      },
    },
  });

  if (!project) {
    throw new ResearchCollectionError(
      "PROJECT_NOT_FOUND",
      "Research project was not found.",
    );
  }

  const basicMetrics = calculateBasicMarketMetrics(project.places);
  const competitorScores = calculateCompetitorScores(project.places, project);
  const densityScore = calculateDensityScore(
    basicMetrics.totalBusinesses,
    project.radiusMeters,
  );
  const averageCompetitionScore =
    competitorScores.length === 0
      ? null
      : competitorScores.reduce((sum, score) => sum + score.overallScore, 0) /
        competitorScores.length;
  const opportunitySignals = calculateOpportunitySignals({
    totalBusinesses: basicMetrics.totalBusinesses,
    densityScore,
    averageCompetitionScore,
    ratedBusinesses: project.places.filter((place) => place.rating !== null)
      .length,
  });
  const metricJson = jsonValue({
    ratingDistribution: basicMetrics.ratingDistribution,
    reviewDistribution: basicMetrics.reviewDistribution,
    opportunitySignals,
  });

  await prisma.$transaction(async (transaction) => {
    await transaction.marketMetrics.upsert({
      where: { researchProjectId: projectId },
      create: {
        researchProjectId: projectId,
        totalBusinesses: basicMetrics.totalBusinesses,
        averageRating: basicMetrics.averageRating,
        medianRating: basicMetrics.medianRating,
        averageReviewCount: basicMetrics.averageReviewCount,
        medianReviewCount: basicMetrics.medianReviewCount,
        competitionScore: averageCompetitionScore,
        densityScore,
        metricJson,
      },
      update: {
        totalBusinesses: basicMetrics.totalBusinesses,
        averageRating: basicMetrics.averageRating,
        medianRating: basicMetrics.medianRating,
        averageReviewCount: basicMetrics.averageReviewCount,
        medianReviewCount: basicMetrics.medianReviewCount,
        competitionScore: averageCompetitionScore,
        densityScore,
        metricJson,
      },
    });
    await transaction.competitorScore.deleteMany({
      where: { researchProjectId: projectId },
    });
    await Promise.all(
      competitorScores.map((score) =>
        transaction.competitorScore.create({
          data: {
            researchProjectId: projectId,
            placeId: score.placeId,
            overallScore: score.overallScore,
            componentScores: jsonValue(score.componentScores),
            explanation: score.explanation,
          },
        }),
      ),
    );
  });
}

function jsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}
