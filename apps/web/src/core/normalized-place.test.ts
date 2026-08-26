import { describe, expect, it } from "vitest";

import { normalizedPlaceSchema } from "./normalized-place";

const validPlace = {
  providerId: "openstreetmap",
  externalId: "node/42",
  name: "Kopi Kita",
  normalizedName: "kopi kita",
  latitude: -6.2,
  longitude: 106.8,
};

describe("normalizedPlaceSchema", () => {
  it("defaults absent provider types and collection time", () => {
    const result = normalizedPlaceSchema.parse(validPlace);

    expect(result.providerTypes).toEqual([]);
    expect(result.collectedAt).toBeInstanceOf(Date);
  });

  it("rejects impossible ratings and coordinates", () => {
    expect(
      normalizedPlaceSchema.safeParse({ ...validPlace, rating: 5.1 }).success,
    ).toBe(false);
    expect(
      normalizedPlaceSchema.safeParse({ ...validPlace, longitude: 181 })
        .success,
    ).toBe(false);
  });
});
