import "server-only";

import { Prisma } from "../../../../generated/prisma/client";
import { prisma } from "./prisma";

export function getResearchReportSource(projectId: string) {
  return prisma.researchProject.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      query: true,
      category: true,
      locationQuery: true,
      updatedAt: true,
      marketMetrics: true,
      places: {
        orderBy: { name: "asc" },
        select: {
          name: true,
          category: true,
          address: true,
          rating: true,
          reviewCount: true,
          latitude: true,
          longitude: true,
          collectedAt: true,
          competitorScores: {
            where: { researchProjectId: projectId },
            select: { overallScore: true, explanation: true },
          },
        },
      },
      aiInsights: {
        orderBy: { generatedAt: "desc" },
        take: 1,
        select: { insightJson: true },
      },
    },
  });
}

export function saveResearchReport(projectId: string, report: unknown) {
  return prisma.report.create({
    data: { researchProjectId: projectId, reportData: jsonValue(report) },
  });
}

function jsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}
