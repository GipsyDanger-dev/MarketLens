import { describe, expect, it } from "vitest";

import {
  boundedResearchResults,
  researchProjectInputSchema,
} from "./research-project";

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

  it("rejects oversized new projects and caps legacy requests", () => {
    expect(
      researchProjectInputSchema.safeParse({
        ...validProject,
        maxResults: 999999,
      }).success,
    ).toBe(false);
    expect(boundedResearchResults(999999)).toBe(250);
    expect(boundedResearchResults(500, 100)).toBe(100);
    expect(boundedResearchResults(10, 500)).toBe(10);
    expect(boundedResearchResults(999999, 999999)).toBe(1000);
    expect(() => boundedResearchResults(NaN)).toThrow();
    expect(() => boundedResearchResults(0)).toThrow();
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
