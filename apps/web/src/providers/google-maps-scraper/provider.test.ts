import { afterEach, describe, expect, it, vi } from "vitest";

import { ProviderError } from "../errors";
import type { PlaceSearchRequest } from "../types";
import { GoogleMapsScraperProvider } from "./provider";
import { ScraperEngine } from "./scraper";
import type { GmapsEntry } from "./types";

afterEach(() => vi.restoreAllMocks());

vi.mock("server-only", () => ({}));

const baseRequest: PlaceSearchRequest = {
  query: "coffee shop",
  latitude: -6.2088,
  longitude: 106.8456,
  radiusMeters: 5_000,
  maxResults: 50,
};

describe("GoogleMapsScraperProvider", () => {
  it("enforces the operator budget, filters at the equator and releases each search engine", async () => {
    const entry = {
      title: "Cafe",
      placeId: "one",
      latitude: 0,
      longitude: 1,
      category: "cafe",
      categories: [],
      completeAddress: {},
      emails: [],
    } as unknown as GmapsEntry;
    const search = vi
      .spyOn(ScraperEngine.prototype, "search")
      .mockResolvedValue({
        searchUrl: "https://www.google.com/maps/search/cafe",
        entries: [
          { ...entry, latitude: 20 },
          entry,
          { ...entry, placeId: "two" },
        ],
      });
    const cleanup = vi.spyOn(ScraperEngine.prototype, "cleanup");
    const provider = new GoogleMapsScraperProvider({ maxResults: 1 });
    const request = { ...baseRequest, latitude: 0, longitude: 1 };
    await expect(provider.search(request)).resolves.toMatchObject({
      places: [{ externalId: "one" }],
    });
    await provider.search(request);
    expect(search).toHaveBeenCalledWith(
      request.query,
      expect.objectContaining({ maxResults: 1 }),
    );
    expect(cleanup).toHaveBeenCalledTimes(2);
    expect(search.mock.instances[0]).not.toBe(search.mock.instances[1]);
  });

  it("releases the browser pool when collection fails", async () => {
    vi.spyOn(ScraperEngine.prototype, "search").mockRejectedValue(
      new Error("timeout"),
    );
    const cleanup = vi.spyOn(ScraperEngine.prototype, "cleanup");
    await expect(
      new GoogleMapsScraperProvider().search(baseRequest),
    ).rejects.toThrow("timeout");
    expect(cleanup).toHaveBeenCalledOnce();
  });
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
