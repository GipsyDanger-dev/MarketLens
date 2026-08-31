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
  it("uses an indexed category lookup when a category is selected", () => {
    const query = buildOverpassQuery(request, { maxResults: 250 });

    expect(query).toContain("[out:json][timeout:25];");
    expect(query).toContain('["amenity"="cafe"]');
    expect(query).not.toContain('["name"~');
    expect(query).toContain("(around:1000,-6.2,106.8);");
    expect(query).toContain("out center 250;");
  });

  it("uses an escaped name lookup when no category is selected", () => {
    const query = buildOverpassQuery(
      { ...request, category: undefined },
      { maxResults: 250 },
    );

    expect(query).toContain('["name"~"coffee \\(shop\\)",i]');
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
