import "server-only";

import { Prisma } from "../../../../generated/prisma/client";
import { prisma } from "./prisma";

export async function getResearchInsightContext(projectId: string) {
  return prisma.researchProject.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      query: true,
      category: true,
      locationQuery: true,
      updatedAt: true,
      marketMetrics: true,
      places: {
        select: {
          name: true,
          rating: true,
          reviewCount: true,
          collectedAt: true,
          competitorScores: {
            where: { researchProjectId: projectId },
            select: { overallScore: true },
          },
        },
      },
    },
  });
}

export async function saveResearchInsight(input: {
  projectId: string;
  provider: string;
  model: string;
  promptVersion: string;
  insight: unknown;
}) {
  return prisma.aIInsight.create({
    data: {
      researchProjectId: input.projectId,
      provider: input.provider,
      model: input.model,
      promptVersion: input.promptVersion,
      insightJson: jsonValue(input.insight),
    },
  });
}

export async function getLatestResearchInsight(projectId: string) {
  return prisma.aIInsight.findFirst({
    where: { researchProjectId: projectId },
    orderBy: { generatedAt: "desc" },
  });
}

function jsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}
