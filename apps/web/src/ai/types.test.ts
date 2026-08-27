import { describe, expect, it } from "vitest";

import { marketInsightSchema } from "./types";

describe("marketInsightSchema", () => {
  it("accepts the complete, structured insight contract", () => {
    expect(
      marketInsightSchema.parse({
        marketSummary: ["The sample contains 12 businesses."],
        competitionInsights: ["Top scores reflect available place data."],
        opportunitySignals: ["A possible gap needs further validation."],
        risks: ["Ratings may be incomplete for some places."],
        recommendations: ["Validate demand through direct customer research."],
        limitations: ["This insight uses the collected dataset only."],
      }),
    ).toMatchObject({
      marketSummary: ["The sample contains 12 businesses."],
      limitations: ["This insight uses the collected dataset only."],
    });
  });

  it("rejects incomplete or invented fields", () => {
    expect(() =>
      marketInsightSchema.parse({
        marketSummary: ["Summary"],
        competitionInsights: [],
        opportunitySignals: [],
        risks: [],
        recommendations: [],
        extra: "not allowed",
      }),
    ).toThrow();
  });
});
