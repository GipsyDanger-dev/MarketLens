import "server-only";

import {
  Prisma,
  type ResearchJob,
  type ResearchProject,
} from "../../../../generated/prisma/client";
import type { ResearchStatus } from "../core/research-status";
import type { PersistablePlaceCandidate } from "../research/candidate-to-place";
import { ResearchCollectionError } from "../research/collection-error";
import {
  calculateDataQualityMetrics,
  type DataQualityMetrics,
} from "../research/data-quality";
import {
  collectionProgressByStatus,
  type ResearchProgress,
} from "../research/progress";
import { prisma } from "./prisma";

export type CollectableResearchProject = Pick<
  ResearchProject,
  | "id"
  | "providerId"
  | "query"
  | "category"
  | "latitude"
  | "longitude"
  | "radiusMeters"
  | "maxResults"
>;

export async function queueResearchCollection(
  projectId: string,
  startedAt = new Date(),
): Promise<{ project: CollectableResearchProject; job: ResearchJob }> {
  return prisma.$transaction(async (transaction) => {
    const existingProject = await transaction.researchProject.findUnique({
      where: { id: projectId },
    });

    if (!existingProject) {
      throw new ResearchCollectionError(
        "PROJECT_NOT_FOUND",
        "Research project was not found.",
      );
    }

    const claimed = await transaction.researchProject.updateMany({
      where: {
        id: projectId,
        status: { in: ["DRAFT", "READY", "FAILED"] },
      },
      data: { status: "QUEUED" },
    });

    if (claimed.count !== 1) {
      throw new ResearchCollectionError(
        "PROJECT_BUSY",
        "Research collection is already in progress.",
      );
    }

    const job = await transaction.researchJob.create({
      data: {
        researchProjectId: projectId,
        status: "QUEUED",
        progress: collectionProgressByStatus.QUEUED,
        startedAt,
      },
    });

    return {
      project: pickCollectableProject(existingProject),
      job,
    };
  });
}

export async function updateResearchCollectionStage(options: {
  projectId: string;
  jobId: string;
  status: ResearchStatus;
  totalDiscovered?: number;
  totalProcessed?: number;
  totalFailed?: number;
  progress?: number;
}): Promise<void> {
  await prisma.$transaction([
    prisma.researchProject.update({
      where: { id: options.projectId },
      data: { status: options.status },
    }),
    prisma.researchJob.update({
      where: { id: options.jobId },
      data: {
        status: options.status,
        progress: clampProgress(
          options.progress ?? collectionProgressByStatus[options.status],
        ),
        totalDiscovered: options.totalDiscovered,
        totalProcessed: options.totalProcessed,
        totalFailed: options.totalFailed,
      },
    }),
  ]);
}

export async function persistResearchPlace(options: {
  researchProjectId: string;
  place: PersistablePlaceCandidate;
}): Promise<void> {
  const snapshotPayload = serializeRawData(options.place.rawData);

  await prisma.place.upsert({
    where: {
      researchProjectId_providerId_externalId: {
        researchProjectId: options.researchProjectId,
        providerId: options.place.providerId,
        externalId: options.place.externalId,
      },
    },
    create: {
      researchProjectId: options.researchProjectId,
      providerId: options.place.providerId,
      externalId: options.place.externalId,
      name: options.place.name,
      normalizedName: options.place.normalizedName,
      category: options.place.category,
      providerTypes: options.place.providerTypes,
      address: options.place.address,
      city: options.place.city,
      district: options.place.district,
      country: options.place.country,
      latitude: options.place.latitude,
      longitude: options.place.longitude,
      rating: null,
      reviewCount: null,
      phone: options.place.phone,
      website: options.place.website,
      sourceUrl: options.place.sourceUrl,
      businessStatus: options.place.businessStatus,
      collectedAt: options.place.collectedAt,
      snapshots: { create: { payload: snapshotPayload } },
    },
    update: {
      name: options.place.name,
      normalizedName: options.place.normalizedName,
      category: options.place.category,
      providerTypes: options.place.providerTypes,
      address: options.place.address,
      city: options.place.city,
      district: options.place.district,
      country: options.place.country,
      latitude: options.place.latitude,
      longitude: options.place.longitude,
      rating: null,
      reviewCount: null,
      phone: options.place.phone,
      website: options.place.website,
      sourceUrl: options.place.sourceUrl,
      businessStatus: options.place.businessStatus,
      collectedAt: options.place.collectedAt,
      snapshots: { create: { payload: snapshotPayload } },
    },
  });
}

export async function completeResearchCollection(options: {
  projectId: string;
  jobId: string;
  totalDiscovered: number;
  totalProcessed: number;
  totalFailed: number;
  completedAt?: Date;
}): Promise<void> {
  const completedAt = options.completedAt ?? new Date();

  await prisma.$transaction([
    prisma.researchProject.update({
      where: { id: options.projectId },
      data: { status: "READY" },
    }),
    prisma.researchJob.update({
      where: { id: options.jobId },
      data: {
        status: "READY",
        progress: collectionProgressByStatus.READY,
        totalDiscovered: options.totalDiscovered,
        totalProcessed: options.totalProcessed,
        totalFailed: options.totalFailed,
        completedAt,
        error: null,
      },
    }),
  ]);
}

export async function failResearchCollection(options: {
  projectId: string;
  jobId: string;
  totalDiscovered: number;
  totalProcessed: number;
  totalFailed: number;
  error: string;
  completedAt?: Date;
}): Promise<void> {
  const completedAt = options.completedAt ?? new Date();

  await prisma.$transaction([
    prisma.researchProject.update({
      where: { id: options.projectId },
      data: { status: "FAILED" },
    }),
    prisma.researchJob.update({
      where: { id: options.jobId },
      data: {
        status: "FAILED",
        progress: collectionProgressByStatus.FAILED,
        totalDiscovered: options.totalDiscovered,
        totalProcessed: options.totalProcessed,
        totalFailed: options.totalFailed,
        completedAt,
        error: options.error,
      },
    }),
  ]);
}

export async function getResearchProgress(
  projectId: string,
): Promise<ResearchProgress> {
  const project = await prisma.researchProject.findUnique({
    where: { id: projectId },
    include: {
      jobs: {
        orderBy: { startedAt: "desc" },
        take: 1,
      },
    },
  });

  if (!project) {
    throw new ResearchCollectionError(
      "PROJECT_NOT_FOUND",
      "Research project was not found.",
    );
  }

  const job = project.jobs[0];

  return {
    projectId: project.id,
    projectStatus: project.status,
    jobId: job?.id ?? null,
    jobStatus: job?.status ?? null,
    totalDiscovered: job?.totalDiscovered ?? 0,
    totalProcessed: job?.totalProcessed ?? 0,
    totalFailed: job?.totalFailed ?? 0,
    progress: job?.progress ?? collectionProgressByStatus[project.status],
    startedAt: job?.startedAt ?? null,
    completedAt: job?.completedAt ?? null,
    error: job?.error ?? null,
  };
}

export async function getResearchDataQuality(
  projectId: string,
): Promise<DataQualityMetrics> {
  const project = await prisma.researchProject.findUnique({
    where: { id: projectId },
    select: {
      places: {
        select: {
          providerId: true,
          externalId: true,
          normalizedName: true,
          category: true,
          address: true,
          latitude: true,
          longitude: true,
          phone: true,
          website: true,
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

  return calculateDataQualityMetrics(project.places);
}

function pickCollectableProject(
  project: ResearchProject,
): CollectableResearchProject {
  return {
    id: project.id,
    providerId: project.providerId,
    query: project.query,
    category: project.category,
    latitude: project.latitude,
    longitude: project.longitude,
    radiusMeters: project.radiusMeters,
    maxResults: project.maxResults,
  };
}

function serializeRawData(value: unknown): Prisma.InputJsonObject {
  const serialized = JSON.stringify(value ?? null);

  if (serialized === undefined) {
    throw new TypeError("Provider raw data must be JSON serializable.");
  }

  return { data: JSON.parse(serialized) } as Prisma.InputJsonObject;
}

function clampProgress(progress: number): number {
  return Math.max(0, Math.min(100, Math.round(progress)));
}
