import { describe, expect, it } from "vitest";

import {
  normalizeAddress,
  normalizeBusinessName,
  normalizeCategory,
  normalizeCoordinates,
} from "./normalization";

describe("place normalization", () => {
  it("creates stable business-name keys across whitespace, punctuation, and accents", () => {
    expect(normalizeBusinessName("  Café -- KITA, PT. ")).toBe("cafe kita pt");
    expect(normalizeBusinessName("   ")).toBeNull();
  });

  it("maps category aliases and can fall back to a provider type", () => {
    expect(normalizeCategory("Coffee Shop")).toBe("cafe");
    expect(normalizeCategory(null, ["amenity:fast food"])).toBe("fast_food");
    expect(normalizeCategory(null, [])).toBeNull();
  });

  it("creates comparable Indonesian address keys", () => {
    expect(normalizeAddress("  Jl. Sudirman, No. 12  ")).toBe(
      "jalan sudirman nomor 12",
    );
    expect(normalizeAddress(null)).toBeNull();
  });

  it("rounds valid coordinates and rejects invalid geographic values", () => {
    expect(normalizeCoordinates(-6.2000004, 106.7999996)).toEqual({
      latitude: -6.2,
      longitude: 106.8,
    });
    expect(normalizeCoordinates(91, 106.8)).toBeNull();
    expect(normalizeCoordinates(Number.NaN, 106.8)).toBeNull();
  });
});
