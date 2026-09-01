import { describe, expect, it, vi } from "vitest";

import { ProviderError } from "../errors";
import type { PlaceSearchRequest } from "../types";
import { GoogleMapsScraperProvider } from "./provider";

vi.mock("server-only", () => ({}));

const baseRequest: PlaceSearchRequest = {
  query: "coffee shop",
  latitude: -6.2088,
  longitude: 106.8456,
  radiusMeters: 5_000,
  maxResults: 50,
};

describe("GoogleMapsScraperProvider", () => {
  it("has correct id and capabilities", () => {
    const provider = new GoogleMapsScraperProvider();

    expect(provider.id).toBe("google-maps-scraper");
    expect(provider.name).toBe("Google Maps (Scraper)");
    expect(provider.capabilities).toEqual({
      textSearch: true,
      nearbySearch: true,
      details: false,
      ratings: true,
      reviewCounts: true,
      phone: true,
      website: true,
      openingHours: true,
    });
  });

  it("rejects page token requests", async () => {
    const provider = new GoogleMapsScraperProvider();

    await expect(
      provider.search({ ...baseRequest, pageToken: "next" }),
    ).rejects.toThrow(ProviderError);
  });

  it("rejects empty queries", async () => {
    const provider = new GoogleMapsScraperProvider();

    await expect(
      provider.search({ ...baseRequest, query: "  " }),
    ).rejects.toThrow(ProviderError);
  });

  it("health check returns healthy when Google Maps is reachable", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch;

    const provider = new GoogleMapsScraperProvider();
    const health = await provider.healthCheck();

    expect(health.healthy).toBe(true);
    expect(health.providerId).toBe("google-maps-scraper");

    vi.restoreAllMocks();
  });

  it("health check returns unhealthy when fetch fails", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));
    global.fetch = mockFetch;

    const provider = new GoogleMapsScraperProvider();
    const health = await provider.healthCheck();

    expect(health.healthy).toBe(false);
    expect(health.message).toBe("Network error");

    vi.restoreAllMocks();
  });
});
