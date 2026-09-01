/**
 * Browser Pool for Playwright instances.
 *
 * Manages a pool of browser instances and pages to enable parallel scraping
 * without the overhead of launching a new browser for each request.
 *
 * Based on the concept of connection pooling in database drivers.
 */

import type { ProxyConfig } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Browser = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BrowserContext = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Page = any;

export interface BrowserPoolOptions {
  /** Maximum number of browser instances in the pool. Default: 2 */
  maxBrowsers?: number;
  /** Maximum pages per browser instance. Default: 5 */
  maxPagesPerBrowser?: number;
  /** Timeout for page operations in milliseconds. Default: 30000 */
  timeoutMilliseconds?: number;
  /** Language code for browser context. Default: "en" */
  langCode?: string;
  /** Proxy configuration for all browsers in the pool */
  proxyConfig?: ProxyConfig | null;
  /** Custom launch options for Playwright */
  launchOptions?: Record<string, unknown>;
}

interface PoolEntry {
  browser: Browser;
  contexts: BrowserContext[];
  pages: Page[];
  busyPages: Set<Page>;
}

export class BrowserPool {
  private readonly maxBrowsers: number;
  private readonly maxPagesPerBrowser: number;
  private readonly timeoutMilliseconds: number;
  private readonly langCode: string;
  private readonly proxyConfig: ProxyConfig | null;
  private readonly launchOptions: Record<string, unknown>;

  private pools: PoolEntry[] = [];
  private isShuttingDown = false;

  constructor(options: BrowserPoolOptions = {}) {
    this.maxBrowsers = options.maxBrowsers ?? 2;
    this.maxPagesPerBrowser = options.maxPagesPerBrowser ?? 5;
    this.timeoutMilliseconds = options.timeoutMilliseconds ?? 30_000;
    this.langCode = options.langCode ?? "en";
    this.proxyConfig = options.proxyConfig ?? null;
    this.launchOptions = options.launchOptions ?? {};
  }

  /**
   * Acquire a page from the pool.
   * Creates a new browser/context if needed and available.
   * Waits for a page to become available if all are busy.
   */
  async acquire(): Promise<Page> {
    if (this.isShuttingDown) {
      throw new Error("Browser pool is shutting down");
    }

    // Try to get a free page from existing browsers
    for (const entry of this.pools) {
      const freePage = this.getFreePage(entry);
      if (freePage) {
        return freePage;
      }
    }

    // Try to create a new page in an existing browser
    for (const entry of this.pools) {
      if (this.canCreatePage(entry)) {
        return this.createPage(entry);
      }
    }

    // Try to create a new browser if under limit
    if (this.pools.length < this.maxBrowsers) {
      const entry = await this.createBrowser();
      return this.createPage(entry);
    }

    // Wait for a page to become available
    return this.waitForAvailablePage();
  }

  /**
   * Release a page back to the pool.
   * The page will be reused for future requests.
   */
  async release(page: Page): Promise<void> {
    for (const entry of this.pools) {
      if (entry.busyPages.has(page)) {
        entry.busyPages.delete(page);

        // Navigate to blank page to reset state
        try {
          await page.goto("about:blank", { timeout: 5000 });
        } catch {
          // Ignore navigation errors during release
        }

        return;
      }
    }
  }

  /**
   * Get the number of available (non-busy) pages.
   */
  getAvailableCount(): number {
    let count = 0;
    for (const entry of this.pools) {
      count += entry.pages.length - entry.busyPages.size;
    }
    return count;
  }

  /**
   * Get pool statistics.
   */
  getStats(): {
    browsers: number;
    totalPages: number;
    busyPages: number;
    availablePages: number;
  } {
    let totalPages = 0;
    let busyPages = 0;

    for (const entry of this.pools) {
      totalPages += entry.pages.length;
      busyPages += entry.busyPages.size;
    }

    return {
      browsers: this.pools.length,
      totalPages,
      busyPages,
      availablePages: totalPages - busyPages,
    };
  }

  /**
   * Cleanup all browsers and pages in the pool.
   */
  async cleanup(): Promise<void> {
    this.isShuttingDown = true;

    const cleanupPromises = this.pools.map(async (entry) => {
      // Close all pages
      for (const page of entry.pages) {
        try {
          await page.close();
        } catch {
          // Ignore close errors
        }
      }

      // Close all contexts
      for (const context of entry.contexts) {
        try {
          await context.close();
        } catch {
          // Ignore close errors
        }
      }

      // Close the browser
      try {
        await entry.browser.close();
      } catch {
        // Ignore close errors
      }
    });

    await Promise.allSettled(cleanupPromises);
    this.pools = [];
    // Keep isShuttingDown = true to prevent further use
  }

  /**
   * Get a free page from a pool entry.
   */
  private getFreePage(entry: PoolEntry): Page | null {
    for (const page of entry.pages) {
      if (!entry.busyPages.has(page)) {
        entry.busyPages.add(page);
        return page;
      }
    }
    return null;
  }

  /**
   * Check if a new page can be created in the pool entry.
   */
  private canCreatePage(entry: PoolEntry): boolean {
    return entry.pages.length < this.maxPagesPerBrowser;
  }

  /**
   * Create a new page in an existing pool entry.
   */
  private async createPage(entry: PoolEntry): Promise<Page> {
    const context = await entry.browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      viewport: { width: 1920, height: 1080 },
      locale: this.langCode,
    });

    const page = await context.newPage();
    entry.contexts.push(context);
    entry.pages.push(page);
    entry.busyPages.add(page);

    return page;
  }

  /**
   * Create a new browser and add it to the pool.
   */
  private async createBrowser(): Promise<PoolEntry> {
    const { chromium } = await import("playwright-core");

    const launchOptions: Record<string, unknown> = {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
      ],
      ...this.launchOptions,
    };

    // Add proxy if configured
    if (this.proxyConfig) {
      launchOptions.proxy = {
        server: this.proxyConfig.server,
        ...(this.proxyConfig.username && this.proxyConfig.password
          ? {
              username: this.proxyConfig.username,
              password: this.proxyConfig.password,
            }
          : {}),
      };
    }

    const browser = await chromium.launch(launchOptions);

    const entry: PoolEntry = {
      browser,
      contexts: [],
      pages: [],
      busyPages: new Set(),
    };

    this.pools.push(entry);
    return entry;
  }

  /**
   * Wait for a page to become available.
   * Polls every 100ms until a page is released.
   */
  private waitForAvailablePage(): Promise<Page> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Timeout waiting for available browser page"));
      }, 30_000);

      const check = () => {
        if (this.isShuttingDown) {
          clearTimeout(timeout);
          reject(new Error("Browser pool is shutting down"));
          return;
        }

        const page = this.findFreePage();
        if (page) {
          clearTimeout(timeout);
          resolve(page);
        } else {
          setTimeout(check, 100);
        }
      };

      check();
    });
  }

  /**
   * Find a free page across all pool entries.
   */
  private findFreePage(): Page | null {
    for (const entry of this.pools) {
      const page = this.getFreePage(entry);
      if (page) return page;
    }
    return null;
  }
}
