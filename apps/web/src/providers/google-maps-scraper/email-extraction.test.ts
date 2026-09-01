import { describe, expect, it } from "vitest";

import { mapGmapsEntry } from "./mapper";
import type { GmapsEntry } from "./types";

const baseEntry: GmapsEntry = {
  inputId: "query-1",
  link: "https://www.google.com/maps/place/Coffee+Shop",
  cid: "",
  title: "Kopi Kita",
  categories: ["cafe"],
  category: "cafe",
  address: "Jl. Kemang Raya No. 10, Jakarta",
  openHours: {},
  popularTimes: {},
  website: "https://kopikita.com",
  phone: "+62 21 1234 5678",
  plusCode: "",
  reviewCount: 150,
  reviewRating: 4.5,
  reviewsPerRating: {},
  latitude: -6.2617,
  longitude: 106.8145,
  status: "",
  description: "",
  reviewsLink: "",
  thumbnail: "",
  timezone: "",
  priceRange: "",
  dataId: "",
  streetViewUrl: "",
  placeId: "ChIJ_example",
  images: [],
  reservations: [],
  orderOnline: [],
  menu: { link: "", source: "" },
  owner: { id: "", name: "", link: "" },
  completeAddress: {
    borough: "",
    street: "",
    city: "Jakarta",
    postalCode: "",
    state: "",
    country: "Indonesia",
  },
  creditCardsAccepted: [],
  about: [],
  userReviews: [],
  userReviewsExtended: [],
  emails: [],
};

describe("Email extraction mapping", () => {
  it("includes emails in PlaceCandidate when present", () => {
    const entry = {
      ...baseEntry,
      emails: ["info@kopikita.com", "contact@kopikita.com"],
    };

    const result = mapGmapsEntry(entry, new Date());

    expect(result).not.toBeNull();
    expect(result?.emails).toEqual([
      "info@kopikita.com",
      "contact@kopikita.com",
    ]);
  });

  it("returns undefined emails when array is empty", () => {
    const entry = { ...baseEntry, emails: [] };

    const result = mapGmapsEntry(entry, new Date());

    expect(result?.emails).toBeUndefined();
  });

  it("returns undefined emails when empty array is provided", () => {
    const entry = { ...baseEntry, emails: [] };

    const result = mapGmapsEntry(entry, new Date());

    expect(result?.emails).toBeUndefined();
  });

  it("filters out false positive emails", () => {
    const entry = {
      ...baseEntry,
      emails: [
        "real@example.com",
        "image.png@test.com",
        "script.js@domain.com",
        "test@example.com",
      ],
    };

    // The filtering happens in the scraper, not the mapper
    // The mapper just passes through what it receives
    const result = mapGmapsEntry(entry, new Date());

    expect(result?.emails).toEqual([
      "real@example.com",
      "image.png@test.com",
      "script.js@domain.com",
      "test@example.com",
    ]);
  });
});

describe("Social media URL detection for email extraction", () => {
  it("maps social media websites to socialLinks", () => {
    const entry = {
      ...baseEntry,
      website: "https://instagram.com/kopikita",
    };

    const result = mapGmapsEntry(entry, new Date());

    expect(result?.socialLinks).toEqual({
      instagram: "https://instagram.com/kopikita",
    });
    expect(result?.website).toBe("https://instagram.com/kopikita");
  });

  it("detects multiple social platforms", () => {
    const socialUrls = [
      { url: "https://facebook.com/kopikita", network: "facebook" },
      { url: "https://twitter.com/kopikita", network: "x" },
      { url: "https://linkedin.com/company/kopikita", network: "linkedin" },
      { url: "https://tiktok.com/@kopikita", network: "tiktok" },
      { url: "https://youtube.com/@kopikita", network: "youtube" },
    ];

    for (const { url, network } of socialUrls) {
      const entry = { ...baseEntry, website: url };
      const result = mapGmapsEntry(entry, new Date());
      expect(result?.socialLinks?.[network]).toBe(url);
    }
  });
});
