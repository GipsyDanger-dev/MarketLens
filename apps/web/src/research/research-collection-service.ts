import "server-only";

import {
  completeResearchCollection,
  failResearchCollection,
  getResearchProgress,
  persistResearchPlace,
  queueResearchCollection,
  updateResearchCollectionStage,
} from "../lib/research-collection-repository";
import { createProviderRegistry } from "../providers";
import type { ProviderRegistry } from "../providers/registry";
import { candidateToPersistablePlace } from "./candidate-to-place";
import type { ResearchProgress } from "./progress";

export interface ResearchCollectionServiceOptions {
  registry?: ProviderRegistry;
  now?: () => Date;
}

export async function runResearchCollection(
  projectId: string,
  options: ResearchCollectionServiceOptions = {},
): Promise<ResearchProgress> {
  const now = options.now ?? (() => new Date());
  const registry = options.registry ?? createProviderRegistry();
  const { project, job } = await queueResearchCollection(projectId, now());
  let totalDiscovered = 0;
  let totalProcessed = 0;
  let totalFailed = 0;

  try {
    await updateResearchCollectionStage({
      projectId,
      jobId: job.id,
      status: "COLLECTING",
    });

    const provider = registry.get(project.providerId);
    const response = await provider.search({
      query: project.query,
      category: project.category ?? undefined,
      latitude: project.latitude,
      longitude: project.longitude,
      radiusMeters: project.radiusMeters,
      maxResults: project.maxResults,
    });
    totalDiscovered = response.places.length;

    await updateResearchCollectionStage({
      projectId,
      jobId: job.id,
      status: "NORMALIZING",
      totalDiscovered,
      totalProcessed,
      totalFailed,
    });

    for (const candidate of response.places) {
      try {
        const place = candidateToPersistablePlace(candidate);

        if (!place) {
          totalFailed += 1;
        } else {
          await persistResearchPlace({ researchProjectId: projectId, place });
          totalProcessed += 1;
        }
      } catch {
        totalFailed += 1;
      }

      await updateResearchCollectionStage({
        projectId,
        jobId: job.id,
        status: "NORMALIZING",
        totalDiscovered,
        totalProcessed,
        totalFailed,
        progress: collectionProgress(
          totalDiscovered,
          totalProcessed,
          totalFailed,
        ),
      });
    }

    await updateResearchCollectionStage({
      projectId,
      jobId: job.id,
      status: "ANALYZING",
      totalDiscovered,
      totalProcessed,
      totalFailed,
    });
    await completeResearchCollection({
      projectId,
      jobId: job.id,
      totalDiscovered,
      totalProcessed,
      totalFailed,
      completedAt: now(),
    });
  } catch (error) {
    await failResearchCollection({
      projectId,
      jobId: job.id,
      totalDiscovered,
      totalProcessed,
      totalFailed,
      error: collectionErrorMessage(error),
      completedAt: now(),
    });
  }

  return getResearchProgress(projectId);
}

export async function retryResearchCollection(
  projectId: string,
  options: ResearchCollectionServiceOptions = {},
): Promise<ResearchProgress> {
  return runResearchCollection(projectId, options);
}

function collectionProgress(
  totalDiscovered: number,
  totalProcessed: number,
  totalFailed: number,
): number {
  if (totalDiscovered === 0) {
    return 60;
  }

  return (
    60 + Math.round(((totalProcessed + totalFailed) / totalDiscovered) * 30)
  );
}

function collectionErrorMessage(error: unknown): string {
  const message =
    error instanceof Error ? error.message : "Research collection failed.";

  return message.slice(0, 1_000);
}
