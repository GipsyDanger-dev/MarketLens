export interface GooglePlacesProviderOptions {
  apiKey: string;
  fetch?: typeof globalThis.fetch;
  now?: () => Date;
  endpoint?: string;
}

export interface GooglePlace {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  types?: string[];
  rating?: number;
  userRatingCount?: number;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
  businessStatus?: string;
}

export interface GoogleTextSearchResponse {
  places?: GooglePlace[];
  nextPageToken?: string;
}
