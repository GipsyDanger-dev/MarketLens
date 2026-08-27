import { describe, expect, it } from "vitest";

import { calculateCompetitorScores } from "./competition-scoring";
import { calculateOpportunitySignals } from "./opportunity-signals";

describe("competition scoring", () => {
  it("ranks places with explainable, reweighted components", () => {
    const scores = calculateCompetitorScores(
      [
        {
          id: "strong",
          name: "Strong",
          rating: 5,
          reviewCount: 100,
          latitude: -6.2,
          longitude: 106.8,
        },
        {
          id: "weak",
          name: "Weak",
          rating: null,
          reviewCount: null,
          latitude: -6.201,
          longitude: 106.8,
        },
      ],
      { latitude: -6.2, longitude: 106.8, radiusMeters: 1_000 },
    );

    expect(scores[0]).toMatchObject({
      placeId: "strong",
      componentScores: { ratingStrength: 1, reviewAuthority: 1 },
    });
    expect(scores[1]?.explanation).toContain("reweights available dimensions");
  });

  it("returns cautious opportunity signals", () => {
    expect(
      calculateOpportunitySignals({
        totalBusinesses: 2,
        densityScore: 3,
        averageCompetitionScore: 0.3,
        ratedBusinesses: 0,
      }).map((signal) => signal.id),
    ).toEqual(["low-density", "low-competition", "limited-rating-data"]);
  });
});
