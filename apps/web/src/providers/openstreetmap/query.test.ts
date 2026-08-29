import { describe, expect, it } from "vitest";

import { ProviderError } from "../errors";
import { buildOverpassQuery } from "./query";

const request = {
  query: "coffee (shop)",
  category: "cafe",
  latitude: -6.2,
  longitude: 106.8,
  radiusMeters: 1_000,
  maxResults: 500,
};

describe("buildOverpassQuery", () => {
  it("maps a search to a bounded, escaped Overpass query", () => {
    const query = buildOverpassQuery(request, { maxResults: 250 });

    expect(query).toContain("[out:json][timeout:25];");
    expect(query).toContain('["name"~"coffee \\(shop\\)",i]');
    expect(query).toContain('["amenity"="cafe"]');
    expect(query).toContain("(around:1000,-6.2,106.8);");
    expect(query).toContain("out center 250;");
  });

  it("rejects unsupported pagination and invalid coordinates", () => {
    expect(() => buildOverpassQuery({ ...request, pageToken: "next" })).toThrow(
      ProviderError,
    );
    expect(() => buildOverpassQuery({ ...request, latitude: -91 })).toThrow(
      ProviderError,
    );
  });
});
