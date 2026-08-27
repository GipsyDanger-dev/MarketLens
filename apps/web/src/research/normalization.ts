const whitespace = /\s+/g;
const nonComparableCharacters = /[^\p{L}\p{N}]+/gu;
const combiningMarks = /\p{M}/gu;

const categoryAliases: Record<string, string> = {
  "coffee shop": "cafe",
  coffeehouse: "cafe",
  cafe: "cafe",
  restaurants: "restaurant",
  restaurant: "restaurant",
  "fast food": "fast_food",
  fastfood: "fast_food",
  supermarkets: "grocery",
  supermarket: "grocery",
  grocery: "grocery",
  convenience: "grocery",
  pubs: "bar",
  pub: "bar",
  bars: "bar",
  bar: "bar",
};

function normalizeComparableText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(combiningMarks, "")
    .toLocaleLowerCase("en-US")
    .replace(nonComparableCharacters, " ")
    .replace(whitespace, " ")
    .trim();
}

export function normalizeBusinessName(
  value: string | null | undefined,
): string | null {
  if (!value?.trim()) {
    return null;
  }

  const normalized = normalizeComparableText(value);
  return normalized || null;
}

export function normalizeCategory(
  category: string | null | undefined,
  providerTypes: readonly string[] = [],
): string | null {
  const source = category ?? providerTypes[0]?.split(":").at(-1) ?? null;
  const normalized = source ? normalizeComparableText(source) : "";

  if (!normalized) {
    return null;
  }

  return categoryAliases[normalized] ?? normalized.replace(whitespace, "_");
}

export function normalizeAddress(
  value: string | null | undefined,
): string | null {
  if (!value?.trim()) {
    return null;
  }

  const normalized = normalizeComparableText(value)
    .replace(/\bjl\b/g, "jalan")
    .replace(/\bno\b/g, "nomor")
    .replace(whitespace, " ")
    .trim();

  return normalized || null;
}

export interface NormalizedCoordinates {
  latitude: number;
  longitude: number;
}

export function normalizeCoordinates(
  latitude: number,
  longitude: number,
): NormalizedCoordinates | null {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  const roundedLatitude = Number(latitude.toFixed(6));
  const roundedLongitude = Number(longitude.toFixed(6));

  return {
    latitude: Object.is(roundedLatitude, -0) ? 0 : roundedLatitude,
    longitude: Object.is(roundedLongitude, -0) ? 0 : roundedLongitude,
  };
}
