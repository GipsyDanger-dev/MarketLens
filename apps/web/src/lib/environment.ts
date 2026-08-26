import { z } from "zod";

const booleanFromEnvironment = z
  .enum(["true", "false"])
  .transform((value) => value === "true")
  .default(false);

export const serverEnvironmentSchema = z.object({
  DATABASE_URL: z.url(),
  DEFAULT_PLACE_PROVIDER: z.string().min(1).default("openstreetmap"),
  ENABLE_AI: booleanFromEnvironment,
  ENABLE_AUTH: booleanFromEnvironment,
  MAX_RESEARCH_RESULTS: z.coerce.number().int().positive().max(1_000).default(250),
});

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

export function parseServerEnvironment(environment: Record<string, string | undefined>): ServerEnvironment {
  return serverEnvironmentSchema.parse(environment);
}
