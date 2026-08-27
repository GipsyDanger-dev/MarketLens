import { describe, expect, it } from "vitest";

import { calculateDataQualityMetrics } from "./data-quality";

describe("calculateDataQualityMetrics", () => {
  it("reports completeness and duplicate primary identities", () => {
    expect(
      calculateDataQualityMetrics([
        {
          providerId: "openstreetmap",
          externalId: "node/42",
          normalizedName: "kopi kita",
          category: "cafe",
          address: "jalan kemang nomor 10",
          latitude: -6.2,
          longitude: 106.8,
          phone: null,
          website: "https://example.com",
        },
        {
          providerId: "openstreetmap",
          externalId: "node/42",
          normalizedName: null,
          category: null,
          address: null,
          latitude: null,
          longitude: null,
          phone: "+62 21 1234",
          website: null,
        },
      ]),
    ).toEqual({
      totalPlaces: 2,
      withNormalizedName: 1,
      withCategory: 1,
      withAddress: 1,
      withCoordinates: 1,
      withPhone: 1,
      withWebsite: 1,
      completeRecords: 1,
      duplicatePrimaryIdentities: 1,
      fieldCompletenessPercent: 50,
      recordCompletenessPercent: 50,
    });
  });

  it("returns zero percentages for an empty dataset", () => {
    expect(calculateDataQualityMetrics([])).toMatchObject({
      totalPlaces: 0,
      fieldCompletenessPercent: 0,
      recordCompletenessPercent: 0,
    });
  });
});
