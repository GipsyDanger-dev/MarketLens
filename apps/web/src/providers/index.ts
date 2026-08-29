import "server-only";

import { parseServerEnvironment } from "../lib/environment";
import { GooglePlacesProvider } from "./google/provider";
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
      fallbackEndpoints: configuration.OVERPASS_FALLBACK_URLS,
      requestTimeoutSeconds: configuration.OVERPASS_TIMEOUT_SECONDS,
      maxRetries: configuration.OVERPASS_MAX_RETRIES,
      retryDelayMilliseconds:
        configuration.OVERPASS_RETRY_DELAY_MILLISECONDS,
      maxResults: configuration.MAX_RESEARCH_RESULTS,
    }),
  );

  if (configuration.GOOGLE_MAPS_API_KEY) {
    registry.register(
      new GooglePlacesProvider({ apiKey: configuration.GOOGLE_MAPS_API_KEY }),
    );
  }

  return registry;
}
