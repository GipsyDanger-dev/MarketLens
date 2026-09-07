import "server-only";

import type { ResearchProject as PrismaResearchProject } from "../../../../generated/prisma/client";
import {
  researchProjectInputSchema,
  boundedResearchResults,
  type ResearchProjectInput,
} from "../core/research-project";
import { prisma } from "./prisma";
import { parseServerEnvironment } from "./environment";

export type ResearchProject = PrismaResearchProject;

export async function createResearchProject(
  input: ResearchProjectInput,
  userId?: string,
): Promise<ResearchProject> {
  const project = researchProjectInputSchema.parse(input);
  project.maxResults = boundedResearchResults(
    project.maxResults,
    parseServerEnvironment(process.env).MAX_RESEARCH_RESULTS,
  );

  return prisma.researchProject.create({
    data: {
      ...project,
      userId,
    },
  });
}

export async function getResearchProject(
  id: string,
): Promise<ResearchProject | null> {
  return prisma.researchProject.findUnique({ where: { id } });
}

export async function deleteResearchProject(
  id: string,
): Promise<ResearchProject> {
  return prisma.researchProject.delete({ where: { id } });
}
