export interface DataQualityPlace {
  providerId: string;
  externalId: string;
  normalizedName: string | null;
  category: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website: string | null;
}

export interface DataQualityMetrics {
  totalPlaces: number;
  withNormalizedName: number;
  withCategory: number;
  withAddress: number;
  withCoordinates: number;
  withPhone: number;
  withWebsite: number;
  completeRecords: number;
  duplicatePrimaryIdentities: number;
  fieldCompletenessPercent: number;
  recordCompletenessPercent: number;
}

function percentage(value: number, total: number): number {
  return total === 0 ? 0 : Math.round((value / total) * 100);
}

function hasText(value: string | null): boolean {
  return Boolean(value?.trim());
}

function hasCoordinates(place: DataQualityPlace): boolean {
  return (
    Number.isFinite(place.latitude) &&
    Number.isFinite(place.longitude) &&
    place.latitude !== null &&
    place.longitude !== null &&
    place.latitude >= -90 &&
    place.latitude <= 90 &&
    place.longitude >= -180 &&
    place.longitude <= 180
  );
}

export function calculateDataQualityMetrics(
  places: readonly DataQualityPlace[],
): DataQualityMetrics {
  let withNormalizedName = 0;
  let withCategory = 0;
  let withAddress = 0;
  let withCoordinates = 0;
  let withPhone = 0;
  let withWebsite = 0;
  let completeRecords = 0;
  const primaryIdentities = new Set<string>();
  let duplicatePrimaryIdentities = 0;

  for (const place of places) {
    const namePresent = hasText(place.normalizedName);
    const categoryPresent = hasText(place.category);
    const addressPresent = hasText(place.address);
    const coordinatesPresent = hasCoordinates(place);
    const phonePresent = hasText(place.phone);
    const websitePresent = hasText(place.website);
    const identity = `${place.providerId}\u0000${place.externalId}`;

    withNormalizedName += Number(namePresent);
    withCategory += Number(categoryPresent);
    withAddress += Number(addressPresent);
    withCoordinates += Number(coordinatesPresent);
    withPhone += Number(phonePresent);
    withWebsite += Number(websitePresent);

    if (
      namePresent &&
      categoryPresent &&
      addressPresent &&
      coordinatesPresent
    ) {
      completeRecords += 1;
    }

    if (primaryIdentities.has(identity)) {
      duplicatePrimaryIdentities += 1;
    } else {
      primaryIdentities.add(identity);
    }
  }

  const populatedFields =
    withNormalizedName +
    withCategory +
    withAddress +
    withCoordinates +
    withPhone +
    withWebsite;

  return {
    totalPlaces: places.length,
    withNormalizedName,
    withCategory,
    withAddress,
    withCoordinates,
    withPhone,
    withWebsite,
    completeRecords,
    duplicatePrimaryIdentities,
    fieldCompletenessPercent: percentage(populatedFields, places.length * 6),
    recordCompletenessPercent: percentage(completeRecords, places.length),
  };
}
