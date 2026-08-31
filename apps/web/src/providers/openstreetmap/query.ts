import { ProviderError } from "../errors";
import type { PlaceSearchRequest } from "../types";

export const defaultOverpassResultLimit = 250;
export const defaultOverpassTimeoutSeconds = 25;

export function buildOverpassQuery(
  request: PlaceSearchRequest,
  options: {
    maxResults?: number;
    timeoutSeconds?: number;
  } = {},
): string {
  validateSearchRequest(request);

  const maxResults = Math.min(
    request.maxResults,
    options.maxResults ?? defaultOverpassResultLimit,
  );
  const timeoutSeconds =
    options.timeoutSeconds ?? defaultOverpassTimeoutSeconds;
  const categoryFilter = buildCategoryFilter(request.category);

  return [
    `[out:json][timeout:${timeoutSeconds}];`,
    "(",
    `  ${buildOverpassSelector(request.query, categoryFilter)}(around:${request.radiusMeters},${request.latitude},${request.longitude});`,
    ");",
    `out center ${maxResults};`,
  ].join("\n");
}

function buildOverpassSelector(query: string, categoryFilter: string): string {
  if (categoryFilter) return `nwr${categoryFilter}`;

  return `nwr["name"~"${escapeOverpassRegex(query)}",i]`;
}

const categoryKeys: Record<string, string> = {
  bar: "amenity",
  cafe: "amenity",
  clinic: "amenity",
  hospital: "amenity",
  pharmacy: "amenity",
  restaurant: "amenity",
  supermarket: "shop",
};

function buildCategoryFilter(category: string | undefined): string {
  if (!category) return "";

  const normalizedCategory = category.trim().toLowerCase();
  const key = categoryKeys[normalizedCategory];
  if (key) {
    return `["${key}"="${escapeOverpassString(normalizedCategory)}"]`;
  }

  return `[~"^(amenity|shop|tourism|leisure|office|craft)$"~"${escapeOverpassRegex(
    category,
  )}",i]`;
}

function validateSearchRequest(request: PlaceSearchRequest): void {
  if (request.pageToken) {
    throw invalidRequest(
      "OpenStreetMap/Overpass does not support page tokens.",
    );
  }

  if (!request.query.trim()) {
    throw invalidRequest("A non-empty search query is required.");
  }

  if (
    !Number.isFinite(request.latitude) ||
    !Number.isFinite(request.longitude) ||
    request.latitude < -90 ||
    request.latitude > 90 ||
    request.longitude < -180 ||
    request.longitude > 180
  ) {
    throw invalidRequest("Search coordinates are invalid.");
  }

  if (!Number.isInteger(request.radiusMeters) || request.radiusMeters < 1) {
    throw invalidRequest("Search radius must be a positive integer in meters.");
  }

  if (!Number.isInteger(request.maxResults) || request.maxResults < 1) {
    throw invalidRequest("maxResults must be a positive integer.");
  }
}

function escapeOverpassRegex(value: string): string {
  return value
    .trim()
    .replace(/[\\^$.*+?()[\]{}|]/g, "\\$&")
    .replaceAll('"', '\\"');
}

function escapeOverpassString(value: string): string {
  return value.trim().replace(/[\\"]/g, "\\$&");
}

function invalidRequest(message: string): ProviderError {
  return new ProviderError({
    providerId: "openstreetmap",
    code: "INVALID_REQUEST",
    message,
    retryable: false,
  });
}
