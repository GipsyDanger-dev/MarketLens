import { afterEach, expect, it, vi } from "vitest";
import { BrowserPool } from "./browser-pool";
import { ScraperEngine } from "./scraper";

afterEach(() => vi.restoreAllMocks());

it("visits at most the result budget and bounds scrolling before detail extraction", async () => {
  const page = { goto: vi.fn().mockResolvedValue(undefined) };
  vi.spyOn(BrowserPool.prototype, "acquire").mockResolvedValue(page);
  const release = vi
    .spyOn(BrowserPool.prototype, "release")
    .mockResolvedValue();
  const engine = new ScraperEngine({ maxDepth: 4 });
  const internals = engine as unknown as {
    dismissCookieConsent: () => Promise<void>;
    waitForResults: () => Promise<void>;
    scrollResults: () => Promise<void>;
    extractPlaceUrls: () => Promise<string[]>;
    extractPlaceData: (page: unknown, url: string) => Promise<null>;
  };
  vi.spyOn(internals, "dismissCookieConsent").mockResolvedValue();
  vi.spyOn(internals, "waitForResults").mockResolvedValue();
  const scroll = vi.spyOn(internals, "scrollResults").mockResolvedValue();
  const urls = Array.from(
    { length: 20 },
    (_, i) => `https://www.google.com/maps/place/${i}`,
  );
  vi.spyOn(internals, "extractPlaceUrls").mockResolvedValue(urls);
  const extract = vi
    .spyOn(internals, "extractPlaceData")
    .mockResolvedValue(null);

  await engine.search("cafe", { maxResults: 3, scrollDepth: 200 });

  expect(scroll).toHaveBeenCalledWith(page, 4, 3);
  expect(extract).toHaveBeenCalledTimes(3);
  expect(extract.mock.calls.map((args) => args[1])).toEqual(urls.slice(0, 3));
  expect(release).toHaveBeenCalledTimes(4);
});
