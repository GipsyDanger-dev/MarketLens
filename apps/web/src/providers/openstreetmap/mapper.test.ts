import { describe, expect, it } from "vitest";

import { mapOverpassElement } from "./mapper";

describe("mapOverpassElement", () => {
  it("maps a named node into a provider-neutral candidate", () => {
    const collectedAt = new Date("2026-08-26T00:00:00.000Z");
    const place = mapOverpassElement(
      {
        type: "node",
        id: 42,
        lat: -6.2,
        lon: 106.8,
        tags: {
          name: "Kopi Kita",
          amenity: "cafe",
          "addr:street": "Jalan Sudirman",
          "addr:city": "Jakarta",
          website: "https://example.com",
          "contact:instagram": "kopikita.id",
        },
      },
      collectedAt,
    );

    expect(place).toMatchObject({
      providerId: "openstreetmap",
      externalId: "node/42",
      category: "cafe",
      providerTypes: ["amenity:cafe"],
      city: "Jakarta",
      sourceUrl: "https://www.openstreetmap.org/node/42",
      socialLinks: { instagram: "https://www.instagram.com/kopikita.id" },
      collectedAt,
    });
  });

  it("uses center coordinates for ways and skips elements without coordinates", () => {
    expect(
      mapOverpassElement(
        { type: "way", id: 5, center: { lat: -6.21, lon: 106.81 } },
        new Date(),
      ),
    ).toMatchObject({ latitude: -6.21, longitude: 106.81 });
    expect(
      mapOverpassElement({ type: "relation", id: 6 }, new Date()),
    ).toBeNull();
  });
});
