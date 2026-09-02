import { describe, expect, it } from "vitest";

import { candidateToPersistablePlace } from "./candidate-to-place";

const candidate = {
  providerId: "openstreetmap",
  externalId: "node/42",
  name: "  KOPI Kita ",
  category: "cafe",
  providerTypes: ["amenity:cafe"],
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
  collectedAt: new Date("2026-08-27T00:00:00.000Z"),
  rawData: {},
};

describe("candidateToPersistablePlace", () => {
  it("keeps provider data while applying the temporary persistence name key", () => {
    expect(candidateToPersistablePlace(candidate)).toMatchObject({
      name: "KOPI Kita",
      normalizedName: "kopi kita",
    });
  });

  it("marks unnamed candidates as failed items", () => {
    expect(
      candidateToPersistablePlace({ ...candidate, name: null }),
    ).toBeNull();
  });

  it("drops unsafe provider URLs before persistence", () => {
    expect(
      candidateToPersistablePlace({
        ...candidate,
        website: "javascript:alert(1)",
        sourceUrl: "data:text/html,unsafe",
        socialLinks: {
          instagram: "https://www.instagram.com/kopikita",
          unsafe: "javascript:alert(1)",
        },
      }),
    ).toMatchObject({
      website: null,
      sourceUrl: null,
      socialLinks: { instagram: "https://www.instagram.com/kopikita" },
    });
  });
});
