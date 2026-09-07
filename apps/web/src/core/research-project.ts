import { z } from "zod";

import { researchStatuses } from "./research-status";

const optionalText = z.string().trim().min(1).max(200).nullable().optional();

export const defaultResearchResultLimit = 250;
export const maximumResearchResultLimit = 1_000;

/** Clamp legacy projects and provider requests to the operator's budget. */
export function boundedResearchResults(
  requested: number,
  configured = defaultResearchResultLimit,
): number {
  if (
    !Number.isInteger(requested) ||
    requested < 1 ||
    !Number.isInteger(configured) ||
    configured < 1
  ) {
    throw new Error("Research result limits must be positive integers.");
  }
  return Math.min(requested, configured, maximumResearchResultLimit);
}

export const researchProjectInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  providerId: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:[a-z0-9-]*[a-z0-9]+)?$/i)
    .max(80),
  query: z.string().trim().min(1).max(500),
  category: optionalText,
  locationQuery: z.string().trim().min(1).max(500),
  latitude: z.number().finite().gte(-90).lte(90),
  longitude: z.number().finite().gte(-180).lte(180),
  radiusMeters: z.number().int().positive().max(100_000),
  maxResults: z
    .number()
    .int()
    .positive()
    .max(maximumResearchResultLimit)
    .default(defaultResearchResultLimit),
  scrollDepth: z.number().int().min(1).max(200).default(10),
  status: z.enum(researchStatuses).default("DRAFT"),
});

export type ResearchProjectInput = z.infer<typeof researchProjectInputSchema>;
