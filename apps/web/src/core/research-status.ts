export const researchStatuses = [
  "DRAFT",
  "QUEUED",
  "COLLECTING",
  "NORMALIZING",
  "ANALYZING",
  "READY",
  "FAILED",
] as const;

export type ResearchStatus = (typeof researchStatuses)[number];

const transitionTargets: Record<ResearchStatus, readonly ResearchStatus[]> = {
  DRAFT: ["QUEUED", "FAILED"],
  QUEUED: ["COLLECTING", "FAILED"],
  COLLECTING: ["NORMALIZING", "FAILED"],
  NORMALIZING: ["ANALYZING", "FAILED"],
  ANALYZING: ["READY", "FAILED"],
  READY: ["FAILED"],
  FAILED: ["QUEUED"],
};

export function canTransitionResearch(
  from: ResearchStatus,
  to: ResearchStatus,
): boolean {
  return transitionTargets[from].includes(to);
}

export function assertResearchTransition(
  from: ResearchStatus,
  to: ResearchStatus,
): void {
  if (!canTransitionResearch(from, to)) {
    throw new Error(`Research cannot transition from ${from} to ${to}.`);
  }
}
