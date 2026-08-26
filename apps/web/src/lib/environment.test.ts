import { describe, expect, it } from "vitest";

import { parseServerEnvironment } from "./environment";

describe("parseServerEnvironment", () => {
  it("uses safe feature defaults and parses numeric configuration", () => {
    const environment = parseServerEnvironment({
      DATABASE_URL:
        "postgresql://marketlens:marketlens@localhost:5432/marketlens",
      MAX_RESEARCH_RESULTS: "250",
    });

    expect(environment).toMatchObject({
      DEFAULT_PLACE_PROVIDER: "openstreetmap",
      ENABLE_AI: false,
      ENABLE_AUTH: false,
      MAX_RESEARCH_RESULTS: 250,
      OVERPASS_API_URL: "https://overpass-api.de/api/interpreter",
      OVERPASS_TIMEOUT_SECONDS: 25,
    });
  });
});
