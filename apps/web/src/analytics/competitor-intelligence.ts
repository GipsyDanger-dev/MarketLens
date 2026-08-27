import { haversineDistanceMeters } from "./geospatial";

export interface CompetitorPlace {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  componentScores: Record<string, number>;
}

export function nearbyCompetitors(
  subject: CompetitorPlace,
  places: readonly CompetitorPlace[],
  radiusMeters: number,
) {
  return places
    .filter((place) => place.id !== subject.id)
    .map((place) => ({
      place,
      distanceMeters: Math.round(haversineDistanceMeters(subject, place)),
    }))
    .filter(({ distanceMeters }) => distanceMeters <= radiusMeters)
    .sort((left, right) => left.distanceMeters - right.distanceMeters);
}

export function scoreNarrative(componentScores: Record<string, number>) {
  const entries = Object.entries(componentScores).sort(
    ([, left], [, right]) => right - left,
  );
  return {
    strengths: entries.filter(([, score]) => score >= 0.67).map(([key]) => key),
    weaknesses: entries.filter(([, score]) => score < 0.34).map(([key]) => key),
  };
}
