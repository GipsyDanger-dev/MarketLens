import type { ResearchStatus } from "../core/research-status";

export interface ResearchProgress {
  projectId: string;
  projectStatus: ResearchStatus;
  jobId: string | null;
  jobStatus: ResearchStatus | null;
  totalDiscovered: number;
  totalProcessed: number;
  totalFailed: number;
  progress: number;
  startedAt: Date | null;
  completedAt: Date | null;
  error: string | null;
}

export const collectionProgressByStatus: Record<ResearchStatus, number> = {
  DRAFT: 0,
  QUEUED: 0,
  COLLECTING: 10,
  NORMALIZING: 60,
  ANALYZING: 90,
  READY: 100,
  FAILED: 100,
};
