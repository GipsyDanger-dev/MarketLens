/**
 * Playwright-based Google Maps scraper engine.
 *
 * Adapted from gosom/google-maps-scraper (MIT License).
 * Uses headless Chromium to search Google Maps and extract business data.
 *
 * Supports browser pooling and parallel scraping for improved performance.
 */

import type { GmapsEntry, ProxyConfig, SearchJobResult } from "./types";
import { BrowserPool } from "./browser-pool";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Page = any;

interface ScraperEngineOptions {
  timeoutMilliseconds?: number;
  maxDepth?: number;
  langCode?: string;
  extractEmails?: boolean;
  now?: () => Date;
  sleep?: (milliseconds: number) => Promise<void>;
  proxyUrl?: string;
  proxyList?: string[];
  proxyRotation?: boolean;
  /** Maximum number of parallel scraping tasks. Default: 5 */
  concurrency?: number;
  /** Maximum number of browser instances in pool. Default: 2 */
  poolSize?: number;
  /** Maximum pages per browser instance. Default: 5 */
  maxPagesPerBrowser?: number;
}

const DEFAULT_TIMEOUT = 30_000;
const DEFAULT_MAX_DEPTH = 10;
const DEFAULT_LANG = "en";
const DEFAULT_CONCURRENCY = 8;
const DEFAULT_POOL_SIZE = 3;
const DEFAULT_MAX_PAGES = 10;

export class ScraperEngine {
  private readonly timeoutMilliseconds: number;
  private readonly maxDepth: number;
  private readonly langCode: string;
  private readonly extractEmails: boolean;
  private readonly now: () => Date;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly proxyList: string[];
  private readonly proxyRotation: boolean;
  private proxyIndex = 0;
  private readonly concurrency: number;
  private readonly pool: BrowserPool;

  constructor(options: ScraperEngineOptions = {}) {
    this.timeoutMilliseconds = options.timeoutMilliseconds ?? DEFAULT_TIMEOUT;
    this.maxDepth = options.maxDepth ?? DEFAULT_MAX_DEPTH;
    this.langCode = options.langCode ?? DEFAULT_LANG;
    this.extractEmails = options.extractEmails ?? false;
    this.now = options.now ?? (() => new Date());
    this.sleep = options.sleep ?? defaultSleep;
    this.proxyRotation = options.proxyRotation ?? false;
    this.concurrency = options.concurrency ?? DEFAULT_CONCURRENCY;

    // Build proxy list from single URL or list
    if (options.proxyList && options.proxyList.length > 0) {
      this.proxyList = options.proxyList;
    } else if (options.proxyUrl) {
      this.proxyList = [options.proxyUrl];
    } else {
      this.proxyList = [];
    }

    // Initialize browser pool
    this.pool = new BrowserPool({
      maxBrowsers: options.poolSize ?? DEFAULT_POOL_SIZE,
      maxPagesPerBrowser: options.maxPagesPerBrowser ?? DEFAULT_MAX_PAGES,
      timeoutMilliseconds: this.timeoutMilliseconds,
      langCode: this.langCode,
      proxyConfig: this.proxyList.length > 0 ? this.getProxyForRequest() : null,
    });
  }

  /**
   * Get the next proxy URL from the rotation list.
   * Returns null if no proxies configured.
   */
  private getNextProxy(): ProxyConfig | null {
    if (this.proxyList.length === 0) return null;

    const proxyUrl = this.proxyList[this.proxyIndex];
    this.proxyIndex = (this.proxyIndex + 1) % this.proxyList.length;

    return parseProxyUrl(proxyUrl);
  }

  /**
   * Get a proxy config for the current request.
   * If rotation is enabled, returns the next proxy in the list.
   * Otherwise, returns the first proxy (or null if none configured).
   */
  private getProxyForRequest(): ProxyConfig | null {
    if (this.proxyList.length === 0) return null;

    if (this.proxyRotation) {
      return this.getNextProxy();
    }

    // Without rotation, always use the first proxy
    return parseProxyUrl(this.proxyList[0]);
  }

  /**
   * Launch browser, search Google Maps, and extract business entries.
   * Uses browser pooling and parallel scraping for improved performance.
   */
  async search(
    query: string,
    options: {
      latitude?: number;
      longitude?: number;
      zoom?: number;
      scrollDepth?: number;
    } = {},
  ): Promise<SearchJobResult> {
    // Use provided scrollDepth or default
    const maxDepth = options.scrollDepth ?? this.maxDepth;

    // Acquire a page from the pool
    const page = await this.pool.acquire();

    try {
      const searchUrl = this.buildSearchUrl(query, options);

      await page.goto(searchUrl, {
        waitUntil: "domcontentloaded",
        timeout: this.timeoutMilliseconds,
      });

      // Dismiss cookie consent if present
      await this.dismissCookieConsent(page);

      // Wait for results to load
      await this.waitForResults(page);

      // Scroll to load more results using the specified scrollDepth
      await this.scrollResults(page, maxDepth);

      // Extract place URLs from the feed
      const placeUrls = await this.extractPlaceUrls(page);

      // Visit each place and extract data (with parallel extraction)
      const entries = await this.extractPlacesParallel(page, placeUrls);

      return { entries, searchUrl };
    } finally {
      // Release the page back to the pool
      await this.pool.release(page);
    }
  }

  /**
   * Extract places in parallel using a concurrency limiter.
   */
  private async extractPlacesParallel(
    searchPage: Page,
    placeUrls: string[],
  ): Promise<GmapsEntry[]> {
    const entries: GmapsEntry[] = [];
    const chunks = this.chunkArray(placeUrls, this.concurrency);

    for (const chunk of chunks) {
      const chunkResults = await Promise.allSettled(
        chunk.map(async (url) => {
          // Acquire a page from the pool for each parallel task
          const page = await this.pool.acquire();
          try {
            const entry = await this.extractPlaceData(page, url);
            if (entry) {
              // Extract emails from business website if enabled
              if (this.extractEmails && entry.website) {
                entry.emails = await this.extractEmailsFromWebsite(
                  page,
                  entry.website,
                );
              }
              return entry;
            }
            return null;
          } catch {
            return null;
          } finally {
            await this.pool.release(page);
          }
        }),
      );

      for (const result of chunkResults) {
        if (result.status === "fulfilled" && result.value) {
          entries.push(result.value);
        }
      }
    }

    return entries;
  }

  /**
   * Split an array into chunks of specified size.
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Get pool statistics.
   */
  getPoolStats(): {
    browsers: number;
    totalPages: number;
    busyPages: number;
    availablePages: number;
  } {
    return this.pool.getStats();
  }

  /**
   * Cleanup the browser pool.
   */
  async cleanup(): Promise<void> {
    await this.pool.cleanup();
  }

  private buildSearchUrl(
    query: string,
    options: { latitude?: number; longitude?: number; zoom?: number },
  ): string {
    const encodedQuery = encodeURIComponent(query);
    const base = "https://www.google.com/maps/search";

    if (options.latitude !== undefined && options.longitude !== undefined) {
      const zoom = options.zoom ?? 15;
      return `${base}/${encodedQuery}/@${options.latitude},${options.longitude},${zoom}z?hl=${this.langCode}`;
    }

    return `${base}/${encodedQuery}?hl=${this.langCode}`;
  }

  private async dismissCookieConsent(page: Page): Promise<void> {
    try {
      // Try consent form first
      const consentForm = page.locator('form[action*="consent.google"]');
      if ((await consentForm.count()) > 0) {
        const button = consentForm.locator('button, input[type="submit"]');
        if ((await button.count()) > 0) {
          await button.first().click();
          return;
        }
      }

      // Try reject/decline buttons
      const buttons = page.locator('button, input[type="submit"]');
      const count = await buttons.count();
      for (let i = 0; i < count; i++) {
        const text = (await buttons.nth(i).textContent()) ?? "";
        const lower = text.toLowerCase();
        if (
          lower.includes("reject") ||
          lower.includes("decline") ||
          lower.includes("ablehnen")
        ) {
          await buttons.nth(i).click();
          return;
        }
      }
    } catch {
      // Cookie consent is optional
    }
  }

  private async waitForResults(page: Page): Promise<void> {
    try {
      await page.waitForSelector('div[role="feed"]', {
        timeout: this.timeoutMilliseconds / 2,
      });
    } catch {
      // Single result or no feed - check if we redirected to a place page
      const url = page.url();
      if (url.includes("/maps/place/")) {
        return; // Single result, will be handled by extractPlaceData
      }
    }
  }

  private async scrollResults(page: Page, maxDepth?: number): Promise<void> {
    const feedSelector = 'div[role="feed"]';
    let previousHeight = 0;
    const depth = maxDepth ?? this.maxDepth;

    for (let i = 0; i < depth; i++) {
      try {
        const height = await page.evaluate((sel: string) => {
          const el = document.querySelector(sel);
          if (!el) return 0;
          el.scrollTop = el.scrollHeight;
          return el.scrollHeight;
        }, feedSelector);

        if (height === previousHeight) break;
        previousHeight = height;

        await this.sleep(1000 + i * 200);
      } catch {
        break;
      }
    }
  }

  private async extractPlaceUrls(page: Page): Promise<string[]> {
    // Check if we're on a single place page
    if (page.url().includes("/maps/place/")) {
      return [page.url()];
    }

    return page.evaluate(() => {
      const links = document.querySelectorAll(
        'div[role="feed"] div[jsaction] > a',
      );
      const urls: string[] = [];
      for (const link of links) {
        const href = link.getAttribute("href");
        if (href && href.includes("/maps/place/")) {
          urls.push(href);
        }
      }
      return [...new Set(urls)]; // Deduplicate
    });
  }

  private async extractPlaceData(
    page: Page,
    url: string,
  ): Promise<GmapsEntry | null> {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: this.timeoutMilliseconds,
    });

    // Wait for place data to load
    await page.waitForTimeout(2000);

    // Extract data from the page using JavaScript evaluation
    const entry = await page.evaluate(() => {
      const getText = (selector: string): string => {
        const el = document.querySelector(selector);
        return el?.textContent?.trim() ?? "";
      };

      // Extract basic info
      const title =
        getText("h1.DUwDvf") || getText('h1[class*="header"]') || getText("h1");

      // Extract rating - try multiple selectors
      let rating = 0;
      const ratingSelectors = [
        'div.F7nice span[aria-hidden="true"]',
        "span.F7nice",
        'div[role="img"][aria-label*="star"]',
        'span[aria-label*="star"]',
      ];
      for (const selector of ratingSelectors) {
        const ratingEl = document.querySelector(selector);
        if (ratingEl) {
          const text = ratingEl.textContent?.trim() ?? "";
          const parsed = parseFloat(text);
          if (parsed > 0 && parsed <= 5) {
            rating = parsed;
            break;
          }
        }
      }

      // Extract review count - try multiple selectors
      let reviewCount = 0;
      const reviewSelectors = [
        "div.F7nice span[aria-label]",
        'span[aria-label*="review"]',
        'button[jsaction*="review"] span',
      ];
      for (const selector of reviewSelectors) {
        const reviewEl = document.querySelector(selector);
        if (reviewEl) {
          const ariaLabel = reviewEl.getAttribute("aria-label") ?? "";
          const text = ariaLabel || (reviewEl.textContent ?? "");
          const match = text.match(/(\d[\d,]*)/);
          if (match) {
            reviewCount = parseInt(match[1].replace(/,/g, ""), 10);
            if (reviewCount > 0) break;
          }
        }
      }

      // Extract address
      const address =
        getText('button[data-item-id="address"] div.Io6YTe') ||
        getText('div[data-item-id="address"]') ||
        getText('button[data-item-id*="address"]');

      // Extract phone
      const phone =
        getText('button[data-item-id*="phone"] div.Io6YTe') ||
        getText('div[data-item-id*="phone"]') ||
        getText('button[data-item-id*="phone"]');

      // Extract website
      const websiteEl = document.querySelector('a[data-item-id="authority"]');
      const website = websiteEl?.getAttribute("href") ?? "";

      // Extract coordinates - try multiple methods
      let latitude = 0;
      let longitude = 0;

      // Method 1: From URL (@lat,lng format)
      const urlMatch = window.location.href.match(
        /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      );
      if (urlMatch) {
        latitude = parseFloat(urlMatch[1]);
        longitude = parseFloat(urlMatch[2]);
      }

      // Method 2: From URL data parameters (!3dlat!4dlng format)
      if (latitude === 0 && longitude === 0) {
        const dataMatch = window.location.href.match(
          /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/,
        );
        if (dataMatch) {
          latitude = parseFloat(dataMatch[1]);
          longitude = parseFloat(dataMatch[2]);
        }
      }

      // Method 3: From data attributes if URL didn't work
      if (latitude === 0 && longitude === 0) {
        const latEl = document.querySelector("[data-lat]");
        const lngEl = document.querySelector("[data-lng]");
        if (latEl && lngEl) {
          latitude = parseFloat(latEl.getAttribute("data-lat") ?? "0");
          longitude = parseFloat(lngEl.getAttribute("data-lng") ?? "0");
        }
      }

      // Method 4: From meta tags
      if (latitude === 0 && longitude === 0) {
        const geoMeta = document.querySelector(
          'meta[property="og:latitude"], meta[name="geo.position"]',
        );
        if (geoMeta) {
          const content = geoMeta.getAttribute("content") ?? "";
          const parts = content.split(";").map((s: string) => s.trim());
          if (parts.length >= 2) {
            latitude = parseFloat(parts[0]);
            longitude = parseFloat(parts[parts.length - 1]);
          }
        }
      }

      // Extract category
      const category =
        getText('button[jsaction*="category"]') || getText("span.DkEaL") || "";

      // Extract opening hours
      const hoursButton = document.querySelector('button[data-item-id="oh"]');
      const openHours: Record<string, string[]> = {};
      if (hoursButton) {
        const rows = document.querySelectorAll("table.eK4R0e tr");
        for (const row of rows) {
          const cells = row.querySelectorAll("td");
          if (cells.length >= 2) {
            const day = cells[0]?.textContent?.trim() ?? "";
            const hours = cells[1]?.textContent?.trim() ?? "";
            if (day && hours) {
              openHours[day] = [hours];
            }
          }
        }
      }

      // Extract place ID from URL
      const placeIdMatch = window.location.href.match(/!1s([^!]+)/);
      const placeId = placeIdMatch ? placeIdMatch[1] : "";

      return {
        title,
        category,
        address,
        phone,
        website,
        latitude,
        longitude,
        rating,
        reviewCount,
        openHours,
        placeId,
        link: window.location.href,
      };
    });

    if (!entry.title) return null;

    return {
      inputId: "",
      link: entry.link,
      cid: "",
      title: entry.title,
      categories: entry.category ? [entry.category] : [],
      category: entry.category,
      address: entry.address,
      openHours: entry.openHours,
      popularTimes: {},
      website: entry.website,
      phone: entry.phone,
      plusCode: "",
      reviewCount: entry.reviewCount,
      reviewRating: entry.rating,
      reviewsPerRating: {},
      latitude: entry.latitude,
      longitude: entry.longitude,
      status: "",
      description: "",
      reviewsLink: "",
      thumbnail: "",
      timezone: "",
      priceRange: "",
      dataId: "",
      streetViewUrl: "",
      placeId: entry.placeId,
      images: [],
      reservations: [],
      orderOnline: [],
      menu: { link: "", source: "" },
      owner: { id: "", name: "", link: "" },
      completeAddress: {
        borough: "",
        street: "",
        city: "",
        postalCode: "",
        state: "",
        country: "",
      },
      creditCardsAccepted: [],
      about: [],
      userReviews: [],
      userReviewsExtended: [],
      emails: [],
    };
  }

  /**
   * Extract email addresses from a business website.
   * Visits the website and looks for email patterns in the HTML.
   */
  private async extractEmailsFromWebsite(
    page: Page,
    websiteUrl: string,
  ): Promise<string[]> {
    // Skip social media URLs - they won't have business emails
    if (isSocialMediaUrl(websiteUrl)) return [];

    try {
      // Navigate to the website
      await page.goto(websiteUrl, {
        waitUntil: "domcontentloaded",
        timeout: Math.min(this.timeoutMilliseconds / 2, 15_000),
      });

      // Wait a bit for dynamic content
      await this.sleep(1000);

      // Extract emails from the page
      const emails = await page.evaluate(() => {
        const content = document.body?.innerText ?? "";
        const html = document.documentElement?.innerHTML ?? "";

        // Combine text and HTML for email extraction
        const fullContent = `${content}\n${html}`;

        // Email regex pattern
        const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
        const found = fullContent.match(emailRegex) ?? [];

        // Filter out common false positives
        return [...new Set(found)].filter((email) => {
          const lower = email.toLowerCase();
          // Skip image files, script files, etc.
          if (
            lower.endsWith(".png") ||
            lower.endsWith(".jpg") ||
            lower.endsWith(".jpeg") ||
            lower.endsWith(".gif") ||
            lower.endsWith(".svg") ||
            lower.endsWith(".js") ||
            lower.endsWith(".css")
          ) {
            return false;
          }
          // Skip common placeholder emails
          if (
            lower.includes("example.com") ||
            lower.includes("test.com") ||
            lower.includes("sentry.io") ||
            lower.includes("wixpress.com")
          ) {
            return false;
          }
          return true;
        });
      });

      return emails;
    } catch {
      // If we can't visit the website, return empty
      return [];
    }
  }
}

function defaultSleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/**
 * Check if a URL is a social media platform.
 * Social media URLs are skipped for email extraction.
 */
function isSocialMediaUrl(url: string): boolean {
  const lower = url.toLowerCase();
  const socialDomains = [
    "facebook.com",
    "instagram.com",
    "twitter.com",
    "x.com",
    "linkedin.com",
    "tiktok.com",
    "youtube.com",
    "pinterest.com",
    "snapchat.com",
    "reddit.com",
  ];
  return socialDomains.some((domain) => lower.includes(domain));
}

/**
 * Parse a proxy URL string into a ProxyConfig object.
 * Supports formats:
 * - http://host:port
 * - http://user:pass@host:port
 * - socks5://host:port
 * - socks5://user:pass@host:port
 */
function parseProxyUrl(proxyUrl: string): ProxyConfig {
  try {
    const url = new URL(proxyUrl);

    return {
      server: `${url.protocol}//${url.hostname}:${url.port}`,
      username: url.username || undefined,
      password: url.password || undefined,
    };
  } catch {
    // If URL parsing fails, return as-is without auth
    return { server: proxyUrl };
  }
}
