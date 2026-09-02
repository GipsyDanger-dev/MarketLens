import type { PlaceCandidate } from "../providers/types";
import {
  normalizeAddress,
  normalizeBusinessName,
  normalizeCategory,
  normalizeCoordinates,
} from "./normalization";
import { sanitizeExternalLinks, toSafeExternalUrl } from "../lib/external-url";

export interface PersistablePlaceCandidate {
  providerId: string;
  externalId: string;
  name: string;
  normalizedName: string;
  category: string | null;
  providerTypes: string[];
  address: string | null;
  city: string | null;
  district: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
  rating?: number | null;
  reviewCount?: number | null;
  phone: string | null;
  website: string | null;
  emails?: string[];
  socialLinks: Record<string, string>;
  sourceUrl: string | null;
  businessStatus: string | null;
  collectedAt: Date;
  rawData: unknown;
}

export function candidateToPersistablePlace(
  candidate: PlaceCandidate,
): PersistablePlaceCandidate | null {
  const name = candidate.name?.trim();
  const normalizedName = normalizeBusinessName(name);
  const coordinates = normalizeCoordinates(
    candidate.latitude,
    candidate.longitude,
  );

  if (!name || !normalizedName || !coordinates) {
    return null;
  }

  return {
    ...candidate,
    name,
    normalizedName,
    category: normalizeCategory(candidate.category, candidate.providerTypes),
    address: normalizeAddress(candidate.address),
    website: toSafeExternalUrl(candidate.website),
    sourceUrl: toSafeExternalUrl(candidate.sourceUrl),
    socialLinks: sanitizeExternalLinks(candidate.socialLinks),
    ...coordinates,
  };
}
