import type { PlaceCandidate } from "../providers/types";

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
  phone: string | null;
  website: string | null;
  sourceUrl: string | null;
  businessStatus: string | null;
  collectedAt: Date;
  rawData: unknown;
}

export function candidateToPersistablePlace(
  candidate: PlaceCandidate,
): PersistablePlaceCandidate | null {
  const name = candidate.name?.trim();

  if (!name) {
    return null;
  }

  return {
    ...candidate,
    name,
    normalizedName: name.normalize("NFKC").toLocaleLowerCase(),
  };
}
