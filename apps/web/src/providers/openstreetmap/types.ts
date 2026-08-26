export type OverpassElementType = "node" | "way" | "relation";

export interface OverpassElement {
  type: OverpassElementType;
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
}

export interface OverpassResponse {
  elements: OverpassElement[];
}

export interface OpenStreetMapProviderOptions {
  endpoint?: string;
  fetch?: typeof globalThis.fetch;
  now?: () => Date;
  requestTimeoutSeconds?: number;
  maxResults?: number;
}
