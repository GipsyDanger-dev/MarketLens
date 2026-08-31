import { describe, expect, it } from "vitest";

import { researchReportToCsv } from "./csv";
import type { ResearchReport } from "./types";

const report: ResearchReport = {
  metadata: {
    researchId: "r1",
    name: "Coffee",
    query: "coffee",
    category: null,
    location: "Malang",
    generatedAt: "2026-08-28T00:00:00.000Z",
    collectedAt: null,
    methodology: "test",
  },
  metrics: {
    totalBusinesses: 1,
    averageRating: null,
    medianRating: null,
    averageReviewCount: null,
    medianReviewCount: null,
    competitionScore: null,
    densityScore: null,
    opportunitySignals: [],
  },
  competitors: [],
  places: [
    {
      name: "Kopi, Kita",
      category: "cafe",
      address: "Jl. Test",
      rating: 4.5,
      reviewCount: 8,
      phone: "+62 341 123456",
      website: "https://kopikita.example",
      socialLinks: { instagram: "https://www.instagram.com/kopikita" },
      sourceUrl: "https://www.openstreetmap.org/node/42",
      latitude: -7.9,
      longitude: 112.6,
    },
  ],
  aiInsight: null,
  limitations: [],
};

describe("researchReportToCsv", () => {
  it("exports canonical place data with escaped CSV fields", () => {
    expect(researchReportToCsv(report)).toContain(
      '"Kopi, Kita",cafe,Jl. Test,4.5,8,+62 341 123456,https://kopikita.example,instagram: https://www.instagram.com/kopikita,https://www.openstreetmap.org/node/42,-7.9,112.6,',
    );
  });
});
