import "server-only";

import { ResearchCollectionError } from "../research/collection-error";
import { prisma } from "./prisma";

export async function getResearchResults(projectId: string) {
  const project = await prisma.researchProject.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      query: true,
      category: true,
      locationQuery: true,
      status: true,
      latitude: true,
      longitude: true,
      radiusMeters: true,
      marketMetrics: true,
      places: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          category: true,
          address: true,
          rating: true,
          reviewCount: true,
          phone: true,
          website: true,
          emails: true,
          socialLinks: true,
          sourceUrl: true,
          latitude: true,
          longitude: true,
          competitorScores: {
            where: { researchProjectId: projectId },
            select: {
              overallScore: true,
              componentScores: true,
              explanation: true,
            },
          },
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

  return project;
}
