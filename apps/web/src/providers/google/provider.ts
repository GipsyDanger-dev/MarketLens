import "server-only";

import { ProviderError } from "../errors";
import { validateSearchResponse } from "../test-kit";
import type {
  PlaceProvider,
  PlaceSearchRequest,
  PlaceSearchResponse,
  ProviderCapabilities,
} from "../types";
import { mapGooglePlace } from "./mapper";
import type {
  GooglePlacesProviderOptions,
  GoogleTextSearchResponse,
} from "./types";

const endpoint = "https://places.googleapis.com/v1/places:searchText";
const fieldMask =
  "places.id,places.displayName,places.formattedAddress,places.location,places.types,places.rating,places.userRatingCount,places.nationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.businessStatus,nextPageToken";

export const googlePlacesCapabilities: ProviderCapabilities = {
  textSearch: true,
  nearbySearch: true,
  details: false,
  ratings: true,
  reviewCounts: true,
  phone: true,
  website: true,
  openingHours: false,
};

export class GooglePlacesProvider implements PlaceProvider {
  readonly id = "google-places";
  readonly name = "Google Places API (New)";
  readonly capabilities = googlePlacesCapabilities;
  private readonly apiKey: string;
  private readonly fetchImplementation: typeof fetch;
  private readonly now: () => Date;
  private readonly endpoint: string;

  constructor(options: GooglePlacesProviderOptions) {
    if (!options.apiKey.trim())
      throw new ProviderError({
        providerId: "google-places",
        code: "CONFIGURATION",
        message: "GOOGLE_MAPS_API_KEY is required for Google Places.",
        retryable: false,
      });
    this.apiKey = options.apiKey;
    this.fetchImplementation = options.fetch ?? fetch;
    this.now = options.now ?? (() => new Date());
    this.endpoint = options.endpoint ?? endpoint;
  }

  async search(request: PlaceSearchRequest): Promise<PlaceSearchResponse> {
    try {
      const response = await this.fetchImplementation(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": this.apiKey,
          "X-Goog-FieldMask": fieldMask,
        },
        body: JSON.stringify(
          request.pageToken
            ? { pageToken: request.pageToken }
            : {
                textQuery: request.query,
                pageSize: Math.min(request.maxResults, 20),
                locationBias: {
                  circle: {
                    center: {
                      latitude: request.latitude,
                      longitude: request.longitude,
                    },
                    radius: request.radiusMeters,
                  },
                },
              },
        ),
      });
      if (!response.ok) throw responseError(response.status);
      const payload = (await response.json()) as GoogleTextSearchResponse;
      const places = (payload.places ?? [])
        .map((place) => mapGooglePlace(place, this.now()))
        .filter((place): place is NonNullable<typeof place> => place !== null)
        .slice(0, request.maxResults);
      const result = { places, nextPageToken: payload.nextPageToken };
      validateSearchResponse(this, request, result);
      return result;
    } catch (error) {
      if (error instanceof ProviderError) throw error;
      throw new ProviderError({
        providerId: this.id,
        code: "NETWORK",
        message: "Unable to reach Google Places.",
        retryable: true,
        cause: error,
      });
    }
  }
}

function responseError(status: number): ProviderError {
  return new ProviderError({
    providerId: "google-places",
    code:
      status === 429
        ? "RATE_LIMITED"
        : status >= 500
          ? "UNAVAILABLE"
          : "INVALID_REQUEST",
    message: `Google Places returned HTTP ${status}.`,
    retryable: status === 429 || status >= 500,
    status,
  });
}
