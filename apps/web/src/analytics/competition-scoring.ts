import { haversineDistanceMeters, type GeographicPoint } from "./geospatial";

export interface ScoredPlace extends GeographicPoint {
  id: string;
  name: string;
  rating: number | null;
  reviewCount: number | null;
}

export interface CompetitionScore {
  placeId: string;
  overallScore: number;
  componentScores: Record<string, number>;
  explanation: string;
}

export interface CompetitionScoringOptions extends GeographicPoint {
  radiusMeters: number;
  nearbyRadiusMeters?: number;
}

const weights = {
  ratingStrength: 0.3,
  reviewAuthority: 0.3,
  localDensity: 0.2,
  proximity: 0.2,
};

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateCompetitorScores(
  places: readonly ScoredPlace[],
  options: CompetitionScoringOptions,
): CompetitionScore[] {
  const maximumReviews = Math.max(
    1,
    ...places.map((place) => place.reviewCount ?? 0),
  );
  const nearbyRadiusMeters = options.nearbyRadiusMeters ?? 500;

  return places
    .map((place) => {
      const components: Record<string, number> = {};
      const availableWeights: number[] = [];
      let weightedScore = 0;

      if (place.rating !== null) {
        components.ratingStrength = round(place.rating / 5);
        availableWeights.push(weights.ratingStrength);
        weightedScore += components.ratingStrength * weights.ratingStrength;
      }
      if (place.reviewCount !== null) {
        components.reviewAuthority = round(
          Math.log10(place.reviewCount + 1) / Math.log10(maximumReviews + 1),
        );
        availableWeights.push(weights.reviewAuthority);
        weightedScore += components.reviewAuthority * weights.reviewAuthority;
      }
      if (places.length > 1) {
        const nearbyCount = places.filter(
          (candidate) =>
            candidate.id !== place.id &&
            haversineDistanceMeters(place, candidate) <= nearbyRadiusMeters,
        ).length;
        components.localDensity = round(nearbyCount / (places.length - 1));
        availableWeights.push(weights.localDensity);
        weightedScore += components.localDensity * weights.localDensity;
      }
      if (options.radiusMeters > 0) {
        components.proximity = round(
          Math.max(
            0,
            1 - haversineDistanceMeters(place, options) / options.radiusMeters,
          ),
        );
        availableWeights.push(weights.proximity);
        weightedScore += components.proximity * weights.proximity;
      }

      const weightTotal = availableWeights.reduce(
        (sum, weight) => sum + weight,
        0,
      );
      const missing = Object.keys(weights).filter(
        (key) => !(key in components),
      );
      const overallScore =
        weightTotal === 0 ? 0 : round(weightedScore / weightTotal);

      return {
        placeId: place.id,
        overallScore,
        componentScores: components,
        explanation:
          missing.length === 0
            ? "Score uses rating, review authority, local density, and proximity."
            : `Score reweights available dimensions; unavailable: ${missing.join(", ")}.`,
      };
    })
    .sort((left, right) => right.overallScore - left.overallScore);
}
