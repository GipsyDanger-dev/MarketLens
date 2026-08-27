export interface GeographicPoint {
  latitude: number;
  longitude: number;
}

export function haversineDistanceMeters(
  left: GeographicPoint,
  right: GeographicPoint,
): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(right.latitude - left.latitude);
  const longitudeDelta = toRadians(right.longitude - left.longitude);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(left.latitude)) *
      Math.cos(toRadians(right.latitude)) *
      Math.sin(longitudeDelta / 2) ** 2;

  return 6_371_000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calculateDensityScore(
  businessCount: number,
  radiusMeters: number,
): number | null {
  if (!Number.isFinite(radiusMeters) || radiusMeters <= 0) return null;
  const areaSquareKilometers = Math.PI * (radiusMeters / 1_000) ** 2;
  return Math.round((businessCount / areaSquareKilometers) * 100) / 100;
}
