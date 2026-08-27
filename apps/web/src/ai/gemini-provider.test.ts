import { describe, expect, it, vi } from "vitest";

import { AiProviderError } from "./errors";
import { buildInsightPrompt, GeminiAiProvider } from "./gemini-provider";
import type { InsightRequest } from "./types";

const request: InsightRequest = {
  researchId: "research-1",
  query: "coffee shops",
  category: "Cafe",
  location: "Malang",
  collectedAt: new Date("2026-08-28T00:00:00.000Z"),
  metrics: {
    totalBusinesses: 12,
    averageRating: 4.2,
    medianRating: 4.3,
    averageReviewCount: 77,
    medianReviewCount: 31,
    competitionScore: 0.63,
    densityScore: 0.48,
  },
  topCompetitors: [],
  opportunitySignals: ["Possible geographic gap."],
};

const insight = {
  marketSummary: ["The collected sample contains 12 businesses."],
  competitionInsights: ["Scores use the available place data."],
  opportunitySignals: ["A possible gap needs validation."],
  risks: ["The provider data can be incomplete."],
  recommendations: ["Validate the signal with primary research."],
  limitations: ["This is based only on the collected dataset."],
};

function successfulResponse(): Response {
  return new Response(
    JSON.stringify({
      candidates: [{ content: { parts: [{ text: JSON.stringify(insight) }] } }],
    }),
    { status: 200 },
  );
}

describe("GeminiAiProvider", () => {
  it("sends structured output settings and validates Gemini output", async () => {
    const fetchImplementation = vi.fn().mockResolvedValue(successfulResponse());
    const provider = new GeminiAiProvider({
      apiKey: "test-key",
      fetchImplementation,
    });

    await expect(provider.generateInsight(request)).resolves.toEqual(insight);
    expect(fetchImplementation).toHaveBeenCalledOnce();

    const [, options] = fetchImplementation.mock.calls[0] as [
      string,
      RequestInit,
    ];
    const body = JSON.parse(options.body as string) as {
      generationConfig: { responseMimeType: string; responseSchema: unknown };
    };
    expect(options.headers).toMatchObject({ "x-goog-api-key": "test-key" });
    expect(body.generationConfig.responseMimeType).toBe("application/json");
    expect(body.generationConfig.responseSchema).toBeDefined();
  });

  it("retries retryable provider failures", async () => {
    const fetchImplementation = vi
      .fn()
      .mockResolvedValueOnce(new Response("busy", { status: 503 }))
      .mockResolvedValueOnce(successfulResponse());
    const provider = new GeminiAiProvider({
      apiKey: "test-key",
      fetchImplementation,
      maxRetries: 1,
    });

    await expect(provider.generateInsight(request)).resolves.toEqual(insight);
    expect(fetchImplementation).toHaveBeenCalledTimes(2);
  });

  it("turns an aborted request into a retryable timeout", async () => {
    const fetchImplementation = vi.fn(
      (_input: string, options?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          options?.signal?.addEventListener("abort", () =>
            reject(new Error("aborted")),
          );
        }),
    ) as unknown as typeof fetch;
    const provider = new GeminiAiProvider({
      apiKey: "test-key",
      fetchImplementation,
      timeoutMilliseconds: 1,
      maxRetries: 0,
    });

    await expect(provider.generateInsight(request)).rejects.toMatchObject({
      code: "TIMEOUT",
      retryable: true,
    } satisfies Partial<AiProviderError>);
  });
});

describe("buildInsightPrompt", () => {
  it("contains data guardrails and only the supplied research context", () => {
    const prompt = buildInsightPrompt(request);

    expect(prompt).toContain("Do not invent businesses");
    expect(prompt).toContain("2026-08-28T00:00:00.000Z");
    expect(prompt).toContain("coffee shops");
  });
});
