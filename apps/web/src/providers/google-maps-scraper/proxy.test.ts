import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { ScraperEngine } from "./scraper";

describe("ScraperEngine proxy support", () => {
  it("creates engine without proxies", () => {
    const engine = new ScraperEngine();
    expect(engine).toBeDefined();
  });

  it("creates engine with single proxy", () => {
    const engine = new ScraperEngine({
      proxyUrl: "http://user:pass@proxy.example.com:8080",
    });
    expect(engine).toBeDefined();
  });

  it("creates engine with proxy list", () => {
    const engine = new ScraperEngine({
      proxyList: [
        "http://user:pass@proxy1.example.com:8080",
        "socks5://proxy2.example.com:1080",
      ],
    });
    expect(engine).toBeDefined();
  });

  it("creates engine with proxy rotation enabled", () => {
    const engine = new ScraperEngine({
      proxyList: [
        "http://proxy1.example.com:8080",
        "http://proxy2.example.com:8080",
      ],
      proxyRotation: true,
    });
    expect(engine).toBeDefined();
  });

  it("accepts all scraper options", () => {
    const engine = new ScraperEngine({
      timeoutMilliseconds: 60_000,
      maxDepth: 20,
      langCode: "id",
      extractEmails: true,
      proxyUrl: "http://proxy.example.com:8080",
      proxyRotation: false,
    });
    expect(engine).toBeDefined();
  });
});

describe("Provider proxy configuration", () => {
  it("passes proxy options to ScraperEngine", async () => {
    // Dynamic import to avoid server-only mock issues
    const { GoogleMapsScraperProvider } = await import("./provider");

    const provider = new GoogleMapsScraperProvider({
      proxyUrl: "http://user:pass@proxy.example.com:8080",
      proxyRotation: false,
    });

    expect(provider.id).toBe("google-maps-scraper");
  });

  it("passes proxy list to ScraperEngine", async () => {
    const { GoogleMapsScraperProvider } = await import("./provider");

    const provider = new GoogleMapsScraperProvider({
      proxyList: [
        "http://proxy1.example.com:8080",
        "socks5://proxy2.example.com:1080",
      ],
      proxyRotation: true,
    });

    expect(provider.id).toBe("google-maps-scraper");
  });
});

describe("Environment proxy configuration", () => {
  it("parses proxy environment variables", async () => {
    const { parseServerEnvironment } = await import("../../lib/environment");

    const env = parseServerEnvironment({
      DATABASE_URL: "postgresql://localhost:5432/marketlens",
      SCRAPER_PROXY_URL: "http://user:pass@proxy.example.com:8080",
      SCRAPER_PROXY_LIST:
        "http://p1.example.com:8080,socks5://p2.example.com:1080",
      SCRAPER_PROXY_ROTATION: "true",
    });

    expect(env.SCRAPER_PROXY_URL).toBe(
      "http://user:pass@proxy.example.com:8080",
    );
    expect(env.SCRAPER_PROXY_LIST).toEqual([
      "http://p1.example.com:8080",
      "socks5://p2.example.com:1080",
    ]);
    expect(env.SCRAPER_PROXY_ROTATION).toBe(true);
  });

  it("handles empty proxy configuration", async () => {
    const { parseServerEnvironment } = await import("../../lib/environment");

    const env = parseServerEnvironment({
      DATABASE_URL: "postgresql://localhost:5432/marketlens",
    });

    expect(env.SCRAPER_PROXY_URL).toBeUndefined();
    expect(env.SCRAPER_PROXY_LIST).toEqual([]);
    expect(env.SCRAPER_PROXY_ROTATION).toBe(false);
  });
});
