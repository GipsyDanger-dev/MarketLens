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
      DEFAULT_AI_PROVIDER: "gemini",
      AI_TIMEOUT_MILLISECONDS: 20_000,
      AI_MAX_RETRIES: 1,
      ENABLE_AUTH: false,
      MAX_RESEARCH_RESULTS: 250,
      OVERPASS_API_URL: "https://overpass-api.de/api/interpreter",
      OVERPASS_TIMEOUT_SECONDS: 25,
    });
  });

  it("parses AI configuration without requiring a key in disabled mode", () => {
    const environment = parseServerEnvironment({
      DATABASE_URL:
        "postgresql://marketlens:marketlens@localhost:5432/marketlens",
      ENABLE_AI: "false",
      AI_TIMEOUT_MILLISECONDS: "5000",
      AI_MAX_RETRIES: "2",
    });

    expect(environment).toMatchObject({
      ENABLE_AI: false,
      AI_TIMEOUT_MILLISECONDS: 5000,
      AI_MAX_RETRIES: 2,
    });
    expect(environment.GEMINI_API_KEY).toBeUndefined();
  });

  it("treats blank optional provider and AI keys as unconfigured", () => {
    const environment = parseServerEnvironment({
      DATABASE_URL:
        "postgresql://marketlens:marketlens@localhost:5432/marketlens",
      GEMINI_API_KEY: "",
      GOOGLE_MAPS_API_KEY: "",
    });

    expect(environment.GEMINI_API_KEY).toBeUndefined();
    expect(environment.GOOGLE_MAPS_API_KEY).toBeUndefined();
  });
});
