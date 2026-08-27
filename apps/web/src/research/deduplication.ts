export const PROBABLE_DUPLICATE_MINIMUM_CONFIDENCE = 0.75;

export interface PlaceIdentity {
  providerId: string;
  externalId: string;
}

export interface DuplicateComparablePlace extends PlaceIdentity {
  id: string;
  normalizedName: string;
  category: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
}

export interface DuplicateConfidence {
  score: number;
  nameSimilarity: number;
  distanceMeters: number | null;
  reasons: string[];
}

export interface ProbableDuplicate {
  place: DuplicateComparablePlace;
  confidence: DuplicateConfidence;
}

export function primaryPlaceIdentity({
  providerId,
  externalId,
}: PlaceIdentity): string {
  return `${providerId}\u0000${externalId}`;
}

export function isPrimaryDuplicate(
  left: PlaceIdentity,
  right: PlaceIdentity,
): boolean {
  return primaryPlaceIdentity(left) === primaryPlaceIdentity(right);
}

function tokenSimilarity(left: string, right: string): number {
  const leftTokens = new Set(left.split(" ").filter(Boolean));
  const rightTokens = new Set(right.split(" ").filter(Boolean));

  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  let intersection = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      intersection += 1;
    }
  }

  return intersection / (leftTokens.size + rightTokens.size - intersection);
}

function distanceInMeters(
  left: DuplicateComparablePlace,
  right: DuplicateComparablePlace,
): number | null {
  if (
    !Number.isFinite(left.latitude) ||
    !Number.isFinite(left.longitude) ||
    !Number.isFinite(right.latitude) ||
    !Number.isFinite(right.longitude)
  ) {
    return null;
  }

  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(right.latitude - left.latitude);
  const longitudeDelta = toRadians(right.longitude - left.longitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(left.latitude)) *
      Math.cos(toRadians(right.latitude)) *
      Math.sin(longitudeDelta / 2) ** 2;

  return (
    6_371_000 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

export function calculateDuplicateConfidence(
  left: DuplicateComparablePlace,
  right: DuplicateComparablePlace,
): DuplicateConfidence {
  const nameSimilarity = tokenSimilarity(
    left.normalizedName,
    right.normalizedName,
  );
  const distanceMeters = distanceInMeters(left, right);
  const reasons: string[] = [];
  let score = nameSimilarity * 0.55;

  if (left.normalizedName === right.normalizedName) {
    reasons.push("exact-normalized-name");
  } else if (nameSimilarity >= 0.5) {
    reasons.push("similar-normalized-name");
  }

  if (distanceMeters !== null && distanceMeters <= 25) {
    score += 0.25;
    reasons.push("within-25m");
  } else if (distanceMeters !== null && distanceMeters <= 100) {
    score += 0.2;
    reasons.push("within-100m");
  } else if (distanceMeters !== null && distanceMeters <= 250) {
    score += 0.1;
    reasons.push("within-250m");
  }

  if (left.category && left.category === right.category) {
    score += 0.15;
    reasons.push("same-category");
  }

  if (left.address && left.address === right.address) {
    score += 0.1;
    reasons.push("same-address");
  }

  return {
    score: Math.min(1, Math.round(score * 100) / 100),
    nameSimilarity: Math.round(nameSimilarity * 100) / 100,
    distanceMeters:
      distanceMeters === null ? null : Math.round(distanceMeters * 10) / 10,
    reasons,
  };
}

export function findProbableCrossProviderDuplicates(
  subject: DuplicateComparablePlace,
  candidates: readonly DuplicateComparablePlace[],
): ProbableDuplicate[] {
  return candidates
    .filter((candidate) => candidate.providerId !== subject.providerId)
    .filter((candidate) => !isPrimaryDuplicate(subject, candidate))
    .map((place) => ({
      place,
      confidence: calculateDuplicateConfidence(subject, place),
    }))
    .filter(
      ({ confidence }) =>
        confidence.score >= PROBABLE_DUPLICATE_MINIMUM_CONFIDENCE,
    )
    .sort((left, right) => right.confidence.score - left.confidence.score);
}
