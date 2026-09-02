/**
 * Google Maps Scraper Provider for MarketLens.
 *
 * Uses Playwright to scrape Google Maps directly, providing rich business data
 * without requiring a paid API key. Adapted from gosom/google-maps-scraper approach.
 *
 * Data extracted: name, address, phone, website, rating, reviews, coordinates,
 * opening hours, category, and more (36+ fields).
 */

import "server-only";

import { ProviderError } from "../errors";
import { validateSearchResponse } from "../test-kit";
import type {
  PlaceProvider,
  PlaceSearchRequest,
  PlaceSearchResponse,
  ProviderCapabilities,
  ProviderHealth,
} from "../types";
import { mapGmapsEntry } from "./mapper";
import { ScraperEngine } from "./scraper";
import type { GoogleMapsScraperProviderOptions } from "./types";

export const googleMapsScraperCapabilities: ProviderCapabilities = {
  textSearch: true,
  nearbySearch: true,
  details: false,
  ratings: true,
  reviewCounts: true,
  phone: true,
  website: true,
  openingHours: true,
};

export class GoogleMapsScraperProvider implements PlaceProvider {
  readonly id = "google-maps-scraper";
  readonly name = "Google Maps (Scraper)";
  readonly capabilities = googleMapsScraperCapabilities;

  private readonly engine: ScraperEngine;
  private readonly now: () => Date;
  private readonly maxResults: number;

  constructor(options: GoogleMapsScraperProviderOptions = {}) {
    this.engine = new ScraperEngine({
      timeoutMilliseconds: options.timeoutMilliseconds,
      maxDepth: options.maxDepth,
      langCode: options.langCode,
      extractEmails: options.extractEmails,
      now: options.now,
      sleep: options.sleep,
      proxyUrl: options.proxyUrl,
      proxyList: options.proxyList,
      proxyRotation: options.proxyRotation,
      concurrency: options.concurrency,
      poolSize: options.poolSize,
      maxPagesPerBrowser: options.maxPagesPerBrowser,
    });
    this.now = options.now ?? (() => new Date());
    this.maxResults = 999_999; // No artificial limit — return all results within radius
  }

  async search(request: PlaceSearchRequest): Promise<PlaceSearchResponse> {
    if (request.pageToken) {
      throw new ProviderError({
        providerId: this.id,
        code: "INVALID_REQUEST",
        message: "Google Maps Scraper does not support page tokens.",
        retryable: false,
      });
    }

    if (!request.query.trim()) {
      throw new ProviderError({
        providerId: this.id,
        code: "INVALID_REQUEST",
        message: "A non-empty search query is required.",
        retryable: false,
      });
    }

    try {
      const result = await this.engine.search(request.query, {
        latitude: request.latitude,
        longitude: request.longitude,
        zoom: this.zoomFromRadius(request.radiusMeters),
        scrollDepth: request.scrollDepth,
      });

      const collectedAt = this.now();
      const places = result.entries
        .map((entry) => mapGmapsEntry(entry, collectedAt))
        .filter((place): place is NonNullable<typeof place> => place !== null)
        .filter((place) => {
          // Filter by radius — Google Maps may return places beyond the search area
          if (request.latitude && request.longitude && request.radiusMeters) {
            const dist = haversine(
              request.latitude,
              request.longitude,
              place.latitude,
              place.longitude,
            );
            return dist <= request.radiusMeters;
          }
          return true;
        }); // No slice — return ALL results within radius

      const response = { places };
      validateSearchResponse(this, request, response);
      return response;
    } catch (error) {
      if (error instanceof ProviderError) throw error;

      throw new ProviderError({
        providerId: this.id,
        code: "NETWORK",
        message:
          error instanceof Error
            ? `Google Maps scraping failed: ${error.message}`
            : "Google Maps scraping failed.",
        retryable: true,
        cause: error,
      });
    }
  }

  async healthCheck(): Promise<ProviderHealth> {
    try {
      // Quick check: can we reach Google Maps?
      const response = await fetch("https://www.google.com/maps", {
        method: "HEAD",
        signal: AbortSignal.timeout(10_000),
      });

      return {
        providerId: this.id,
        healthy: response.ok,
        checkedAt: this.now(),
        message: response.ok
          ? undefined
          : `Google Maps returned HTTP ${response.status}`,
      };
    } catch (error) {
      return {
        providerId: this.id,
        healthy: false,
        checkedAt: this.now(),
        message:
          error instanceof Error ? error.message : "Health check failed.",
      };
    }
  }

  private zoomFromRadius(radiusMeters: number): number {
    // Approximate zoom level from radius
    if (radiusMeters <= 500) return 17;
    if (radiusMeters <= 1000) return 16;
    if (radiusMeters <= 2000) return 15;
    if (radiusMeters <= 5000) return 14;
    if (radiusMeters <= 10000) return 13;
    if (radiusMeters <= 20000) return 12;
    return 11;
  }
}

/** Haversine distance in meters between two lat/lng points. */
function haversine(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
