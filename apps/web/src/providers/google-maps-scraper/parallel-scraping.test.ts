import { describe, it, expect, vi, beforeEach } from "vitest";
import { ScraperEngine } from "./scraper";

// Mock playwright-core
const mockPage = {
  goto: vi.fn().mockResolvedValue(undefined),
  waitForSelector: vi.fn().mockResolvedValue(undefined),
  waitForTimeout: vi.fn().mockResolvedValue(undefined),
  evaluate: vi.fn().mockResolvedValue([]),
  url: vi.fn().mockReturnValue("https://www.google.com/maps/search/coffee"),
  close: vi.fn().mockResolvedValue(undefined),
};

const mockContext = {
  newPage: vi.fn().mockResolvedValue(mockPage),
  close: vi.fn().mockResolvedValue(undefined),
};

const mockBrowser = {
  newContext: vi.fn().mockResolvedValue(mockContext),
  close: vi.fn().mockResolvedValue(undefined),
};

vi.mock("playwright-core", () => ({
  chromium: {
    launch: vi.fn().mockResolvedValue(mockBrowser),
  },
}));

describe("ScraperEngine Parallel Scraping", () => {
  let engine: ScraperEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    engine = new ScraperEngine({
      concurrency: 3,
      poolSize: 2,
      maxPagesPerBrowser: 2,
      timeoutMilliseconds: 10_000,
    });
  });

  describe("configuration", () => {
    it("should accept concurrency option", () => {
      const engineWithConcurrency = new ScraperEngine({
        concurrency: 10,
      });
      expect(engineWithConcurrency).toBeDefined();
    });

    it("should accept pool size option", () => {
      const engineWithPool = new ScraperEngine({
        poolSize: 5,
      });
      expect(engineWithPool).toBeDefined();
    });

    it("should accept max pages per browser option", () => {
      const engineWithPages = new ScraperEngine({
        maxPagesPerBrowser: 10,
      });
      expect(engineWithPages).toBeDefined();
    });
  });

  describe("getPoolStats", () => {
    it("should return pool statistics", () => {
      const stats = engine.getPoolStats();
      expect(stats).toHaveProperty("browsers");
      expect(stats).toHaveProperty("totalPages");
      expect(stats).toHaveProperty("busyPages");
      expect(stats).toHaveProperty("availablePages");
    });
  });

  describe("cleanup", () => {
    it("should cleanup browser pool", async () => {
      await engine.cleanup();
      const stats = engine.getPoolStats();
      expect(stats.browsers).toBe(0);
    });
  });
});

describe("ScraperEngine with default options", () => {
  it("should use default values for pool configuration", () => {
    const engine = new ScraperEngine();
    expect(engine).toBeDefined();

    const stats = engine.getPoolStats();
    expect(stats.browsers).toBe(0);
  });
});

describe("ScraperEngine chunk array", () => {
  it("should chunk array correctly", () => {
    const engine = new ScraperEngine({ concurrency: 2 });

    // Access private method through type assertion
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chunked = (engine as any).chunkArray([1, 2, 3, 4, 5], 2);
    expect(chunked).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("should handle empty array", () => {
    const engine = new ScraperEngine({ concurrency: 2 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chunked = (engine as any).chunkArray([], 2);
    expect(chunked).toEqual([]);
  });

  it("should handle array smaller than chunk size", () => {
    const engine = new ScraperEngine({ concurrency: 10 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chunked = (engine as any).chunkArray([1, 2], 10);
    expect(chunked).toEqual([[1, 2]]);
  });
});
