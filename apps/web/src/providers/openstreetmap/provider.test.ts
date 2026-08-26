import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { ProviderError } from "../errors";
import { OpenStreetMapProvider } from "./provider";

const request = {
  query: "coffee",
  latitude: -6.2,
  longitude: 106.8,
  radiusMeters: 1_000,
  maxResults: 10,
};

describe("OpenStreetMapProvider", () => {
  it("posts an Overpass query and returns mapped candidates", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            elements: [
              {
                type: "node",
                id: 42,
                lat: -6.2,
                lon: 106.8,
                tags: { name: "Kopi Kita", amenity: "cafe" },
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
    );
    const provider = new OpenStreetMapProvider({
      endpoint: "https://overpass.example/api/interpreter",
      fetch: fetchMock as typeof globalThis.fetch,
      now: () => new Date("2026-08-26T00:00:00.000Z"),
    });

    const response = await provider.search(request);

    expect(response.places).toMatchObject([
      { externalId: "node/42", name: "Kopi Kita", category: "cafe" },
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://overpass.example/api/interpreter",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "User-Agent": "MarketLens/0.2.0 (self-hosted place intelligence)",
        }),
      }),
    );
  });

  it("maps rate-limit and network failures to typed provider errors", async () => {
    const rateLimitedProvider = new OpenStreetMapProvider({
      fetch: (async () => new Response(null, { status: 429 })) as typeof fetch,
    });
    const unavailableProvider = new OpenStreetMapProvider({
      fetch: (async () => {
        throw new TypeError("network unavailable");
      }) as typeof fetch,
    });

    await expect(rateLimitedProvider.search(request)).rejects.toMatchObject({
      code: "RATE_LIMITED",
      retryable: true,
    } satisfies Partial<ProviderError>);
    await expect(unavailableProvider.search(request)).rejects.toMatchObject({
      code: "NETWORK",
      retryable: true,
    } satisfies Partial<ProviderError>);
  });

  it("returns an unhealthy health result instead of throwing", async () => {
    const provider = new OpenStreetMapProvider({
      fetch: (async () => {
        throw new TypeError("network unavailable");
      }) as typeof fetch,
    });

    await expect(provider.healthCheck()).resolves.toMatchObject({
      providerId: "openstreetmap",
      healthy: false,
      message: "Unable to reach Overpass.",
    });
  });
});
