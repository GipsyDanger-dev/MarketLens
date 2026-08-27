import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { ProviderError } from "../errors";
import { GooglePlacesProvider } from "./provider";

const request = {
  query: "coffee shops in Malang",
  category: "cafe",
  latitude: -7.977,
  longitude: 112.634,
  radiusMeters: 2_000,
  maxResults: 10,
};

function successResponse() {
  return new Response(
    JSON.stringify({
      places: [
        {
          id: "ChIJ-test",
          displayName: { text: "Kopi Kita" },
          formattedAddress: "Jl. Ijen 1, Malang",
          location: { latitude: -7.977, longitude: 112.634 },
          types: ["cafe"],
          rating: 4.5,
          userRatingCount: 80,
        },
      ],
      nextPageToken: "page-2",
    }),
    { status: 200 },
  );
}

describe("GooglePlacesProvider", () => {
  it("uses Text Search with an explicit minimal field mask and maps the response", async () => {
    const fetchImplementation = vi.fn().mockResolvedValue(successResponse());
    const provider = new GooglePlacesProvider({
      apiKey: "server-only-key",
      fetch: fetchImplementation as typeof fetch,
      now: () => new Date("2026-08-28T00:00:00.000Z"),
    });

    await expect(provider.search(request)).resolves.toMatchObject({
      places: [
        expect.objectContaining({
          providerId: "google-places",
          rating: 4.5,
          reviewCount: 80,
        }),
      ],
      nextPageToken: "page-2",
    });
    const [url, options] = fetchImplementation.mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(url).toBe("https://places.googleapis.com/v1/places:searchText");
    expect(options.headers).toMatchObject({
      "X-Goog-Api-Key": "server-only-key",
      "X-Goog-FieldMask": expect.stringContaining("places.id"),
    });
    expect(
      (options.headers as Record<string, string>)["X-Goog-FieldMask"],
    ).not.toContain("*");
    expect(JSON.parse(options.body as string)).toMatchObject({
      textQuery: "coffee shops in Malang",
      pageSize: 10,
      locationBias: {
        circle: { center: { latitude: -7.977, longitude: 112.634 } },
      },
    });
  });

  it("uses a page token on subsequent search requests", async () => {
    const fetchImplementation = vi.fn().mockResolvedValue(successResponse());
    const provider = new GooglePlacesProvider({
      apiKey: "server-only-key",
      fetch: fetchImplementation as typeof fetch,
    });

    await provider.search({ ...request, pageToken: "page-2" });
    const [, options] = fetchImplementation.mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(JSON.parse(options.body as string)).toEqual({ pageToken: "page-2" });
  });

  it("validates configuration and maps rate limits to retryable errors", async () => {
    expect(() => new GooglePlacesProvider({ apiKey: "" })).toThrowError(
      expect.objectContaining<Partial<ProviderError>>({
        code: "CONFIGURATION",
      }),
    );
    const provider = new GooglePlacesProvider({
      apiKey: "server-only-key",
      fetch: (async () => new Response(null, { status: 429 })) as typeof fetch,
    });

    await expect(provider.search(request)).rejects.toMatchObject({
      code: "RATE_LIMITED",
      retryable: true,
    } satisfies Partial<ProviderError>);
  });
});
