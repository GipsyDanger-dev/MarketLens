import { ResearchCollectionError } from "../research/collection-error";
import { buildResearchReport } from "./report-builder";
import type { ResearchReport } from "./types";

export interface ResearchReportRepository {
  getResearchReportSource(
    projectId: string,
  ): Promise<Parameters<typeof buildResearchReport>[0]["project"] | null>;
  saveResearchReport(
    projectId: string,
    report: ResearchReport,
  ): Promise<{ id: string; generatedAt: Date }>;
}

export function createResearchReportService(
  repository: ResearchReportRepository,
) {
  return {
    async generate(projectId: string, generatedAt = new Date()) {
      const project = await repository.getResearchReportSource(projectId);
      if (!project)
        throw new ResearchCollectionError(
          "PROJECT_NOT_FOUND",
          "Research project was not found.",
        );
      const report = buildResearchReport({ project, generatedAt });
      const saved = await repository.saveResearchReport(projectId, report);
      return { ...saved, report };
    },
  };
}
