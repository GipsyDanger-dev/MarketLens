export interface ProviderCapabilities {
  textSearch: boolean;
  nearbySearch: boolean;
  details: boolean;
  ratings: boolean;
  reviewCounts: boolean;
  phone: boolean;
  website: boolean;
  openingHours: boolean;
}

export interface PlaceSearchRequest {
  query: string;
  category?: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  maxResults: number;
  pageToken?: string;
}

export interface PlaceCandidate {
  providerId: string;
  externalId: string;
  name: string | null;
  category: string | null;
  providerTypes: string[];
  address: string | null;
  city: string | null;
  district: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
  rating?: number | null;
  reviewCount?: number | null;
  phone: string | null;
  website: string | null;
  sourceUrl: string | null;
  businessStatus: string | null;
  collectedAt: Date;
  rawData: unknown;
}

export interface PlaceSearchResponse {
  places: PlaceCandidate[];
  nextPageToken?: string;
}

export interface ProviderHealth {
  providerId: string;
  healthy: boolean;
  checkedAt: Date;
  message?: string;
}

export interface PlaceProvider {
  readonly id: string;
  readonly name: string;
  readonly capabilities: ProviderCapabilities;
  search(request: PlaceSearchRequest): Promise<PlaceSearchResponse>;
  getDetails?(externalId: string): Promise<PlaceCandidate>;
  healthCheck?(): Promise<ProviderHealth>;
}
