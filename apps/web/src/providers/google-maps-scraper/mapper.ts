/**
 * Maps Google Maps scraper entries to MarketLens PlaceCandidate format.
 *
 * Adapted from gosom/google-maps-scraper (MIT License).
 */

import type { PlaceCandidate } from "../types";
import type { GmapsEntry } from "./types";

const PROVIDER_ID = "google-maps-scraper";

/**
 * Map a single GmapsEntry to a PlaceCandidate for MarketLens.
 */
export function mapGmapsEntry(
  entry: GmapsEntry,
  collectedAt: Date,
): PlaceCandidate | null {
  const name = entry.title?.trim();
  if (!name) return null;

  const latitude = entry.latitude;
  const longitude = entry.longitude;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180)
    return null;

  const externalId = entry.placeId || entry.cid || entry.link;
  if (!externalId) return null;

  return {
    providerId: PROVIDER_ID,
    externalId,
    name,
    category: entry.category || entry.categories[0] || null,
    providerTypes: entry.categories,
    address: entry.address || null,
    city: entry.completeAddress.city || null,
    district: entry.completeAddress.borough || null,
    country: entry.completeAddress.country || null,
    latitude,
    longitude,
    rating: validRating(entry.reviewRating),
    reviewCount: validReviewCount(entry.reviewCount),
    phone: entry.phone || null,
    website: entry.website || null,
    emails: entry.emails?.length ? entry.emails : undefined,
    socialLinks: extractSocialLinks(entry),
    sourceUrl: entry.link || null,
    businessStatus: normalizeBusinessStatus(entry.status),
    collectedAt,
    rawData: entry,
  };
}

function validRating(value: unknown): number | null {
  if (typeof value !== "number") return null;
  if (!Number.isFinite(value)) return null;
  if (value < 0 || value > 5) return null;
  return value;
}

function validReviewCount(value: unknown): number | null {
  if (typeof value !== "number") return null;
  if (!Number.isInteger(value)) return null;
  if (value < 0) return null;
  return value;
}

function normalizeBusinessStatus(status: string): string | null {
  if (!status) return null;
  const lower = status.toLowerCase();
  if (lower === "closed" || lower === "permanently_closed") return "CLOSED";
  if (lower === "temporarily_closed") return "TEMPORARY_CLOSED";
  return null;
}

/**
 * Extract social links from the entry's website or about section.
 * Does not crawl external profiles - only uses data already collected.
 */
function extractSocialLinks(entry: GmapsEntry): Record<string, string> {
  const links: Record<string, string> = {};

  // Check if website is a social media link
  const website = entry.website;
  if (website) {
    const socialMatch = detectSocialLink(website);
    if (socialMatch) {
      links[socialMatch.network] = socialMatch.url;
    }
  }

  return links;
}

function detectSocialLink(
  url: string,
): { network: string; url: string } | null {
  const lower = url.toLowerCase();

  if (lower.includes("instagram.com")) return { network: "instagram", url };
  if (lower.includes("facebook.com")) return { network: "facebook", url };
  if (lower.includes("linkedin.com")) return { network: "linkedin", url };
  if (lower.includes("x.com") || lower.includes("twitter.com"))
    return { network: "x", url };
  if (lower.includes("tiktok.com")) return { network: "tiktok", url };
  if (lower.includes("youtube.com")) return { network: "youtube", url };

  return null;
}
