import { z } from "zod";

const optionalText = z.string().trim().min(1).max(500).nullable().optional();
const optionalUrl = z.url().max(2_000).nullable().optional();

export const normalizedPlaceSchema = z.object({
  providerId: z.string().trim().min(1).max(80),
  externalId: z.string().trim().min(1).max(500),
  name: z.string().trim().min(1).max(500),
  normalizedName: z.string().trim().min(1).max(500),
  category: optionalText,
  providerTypes: z.array(z.string().trim().min(1).max(120)).default([]),
  address: optionalText,
  city: optionalText,
  district: optionalText,
  country: optionalText,
  latitude: z.number().finite().gte(-90).lte(90),
  longitude: z.number().finite().gte(-180).lte(180),
  rating: z.number().finite().gte(0).lte(5).nullable().optional(),
  reviewCount: z.number().int().nonnegative().nullable().optional(),
  phone: z.string().trim().min(1).max(80).nullable().optional(),
  website: optionalUrl,
  sourceUrl: optionalUrl,
  businessStatus: z.string().trim().min(1).max(120).nullable().optional(),
  collectedAt: z.coerce.date().default(() => new Date()),
});

export type NormalizedPlace = z.infer<typeof normalizedPlaceSchema>;
