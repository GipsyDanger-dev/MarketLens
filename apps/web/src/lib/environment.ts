import { z } from "zod";

const booleanFromEnvironment = z
  .enum(["true", "false"])
  .transform((value) => value === "true")
  .default(false);

export const serverEnvironmentSchema = z.object({
  DATABASE_URL: z.url(),
  DEFAULT_PLACE_PROVIDER: z.string().min(1).default("openstreetmap"),
  GOOGLE_MAPS_API_KEY: z.string().min(1).optional(),
  ENABLE_AI: booleanFromEnvironment,
  DEFAULT_AI_PROVIDER: z.literal("gemini").default("gemini"),
  GEMINI_API_KEY: z.string().min(1).optional(),
  AI_TIMEOUT_MILLISECONDS: z.coerce
    .number()
    .int()
    .positive()
    .max(60_000)
    .default(20_000),
  AI_MAX_RETRIES: z.coerce.number().int().min(0).max(3).default(1),
  ENABLE_AUTH: booleanFromEnvironment,
  OVERPASS_API_URL: z.url().default("https://overpass-api.de/api/interpreter"),
  OVERPASS_TIMEOUT_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .max(60)
    .default(25),
  MAX_RESEARCH_RESULTS: z.coerce
    .number()
    .int()
    .positive()
    .max(1_000)
    .default(250),
});

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

export function parseServerEnvironment(
  environment: Record<string, string | undefined>,
): ServerEnvironment {
  return serverEnvironmentSchema.parse(environment);
}
