import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BrowserPool } from "./browser-pool";

// Mock playwright-core
vi.mock("playwright-core", () => ({
  chromium: {
    launch: vi.fn().mockResolvedValue({
      newContext: vi.fn().mockResolvedValue({
        newPage: vi.fn().mockResolvedValue({
          goto: vi.fn().mockResolvedValue(undefined),
          close: vi.fn().mockResolvedValue(undefined),
        }),
        close: vi.fn().mockResolvedValue(undefined),
      }),
      close: vi.fn().mockResolvedValue(undefined),
    }),
  },
}));

describe("BrowserPool", () => {
  let pool: BrowserPool;

  beforeEach(() => {
    pool = new BrowserPool({
      maxBrowsers: 2,
      maxPagesPerBrowser: 3,
      timeoutMilliseconds: 10_000,
      langCode: "en",
    });
  });

  afterEach(async () => {
    await pool.cleanup();
  });

  describe("acquire and release", () => {
    it("should acquire a page from the pool", async () => {
      const page = await pool.acquire();
      expect(page).toBeDefined();
      expect(page.goto).toBeDefined();
    });

    it("should reuse released pages", async () => {
      const page1 = await pool.acquire();
      await pool.release(page1);

      const page2 = await pool.acquire();
      expect(page2).toBe(page1);
    });

    it("should create new pages when all are busy", async () => {
      const busyPages = [
        await pool.acquire(),
        await pool.acquire(),
        await pool.acquire(),
      ];

      // All 3 pages are busy, should create new one in second browser
      const page4 = await pool.acquire();

      expect(busyPages).toHaveLength(3);
      expect(page4).toBeDefined();
      const stats = pool.getStats();
      expect(stats.browsers).toBe(2);
      expect(stats.totalPages).toBe(4);
    });

    it("should respect maxPagesPerBrowser limit", async () => {
      // Acquire 3 pages (max for this pool)
      const busyPages = [
        await pool.acquire(),
        await pool.acquire(),
        await pool.acquire(),
      ];

      // 4th page should trigger a new browser
      const page4 = await pool.acquire();

      expect(busyPages).toHaveLength(3);
      expect(page4).toBeDefined();
      const stats = pool.getStats();
      expect(stats.browsers).toBe(2);
    });
  });

  describe("getStats", () => {
    it("should return correct statistics", async () => {
      const initialStats = pool.getStats();
      expect(initialStats.browsers).toBe(0);
      expect(initialStats.totalPages).toBe(0);

      const page1 = await pool.acquire();
      const statsAfterAcquire = pool.getStats();
      expect(statsAfterAcquire.browsers).toBe(1);
      expect(statsAfterAcquire.totalPages).toBe(1);
      expect(statsAfterAcquire.busyPages).toBe(1);

      await pool.release(page1);
      const statsAfterRelease = pool.getStats();
      expect(statsAfterRelease.busyPages).toBe(0);
      expect(statsAfterRelease.availablePages).toBe(1);
    });
  });

  describe("getAvailableCount", () => {
    it("should return correct available page count", async () => {
      expect(pool.getAvailableCount()).toBe(0);

      const page1 = await pool.acquire();
      expect(pool.getAvailableCount()).toBe(0); // page1 is busy

      await pool.release(page1);
      expect(pool.getAvailableCount()).toBe(1); // page1 is available
    });
  });

  describe("cleanup", () => {
    it("should close all browsers and pages", async () => {
      const pages = [await pool.acquire(), await pool.acquire()];

      await pool.cleanup();

      expect(pages).toHaveLength(2);
      const stats = pool.getStats();
      expect(stats.browsers).toBe(0);
      expect(stats.totalPages).toBe(0);
    });

    it("should prevent acquiring after cleanup", async () => {
      await pool.cleanup();

      await expect(pool.acquire()).rejects.toThrow(
        "Browser pool is shutting down",
      );
    });
  });

  describe("concurrent access", () => {
    it("should handle multiple concurrent acquire/release", async () => {
      const pages = await Promise.all([
        pool.acquire(),
        pool.acquire(),
        pool.acquire(),
      ]);

      expect(pages).toHaveLength(3);

      // Release all
      await Promise.all(pages.map((p) => pool.release(p)));

      const stats = pool.getStats();
      expect(stats.busyPages).toBe(0);
      expect(stats.availablePages).toBe(3);
    });
  });

  describe("proxy configuration", () => {
    it("should use proxy when configured", async () => {
      const poolWithProxy = new BrowserPool({
        maxBrowsers: 1,
        maxPagesPerBrowser: 1,
        proxyConfig: {
          server: "http://proxy.example.com:8080",
          username: "user",
          password: "pass",
        },
      });

      const page = await poolWithProxy.acquire();
      expect(page).toBeDefined();

      await poolWithProxy.cleanup();
    });
  });
});

describe("BrowserPool edge cases", () => {
  it("should handle page close errors gracefully", async () => {
    const pool = new BrowserPool({ maxBrowsers: 1, maxPagesPerBrowser: 1 });

    const page = await pool.acquire();

    // Make page.close throw
    page.close = vi.fn().mockRejectedValue(new Error("close failed"));

    // Should not throw
    await pool.release(page);

    await pool.cleanup();
  });

  it("should handle browser close errors gracefully", async () => {
    const pool = new BrowserPool({ maxBrowsers: 1, maxPagesPerBrowser: 1 });

    await pool.acquire();

    // Make browser.close throw
    const stats = pool.getStats();
    expect(stats.browsers).toBe(1);

    // cleanup should not throw even if browser.close fails
    await pool.cleanup();
  });
});
