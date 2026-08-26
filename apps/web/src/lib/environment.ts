import { z } from "zod";

const booleanFromEnvironment = z.enum(["true", "false"]).transform((value) => value === "true");

export const serverEnvironmentSchema = z.object({
  DATABASE_URL: z.url(),
  DEFAULT_PLACE_PROVIDER: z.string().min(1).default("openstreetmap"),
  ENABLE_AI: booleanFromEnvironment.default("false"),
  ENABLE_AUTH: booleanFromEnvironment.default("false"),
  MAX_RESEARCH_RESULTS: z.coerce.number().int().positive().max(1_000).default(250),
});

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

export function parseServerEnvironment(environment: Record<string, string | undefined>): ServerEnvironment {
  return serverEnvironmentSchema.parse(environment);
}
