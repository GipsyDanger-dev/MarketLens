import { describe, expect, it } from "vitest";

import {
  calculateDuplicateConfidence,
  findProbableCrossProviderDuplicates,
  isPrimaryDuplicate,
  PROBABLE_DUPLICATE_MINIMUM_CONFIDENCE,
} from "./deduplication";

const subject = {
  id: "place-1",
  providerId: "openstreetmap",
  externalId: "node/42",
  normalizedName: "kopi kita kemang",
  category: "cafe",
  address: "jalan kemang raya nomor 10",
  latitude: -6.2617,
  longitude: 106.8145,
};

describe("place deduplication", () => {
  it("uses provider plus external ID as the primary identity", () => {
    expect(
      isPrimaryDuplicate(subject, {
        providerId: subject.providerId,
        externalId: subject.externalId,
      }),
    ).toBe(true);
    expect(
      isPrimaryDuplicate(subject, {
        providerId: "google-places",
        externalId: subject.externalId,
      }),
    ).toBe(false);
  });

  it("scores exact names, nearby locations, categories, and addresses", () => {
    const confidence = calculateDuplicateConfidence(subject, {
      ...subject,
      id: "place-2",
      providerId: "google-places",
      externalId: "ChIJ42",
      latitude: -6.26171,
    });

    expect(confidence).toMatchObject({
      score: 1,
      nameSimilarity: 1,
      reasons: [
        "exact-normalized-name",
        "within-25m",
        "same-category",
        "same-address",
      ],
    });
  });

  it("returns only probable cross-provider duplicates and never merges them", () => {
    const results = findProbableCrossProviderDuplicates(subject, [
      {
        ...subject,
        id: "place-2",
        providerId: "google-places",
        externalId: "ChIJ42",
        normalizedName: "kopi kita",
        latitude: -6.26171,
      },
      {
        ...subject,
        id: "place-3",
        providerId: "google-places",
        externalId: "ChIJ99",
        normalizedName: "kopi lain",
        address: "jalan jauh nomor 5",
        latitude: -6.3,
      },
      { ...subject, id: "place-4", externalId: "node/99" },
    ]);

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      place: { id: "place-2" },
    });
    expect(results[0]?.confidence.score).toBeGreaterThanOrEqual(
      PROBABLE_DUPLICATE_MINIMUM_CONFIDENCE,
    );
  });
});
