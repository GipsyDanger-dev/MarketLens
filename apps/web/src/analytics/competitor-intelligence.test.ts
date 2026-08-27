import { describe, expect, it } from "vitest";

import { nearbyCompetitors, scoreNarrative } from "./competitor-intelligence";

describe("competitor intelligence", () => {
  it("orders nearby competitors by geographic distance", () => {
    const subject = {
      id: "a",
      name: "A",
      latitude: -6.2,
      longitude: 106.8,
      componentScores: {},
    };
    expect(
      nearbyCompetitors(
        subject,
        [
          subject,
          { ...subject, id: "b", latitude: -6.201 },
          { ...subject, id: "c", latitude: -6.3 },
        ],
        500,
      ).map(({ place }) => place.id),
    ).toEqual(["b"]);
  });

  it("labels strong and weak score components", () => {
    expect(
      scoreNarrative({ ratingStrength: 0.8, reviewAuthority: 0.2 }),
    ).toEqual({
      strengths: ["ratingStrength"],
      weaknesses: ["reviewAuthority"],
    });
  });
});
