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
import { mapOverpassElement } from "./mapper";
import {
  buildOverpassQuery,
  defaultOverpassResultLimit,
  defaultOverpassTimeoutSeconds,
} from "./query";
import type { OpenStreetMapProviderOptions, OverpassResponse } from "./types";

const defaultEndpoint = "https://overpass-api.de/api/interpreter";

export const openStreetMapCapabilities: ProviderCapabilities = {
  textSearch: true,
  nearbySearch: true,
  details: false,
  ratings: false,
  reviewCounts: false,
  phone: true,
  website: true,
  openingHours: false,
};

export class OpenStreetMapProvider implements PlaceProvider {
  readonly id = "openstreetmap";
  readonly name = "OpenStreetMap / Overpass";
  readonly capabilities = openStreetMapCapabilities;

  private readonly endpoints: string[];
  private readonly fetchImplementation: typeof globalThis.fetch;
  private readonly now: () => Date;
  private readonly maxRetries: number;
  private readonly requestTimeoutSeconds: number;
  private readonly retryDelayMilliseconds: number;
  private readonly sleep: (milliseconds: number) => Promise<void>;
  private readonly maxResults: number;

  constructor(options: OpenStreetMapProviderOptions = {}) {
    this.endpoints = uniqueEndpoints([
      options.endpoint ?? defaultEndpoint,
      ...(options.fallbackEndpoints ?? []),
    ]);
    this.fetchImplementation = options.fetch ?? globalThis.fetch;
    this.now = options.now ?? (() => new Date());
    this.maxRetries = options.maxRetries ?? 1;
    this.requestTimeoutSeconds =
      options.requestTimeoutSeconds ?? defaultOverpassTimeoutSeconds;
    this.retryDelayMilliseconds = options.retryDelayMilliseconds ?? 750;
    this.sleep = options.sleep ?? defaultSleep;
    this.maxResults = options.maxResults ?? defaultOverpassResultLimit;
  }

  async search(request: PlaceSearchRequest): Promise<PlaceSearchResponse> {
    const query = buildOverpassQuery(request, {
      maxResults: this.maxResults,
      timeoutSeconds: this.requestTimeoutSeconds,
    });
    const payload = await this.requestOverpass(query);
    const collectedAt = this.now();
    const places = payload.elements
      .map((element) => mapOverpassElement(element, collectedAt))
      .filter((place): place is NonNullable<typeof place> => place !== null); // No slice — return all results within radius
    const response = { places };

    validateSearchResponse(this, request, response);

    return response;
  }

  async healthCheck(): Promise<ProviderHealth> {
    try {
      await this.requestOverpass("[out:json][timeout:5];node(0,0);out 1;");

      return {
        providerId: this.id,
        healthy: true,
        checkedAt: this.now(),
      };
    } catch (error) {
      return {
        providerId: this.id,
        healthy: false,
        checkedAt: this.now(),
        message:
          error instanceof Error
            ? error.message
            : "Provider health check failed.",
      };
    }
  }

  private async requestOverpass(query: string): Promise<OverpassResponse> {
    const attemptsPerEndpoint = this.maxRetries + 1;
    const timeoutMilliseconds = Math.max(
      1_000,
      Math.floor(
        (this.requestTimeoutSeconds * 1_000) /
          (this.endpoints.length * attemptsPerEndpoint),
      ),
    );
    let lastRetryableError: ProviderError | null = null;

    for (const endpoint of this.endpoints) {
      for (let attempt = 0; attempt < attemptsPerEndpoint; attempt += 1) {
        try {
          return await this.requestEndpoint({
            endpoint,
            query,
            timeoutMilliseconds,
          });
        } catch (error) {
          if (!(error instanceof ProviderError) || !error.retryable) {
            throw error;
          }

          lastRetryableError = error;
          if (attempt < attemptsPerEndpoint - 1) {
            await this.sleep(this.retryDelayMilliseconds * 2 ** attempt);
          }
        }
      }
    }

    throw (
      lastRetryableError ??
      new ProviderError({
        providerId: this.id,
        code: "NETWORK",
        message: "Unable to reach an Overpass endpoint.",
        retryable: true,
      })
    );
  }

  private async requestEndpoint({
    endpoint,
    query,
    timeoutMilliseconds,
  }: {
    endpoint: string;
    query: string;
    timeoutMilliseconds: number;
  }): Promise<OverpassResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMilliseconds);

    try {
      const response = await this.fetchImplementation(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          "User-Agent": "MarketLens/0.2.0 (self-hosted place intelligence)",
        },
        body: new URLSearchParams({ data: query }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw responseError(response.status);
      }

      const payload: unknown = await response.json();

      if (!isOverpassResponse(payload)) {
        throw new ProviderError({
          providerId: this.id,
          code: "INVALID_RESPONSE",
          message: "Overpass returned an invalid JSON response.",
          retryable: false,
        });
      }

      return payload;
    } catch (error) {
      if (error instanceof ProviderError) {
        throw error;
      }

      throw new ProviderError({
        providerId: this.id,
        code: "NETWORK",
        message:
          error instanceof Error && error.name === "AbortError"
            ? "Overpass request timed out."
            : "Unable to reach Overpass.",
        retryable: true,
        cause: error,
      });
    } finally {
      clearTimeout(timeout);
    }
  }
}

function uniqueEndpoints(endpoints: string[]): string[] {
  return [...new Set(endpoints.map(validateEndpoint))];
}

function defaultSleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function validateEndpoint(endpoint: string): string {
  try {
    const url = new URL(endpoint);

    if (!url.hostname || !["http:", "https:"].includes(url.protocol)) {
      throw new Error("Unsupported protocol");
    }

    return url.toString();
  } catch {
    throw new ProviderError({
      providerId: "openstreetmap",
      code: "CONFIGURATION",
      message: "Overpass endpoint must be an absolute HTTP(S) URL.",
      retryable: false,
    });
  }
}

function responseError(status: number): ProviderError {
  if (status === 429) {
    return new ProviderError({
      providerId: "openstreetmap",
      code: "RATE_LIMITED",
      message: "Overpass rate limit reached.",
      retryable: true,
      status,
    });
  }

  return new ProviderError({
    providerId: "openstreetmap",
    code: status >= 500 ? "UNAVAILABLE" : "INVALID_REQUEST",
    message: `Overpass returned HTTP ${status}.`,
    retryable: status >= 500,
    status,
  });
}

function isOverpassResponse(value: unknown): value is OverpassResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "elements" in value &&
    Array.isArray(value.elements)
  );
}
