import "server-only";

import { parseServerEnvironment } from "../lib/environment";
import { OpenStreetMapProvider } from "./openstreetmap/provider";
import { ProviderRegistry } from "./registry";

export function createProviderRegistry(
  environment: Record<string, string | undefined> = process.env,
): ProviderRegistry {
  const configuration = parseServerEnvironment(environment);
  const registry = new ProviderRegistry();

  registry.register(
    new OpenStreetMapProvider({
      endpoint: configuration.OVERPASS_API_URL,
      requestTimeoutSeconds: configuration.OVERPASS_TIMEOUT_SECONDS,
      maxResults: configuration.MAX_RESEARCH_RESULTS,
    }),
  );

  return registry;
}
