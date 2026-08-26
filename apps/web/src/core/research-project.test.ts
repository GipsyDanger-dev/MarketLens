import { describe, expect, it } from "vitest";

import { researchProjectInputSchema } from "./research-project";

const validProject = {
  name: "Coffee shops in Jakarta",
  providerId: "openstreetmap",
  query: "coffee shop",
  locationQuery: "Jakarta, Indonesia",
  latitude: -6.2088,
  longitude: 106.8456,
  radiusMeters: 5_000,
};

describe("researchProjectInputSchema", () => {
  it("applies safe defaults for a new draft", () => {
    expect(researchProjectInputSchema.parse(validProject)).toMatchObject({
      maxResults: 250,
      status: "DRAFT",
    });
  });

  it("rejects invalid provider ids and geographic bounds", () => {
    expect(
      researchProjectInputSchema.safeParse({
        ...validProject,
        providerId: "Open Street Map!",
      }).success,
    ).toBe(false);
    expect(
      researchProjectInputSchema.safeParse({
        ...validProject,
        latitude: -91,
      }).success,
    ).toBe(false);
  });
});
