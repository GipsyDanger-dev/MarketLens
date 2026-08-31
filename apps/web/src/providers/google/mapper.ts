import type { PlaceCandidate } from "../types";
import type { GooglePlace } from "./types";

export function mapGooglePlace(
  place: GooglePlace,
  collectedAt: Date,
): PlaceCandidate | null {
  const name = place.displayName?.text?.trim();
  const latitude = place.location?.latitude;
  const longitude = place.location?.longitude;
  if (
    !place.id ||
    !name ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  return {
    providerId: "google-places",
    externalId: place.id,
    name,
    category: place.types?.[0] ?? null,
    providerTypes: place.types ?? [],
    address: place.formattedAddress ?? null,
    city: null,
    district: null,
    country: null,
    latitude: latitude as number,
    longitude: longitude as number,
    rating: validRating(place.rating),
    reviewCount: validReviewCount(place.userRatingCount),
    phone: place.nationalPhoneNumber ?? null,
    website: place.websiteUri ?? null,
    socialLinks: {},
    sourceUrl: place.googleMapsUri ?? null,
    businessStatus: place.businessStatus ?? null,
    collectedAt,
    rawData: place,
  };
}

function validRating(value: unknown): number | null {
  return typeof value === "number" && value >= 0 && value <= 5 ? value : null;
}

function validReviewCount(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : null;
}
