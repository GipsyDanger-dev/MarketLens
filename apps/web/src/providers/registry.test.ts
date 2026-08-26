import { describe, expect, it } from "vitest";

import { ProviderError } from "./errors";
import { ProviderRegistry } from "./registry";
import type { PlaceProvider } from "./types";

const provider: PlaceProvider = {
  id: "test-provider",
  name: "Test Provider",
  capabilities: {
    textSearch: true,
    nearbySearch: true,
    details: false,
    ratings: false,
    reviewCounts: false,
    phone: false,
    website: false,
    openingHours: false,
  },
  search: async () => ({ places: [] }),
};

describe("ProviderRegistry", () => {
  it("registers and returns providers", () => {
    const registry = new ProviderRegistry();
    registry.register(provider);

    expect(registry.get(provider.id)).toBe(provider);
    expect(registry.list()).toEqual([provider]);
  });

  it("rejects duplicate and unknown provider ids", () => {
    const registry = new ProviderRegistry();
    registry.register(provider);

    expect(() => registry.register(provider)).toThrow(ProviderError);
    expect(() => registry.get("missing")).toThrow(ProviderError);
  });
});
