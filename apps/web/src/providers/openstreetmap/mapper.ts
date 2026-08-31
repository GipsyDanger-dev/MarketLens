import type { PlaceCandidate } from "../types";
import type { OverpassElement } from "./types";

const categoryKeys = [
  "amenity",
  "shop",
  "tourism",
  "leisure",
  "office",
  "craft",
];

export function mapOverpassElement(
  element: OverpassElement,
  collectedAt: Date,
): PlaceCandidate | null {
  const coordinates = coordinatesFor(element);

  if (!coordinates) {
    return null;
  }

  const tags = element.tags ?? {};
  const categoryKey = categoryKeys.find((key) => tags[key]);
  const category = categoryKey ? tags[categoryKey] : null;

  return {
    providerId: "openstreetmap",
    externalId: `${element.type}/${element.id}`,
    name: tags.name ?? null,
    category,
    providerTypes:
      categoryKey && category ? [`${categoryKey}:${category}`] : [],
    address: addressFromTags(tags),
    city: tags["addr:city"] ?? null,
    district: tags["addr:district"] ?? tags["addr:suburb"] ?? null,
    country: tags["addr:country"] ?? null,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    rating: null,
    reviewCount: null,
    phone: tags["contact:phone"] ?? tags.phone ?? null,
    website: tags["contact:website"] ?? tags.website ?? null,
    socialLinks: socialLinksFromTags(tags),
    sourceUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
    businessStatus:
      tags.disused === "yes" || tags.closed === "yes" ? "CLOSED" : null,
    collectedAt,
    rawData: element,
  };
}

function socialLinksFromTags(tags: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    [
      ["instagram", tags["contact:instagram"] ?? tags.instagram],
      ["facebook", tags["contact:facebook"] ?? tags.facebook],
      ["linkedin", tags["contact:linkedin"] ?? tags.linkedin],
      ["x", tags["contact:twitter"] ?? tags.twitter],
    ].flatMap(([network, value]) => {
      if (!value) return [];
      const url = socialUrl(network, value);
      return url ? [[network, url]] : [];
    }),
  );
}

function socialUrl(network: string, value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//iu.test(trimmed)) return trimmed;

  const handle = trimmed.replace(/^@/u, "").replace(/^\/+|\/+$/gu, "");
  if (!handle) return null;
  const baseUrls: Record<string, string> = {
    instagram: "https://www.instagram.com/",
    facebook: "https://www.facebook.com/",
    linkedin: "https://www.linkedin.com/in/",
    x: "https://x.com/",
  };
  return `${baseUrls[network]}${encodeURIComponent(handle)}`;
}

function coordinatesFor(
  element: OverpassElement,
): { latitude: number; longitude: number } | null {
  const latitude = element.lat ?? element.center?.lat;
  const longitude = element.lon ?? element.center?.lon;

  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return { latitude, longitude };
}

function addressFromTags(tags: Record<string, string>): string | null {
  const parts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:suburb"],
    tags["addr:city"],
    tags["addr:postcode"],
    tags["addr:country"],
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : null;
}
