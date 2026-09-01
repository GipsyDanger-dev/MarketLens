/**
 * Data types adapted from gosom/google-maps-scraper (MIT License).
 * https://github.com/gosom/google-maps-scraper
 *
 * Maps the Go Entry struct to TypeScript for MarketLens integration.
 */

export interface GmapsReview {
  name: string;
  profilePicture: string;
  rating: number;
  description: string;
  images: string[];
  when: string;
  reviewId: string;
  source: string;
  ratingScale: number;
  ratingFloat: number;
  authorUrl: string;
  postedAtUnixMicros: number;
  updatedAtUnixMicros: number;
  language: string;
  translatedLang: string;
  textOriginal: string;
  textTranslated: string;
  replyText?: string;
  publishedAt?: string;
}

export interface GmapsImage {
  title: string;
  image: string;
}

export interface GmapsLinkSource {
  link: string;
  source: string;
}

export interface GmapsOwner {
  id: string;
  name: string;
  link: string;
}

export interface GmapsAddress {
  borough: string;
  street: string;
  city: string;
  postalCode: string;
  state: string;
  country: string;
}

export interface GmapsOption {
  name: string;
  enabled: boolean;
  values?: string[];
}

export interface GmapsAbout {
  id: string;
  name: string;
  options: GmapsOption[];
}

/**
 * Raw entry extracted from Google Maps scraping.
 * Based on gosom/google-maps-scraper Entry struct.
 */
export interface GmapsEntry {
  inputId: string;
  link: string;
  cid: string;
  title: string;
  categories: string[];
  category: string;
  address: string;
  openHours: Record<string, string[]>;
  popularTimes: Record<string, Record<number, number>>;
  website: string;
  phone: string;
  plusCode: string;
  reviewCount: number;
  reviewRating: number;
  reviewsPerRating: Record<number, number>;
  latitude: number;
  longitude: number;
  status: string;
  description: string;
  reviewsLink: string;
  thumbnail: string;
  timezone: string;
  priceRange: string;
  dataId: string;
  streetViewUrl: string;
  placeId: string;
  images: GmapsImage[];
  reservations: GmapsLinkSource[];
  orderOnline: GmapsLinkSource[];
  menu: GmapsLinkSource;
  owner: GmapsOwner;
  completeAddress: GmapsAddress;
  creditCardsAccepted: string[];
  about: GmapsAbout[];
  userReviews: GmapsReview[];
  userReviewsExtended: GmapsReview[];
  emails: string[];
}

export interface GoogleMapsScraperProviderOptions {
  /** Path to chromium binary. If not set, uses bundled Playwright browser. */
  executablePath?: string;
  /** Request timeout in milliseconds. Default: 30000 */
  timeoutMilliseconds?: number;
  /** Maximum scroll depth for results. Default: 10 */
  maxDepth?: number;
  /** Language code. Default: "en" */
  langCode?: string;
  /** Whether to extract emails from business websites. Default: false */
  extractEmails?: boolean;
  /** Whether to extract extra reviews. Default: false */
  extractExtraReviews?: boolean;
  /** Custom fetch implementation for testing */
  launchOptions?: Record<string, unknown>;
  /** Custom date provider for testing */
  now?: () => Date;
  /** Sleep function for testing */
  sleep?: (milliseconds: number) => Promise<void>;
  /** Single proxy URL (e.g., "http://user:pass@host:port") */
  proxyUrl?: string;
  /** List of proxy URLs for rotation */
  proxyList?: string[];
  /** Enable proxy rotation between requests. Default: false */
  proxyRotation?: boolean;
  /** Maximum number of parallel scraping tasks. Default: 5 */
  concurrency?: number;
  /** Maximum number of browser instances in pool. Default: 2 */
  poolSize?: number;
  /** Maximum pages per browser instance. Default: 5 */
  maxPagesPerBrowser?: number;
}

export interface ProxyConfig {
  /** Single proxy URL */
  server: string;
  /** Optional proxy authentication */
  username?: string;
  /** Optional proxy authentication */
  password?: string;
}

export interface SearchJobResult {
  entries: GmapsEntry[];
  searchUrl: string;
}
