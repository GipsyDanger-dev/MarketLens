import { describe, expect, it } from "vitest";

import { haversineDistanceMeters, calculateDensityScore } from "./geospatial";
import { calculateBasicMarketMetrics } from "./market-metrics";

describe("market metrics", () => {
  it("calculates descriptive metrics and distributions from available values", () => {
    expect(
      calculateBasicMarketMetrics([
        { id: "1", rating: 4, reviewCount: 0 },
        { id: "2", rating: 5, reviewCount: 25 },
        { id: "3", rating: null, reviewCount: 100 },
      ]),
    ).toMatchObject({
      totalBusinesses: 3,
      averageRating: 4.5,
      medianRating: 4.5,
      averageReviewCount: 41.67,
      medianReviewCount: 25,
      ratingDistribution: [
        { label: "0-1", count: 0 },
        { label: "1-2", count: 0 },
        { label: "2-3", count: 0 },
        { label: "3-4", count: 0 },
        { label: "4-5", count: 2 },
      ],
    });
  });

  it("uses Haversine distance and businesses per square kilometre", () => {
    expect(
      haversineDistanceMeters(
        { latitude: -6.2, longitude: 106.8 },
        { latitude: -6.2, longitude: 106.8 },
      ),
    ).toBe(0);
    expect(calculateDensityScore(10, 1_000)).toBe(3.18);
    expect(calculateDensityScore(10, 0)).toBeNull();
  });
});
