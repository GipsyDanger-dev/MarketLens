import { describe, expect, it } from "vitest";

import { mapGmapsEntry } from "./mapper";
import type { GmapsEntry } from "./types";

const baseEntry: GmapsEntry = {
  inputId: "query-1",
  link: "https://www.google.com/maps/place/Coffee+Shop",
  cid: "",
  title: "Kopi Kita",
  categories: ["cafe", "restaurant"],
  category: "cafe",
  address: "Jl. Kemang Raya No. 10, Jakarta",
  openHours: { Monday: ["08:00-22:00"] },
  popularTimes: {},
  website: "https://kopikita.com",
  phone: "+62 21 1234 5678",
  plusCode: "",
  reviewCount: 150,
  reviewRating: 4.5,
  reviewsPerRating: { 1: 5, 2: 10, 3: 20, 4: 45, 5: 70 },
  latitude: -6.2617,
  longitude: 106.8145,
  status: "",
  description: "Best coffee in town",
  reviewsLink: "",
  thumbnail: "",
  timezone: "Asia/Jakarta",
  priceRange: "$$",
  dataId: "",
  streetViewUrl: "",
  placeId: "ChIJ_example_place_id",
  images: [],
  reservations: [],
  orderOnline: [],
  menu: { link: "", source: "" },
  owner: { id: "", name: "", link: "" },
  completeAddress: {
    borough: "",
    street: "Jl. Kemang Raya No. 10",
    city: "Jakarta",
    postalCode: "12730",
    state: "DKI Jakarta",
    country: "Indonesia",
  },
  creditCardsAccepted: [],
  about: [],
  userReviews: [],
  userReviewsExtended: [],
  emails: [],
};

describe("mapGmapsEntry", () => {
  it("maps a valid entry to PlaceCandidate", () => {
    const collectedAt = new Date("2026-08-31T00:00:00.000Z");
    const result = mapGmapsEntry(baseEntry, collectedAt);

    expect(result).not.toBeNull();
    expect(result).toMatchObject({
      providerId: "google-maps-scraper",
      externalId: "ChIJ_example_place_id",
      name: "Kopi Kita",
      category: "cafe",
      providerTypes: ["cafe", "restaurant"],
      address: "Jl. Kemang Raya No. 10, Jakarta",
      city: "Jakarta",
      country: "Indonesia",
      latitude: -6.2617,
      longitude: 106.8145,
      rating: 4.5,
      reviewCount: 150,
      phone: "+62 21 1234 5678",
      website: "https://kopikita.com",
      sourceUrl: "https://www.google.com/maps/place/Coffee+Shop",
      collectedAt,
    });
  });

  it("returns null for entries without a title", () => {
    const result = mapGmapsEntry({ ...baseEntry, title: "" }, new Date());
    expect(result).toBeNull();
  });

  it("returns null for entries with invalid coordinates", () => {
    expect(
      mapGmapsEntry({ ...baseEntry, latitude: 95 }, new Date()),
    ).toBeNull();
    expect(
      mapGmapsEntry({ ...baseEntry, longitude: -200 }, new Date()),
    ).toBeNull();
  });

  it("returns null when no external ID is available", () => {
    const result = mapGmapsEntry(
      { ...baseEntry, placeId: "", cid: "", link: "" },
      new Date(),
    );
    expect(result).toBeNull();
  });

  it("uses placeId as external ID when available", () => {
    const result = mapGmapsEntry(baseEntry, new Date());
    expect(result?.externalId).toBe("ChIJ_example_place_id");
  });

  it("falls back to cid when placeId is empty", () => {
    const result = mapGmapsEntry(
      { ...baseEntry, placeId: "", cid: "12345" },
      new Date(),
    );
    expect(result?.externalId).toBe("12345");
  });

  it("maps social links from website", () => {
    const result = mapGmapsEntry(
      { ...baseEntry, website: "https://instagram.com/kopikita" },
      new Date(),
    );
    expect(result?.socialLinks).toEqual({
      instagram: "https://instagram.com/kopikita",
    });
  });

  it("normalizes closed business status", () => {
    const result = mapGmapsEntry(
      { ...baseEntry, status: "CLOSED" },
      new Date(),
    );
    expect(result?.businessStatus).toBe("CLOSED");
  });

  it("normalizes temporarily closed status", () => {
    const result = mapGmapsEntry(
      { ...baseEntry, status: "temporarily_closed" },
      new Date(),
    );
    expect(result?.businessStatus).toBe("TEMPORARY_CLOSED");
  });

  it("returns null rating for out-of-range values", () => {
    const result = mapGmapsEntry({ ...baseEntry, reviewRating: 6 }, new Date());
    expect(result?.rating).toBeNull();
  });

  it("returns null reviewCount for negative values", () => {
    const result = mapGmapsEntry({ ...baseEntry, reviewCount: -5 }, new Date());
    expect(result?.reviewCount).toBeNull();
  });
});
