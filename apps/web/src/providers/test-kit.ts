import { ProviderError } from "./errors";
import type {
  PlaceProvider,
  PlaceSearchRequest,
  PlaceSearchResponse,
} from "./types";

const capabilityKeys = [
  "textSearch",
  "nearbySearch",
  "details",
  "ratings",
  "reviewCounts",
  "phone",
  "website",
  "openingHours",
] as const;

export function validateProviderContract(provider: PlaceProvider): void {
  if (!provider.id.trim() || !provider.name.trim()) {
    throw invalidResponse(
      provider.id,
      "Provider id and name must be non-empty.",
    );
  }

  for (const capability of capabilityKeys) {
    if (typeof provider.capabilities[capability] !== "boolean") {
      throw invalidResponse(
        provider.id,
        `Provider capability ${capability} must be a boolean.`,
      );
    }
  }
}

export function validateSearchResponse(
  provider: PlaceProvider,
  request: PlaceSearchRequest,
  response: PlaceSearchResponse,
): void {
  validateProviderContract(provider);

  if (response.places.length > request.maxResults) {
    throw invalidResponse(
      provider.id,
      "Provider returned more places than requested.",
    );
  }

  for (const place of response.places) {
    if (place.providerId !== provider.id || !place.externalId.trim()) {
      throw invalidResponse(
        provider.id,
        "Every candidate must include this provider id and a stable external id.",
      );
    }

    if (
      !Number.isFinite(place.latitude) ||
      !Number.isFinite(place.longitude) ||
      place.latitude < -90 ||
      place.latitude > 90 ||
      place.longitude < -180 ||
      place.longitude > 180
    ) {
      throw invalidResponse(provider.id, "Candidate coordinates are invalid.");
    }
  }
}

export async function runProviderSearchContract(
  provider: PlaceProvider,
  request: PlaceSearchRequest,
): Promise<PlaceSearchResponse> {
  const response = await provider.search(request);
  validateSearchResponse(provider, request, response);

  return response;
}

function invalidResponse(providerId: string, message: string): ProviderError {
  return new ProviderError({
    providerId,
    code: "INVALID_RESPONSE",
    message,
    retryable: false,
  });
}
