import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { createProviderRegistry } from "./index";
import { OpenStreetMapProvider } from "./openstreetmap/provider";

describe("createProviderRegistry", () => {
  it("registers OpenStreetMap from server environment configuration", () => {
    const registry = createProviderRegistry({
      DATABASE_URL:
        "postgresql://marketlens:marketlens@localhost:5432/marketlens",
      OVERPASS_API_URL: "https://overpass.example/api/interpreter",
      OVERPASS_TIMEOUT_SECONDS: "10",
    });

    expect(registry.get("openstreetmap")).toBeInstanceOf(OpenStreetMapProvider);
    expect(registry.list()).toHaveLength(1);
  });
});
