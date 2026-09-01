import { z } from "zod";

import { researchStatuses } from "./research-status";

const optionalText = z.string().trim().min(1).max(200).nullable().optional();

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
  maxResults: z.number().int().positive().max(1_000).default(250),
  scrollDepth: z.number().int().min(1).max(50).default(10),
  status: z.enum(researchStatuses).default("DRAFT"),
});

export type ResearchProjectInput = z.infer<typeof researchProjectInputSchema>;
