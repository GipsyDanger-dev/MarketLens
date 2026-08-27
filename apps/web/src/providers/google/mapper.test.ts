import { describe, expect, it } from "vitest";

import { mapGooglePlace } from "./mapper";

describe("mapGooglePlace", () => {
  it("maps selected Google Places fields into the provider-neutral candidate", () => {
    expect(
      mapGooglePlace(
        {
          id: "ChIJ-test",
          displayName: { text: "Kopi Kita" },
          formattedAddress: "Jl. Ijen 1, Malang",
          location: { latitude: -7.977, longitude: 112.634 },
          types: ["cafe", "food"],
          rating: 4.6,
          userRatingCount: 120,
          nationalPhoneNumber: "+62 341 123456",
          websiteUri: "https://example.com",
          googleMapsUri: "https://maps.google.com/?cid=test",
          businessStatus: "OPERATIONAL",
        },
        new Date("2026-08-28T00:00:00.000Z"),
      ),
    ).toMatchObject({
      providerId: "google-places",
      externalId: "ChIJ-test",
      name: "Kopi Kita",
      category: "cafe",
      rating: 4.6,
      reviewCount: 120,
    });
  });

  it("rejects a place without the stable identity and coordinates required by the contract", () => {
    expect(
      mapGooglePlace(
        { id: "missing-coordinates", displayName: { text: "No location" } },
        new Date(),
      ),
    ).toBeNull();
  });
});
