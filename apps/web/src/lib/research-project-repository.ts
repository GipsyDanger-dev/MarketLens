import "server-only";

import type { ResearchProject as PrismaResearchProject } from "../../../../generated/prisma/client";
import {
  researchProjectInputSchema,
  type ResearchProjectInput,
} from "../core/research-project";
import { prisma } from "./prisma";

export type ResearchProject = PrismaResearchProject;

export async function createResearchProject(
  input: ResearchProjectInput,
  userId?: string,
): Promise<ResearchProject> {
  const project = researchProjectInputSchema.parse(input);

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
