import { describe, expect, it } from "vitest";

import { ProviderError } from "./errors";
import { runProviderSearchContract, validateSearchResponse } from "./test-kit";
import type { PlaceProvider, PlaceSearchRequest } from "./types";

const request: PlaceSearchRequest = {
  query: "coffee",
  latitude: -6.2,
  longitude: 106.8,
  radiusMeters: 1_000,
  maxResults: 1,
};

const provider: PlaceProvider = {
  id: "test-provider",
  name: "Test Provider",
  capabilities: {
    textSearch: true,
    nearbySearch: true,
    details: false,
    ratings: false,
    reviewCounts: false,
    phone: false,
    website: false,
    openingHours: false,
  },
  search: async () => ({
    places: [
      {
        providerId: "test-provider",
        externalId: "42",
        name: "Coffee shop",
        category: null,
        providerTypes: [],
        address: null,
        city: null,
        district: null,
        country: null,
        latitude: -6.2,
        longitude: 106.8,
        phone: null,
        website: null,
        sourceUrl: null,
        businessStatus: null,
        collectedAt: new Date(),
        rawData: {},
      },
    ],
  }),
};

describe("provider test kit", () => {
  it("accepts a compliant provider search", async () => {
    const response = await runProviderSearchContract(provider, request);

    expect(response.places).toHaveLength(1);
  });

  it("rejects candidate data that exceeds the contract", () => {
    expect(() =>
      validateSearchResponse(provider, request, {
        places: [
          {
            providerId: "other-provider",
            externalId: "",
            name: null,
            category: null,
            providerTypes: [],
            address: null,
            city: null,
            district: null,
            country: null,
            latitude: 95,
            longitude: 106.8,
            phone: null,
            website: null,
            sourceUrl: null,
            businessStatus: null,
            collectedAt: new Date(),
            rawData: {},
          },
        ],
      }),
    ).toThrow(ProviderError);
  });
});
