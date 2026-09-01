import "server-only";

import { parseServerEnvironment } from "../lib/environment";
import { GooglePlacesProvider } from "./google/provider";
import { GoogleMapsScraperProvider } from "./google-maps-scraper/provider";
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
      retryDelayMilliseconds: configuration.OVERPASS_RETRY_DELAY_MILLISECONDS,
      maxResults: configuration.MAX_RESEARCH_RESULTS,
    }),
  );

  // Google Maps Scraper is always available (no API key required)
  registry.register(
    new GoogleMapsScraperProvider({
      proxyUrl: configuration.SCRAPER_PROXY_URL,
      proxyList: configuration.SCRAPER_PROXY_LIST,
      proxyRotation: configuration.SCRAPER_PROXY_ROTATION,
      timeoutMilliseconds: configuration.SCRAPER_TIMEOUT_MILLISECONDS,
      maxDepth: configuration.SCRAPER_MAX_DEPTH,
      langCode: configuration.SCRAPER_LANG_CODE,
      extractEmails: configuration.SCRAPER_EXTRACT_EMAILS,
      extractExtraReviews: configuration.SCRAPER_EXTRACT_EXTRA_REVIEWS,
      concurrency: configuration.SCRAPER_CONCURRENCY,
      poolSize: configuration.SCRAPER_POOL_SIZE,
      maxPagesPerBrowser: configuration.SCRAPER_MAX_PAGES_PER_BROWSER,
    }),
  );

  if (configuration.GOOGLE_MAPS_API_KEY) {
    registry.register(
      new GooglePlacesProvider({ apiKey: configuration.GOOGLE_MAPS_API_KEY }),
    );
  }

  return registry;
}
