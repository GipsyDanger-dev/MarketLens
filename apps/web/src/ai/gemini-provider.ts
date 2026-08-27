import { AiProviderError } from "./errors";
import {
  marketInsightSchema,
  type AiProvider,
  type InsightRequest,
  type MarketInsight,
} from "./types";

type FetchImplementation = typeof fetch;

interface GeminiProviderOptions {
  apiKey: string;
  model?: string;
  timeoutMilliseconds?: number;
  maxRetries?: number;
  fetchImplementation?: FetchImplementation;
}

const insightResponseSchema = {
  type: "object",
  properties: {
    marketSummary: { type: "array", items: { type: "string" } },
    competitionInsights: { type: "array", items: { type: "string" } },
    opportunitySignals: { type: "array", items: { type: "string" } },
    risks: { type: "array", items: { type: "string" } },
    recommendations: { type: "array", items: { type: "string" } },
    limitations: { type: "array", items: { type: "string" } },
  },
  required: [
    "marketSummary",
    "competitionInsights",
    "opportunitySignals",
    "risks",
    "recommendations",
    "limitations",
  ],
  additionalProperties: false,
} as const;

export class GeminiAiProvider implements AiProvider {
  readonly id = "gemini";
  readonly model: string;

  private readonly apiKey: string;
  private readonly timeoutMilliseconds: number;
  private readonly maxRetries: number;
  private readonly fetchImplementation: FetchImplementation;

  constructor(options: GeminiProviderOptions) {
    this.apiKey = options.apiKey;
    this.model = options.model ?? "gemini-2.5-flash";
    this.timeoutMilliseconds = options.timeoutMilliseconds ?? 20_000;
    this.maxRetries = options.maxRetries ?? 1;
    this.fetchImplementation = options.fetchImplementation ?? fetch;
  }

  async generateInsight(request: InsightRequest): Promise<MarketInsight> {
    let lastError: AiProviderError | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt += 1) {
      try {
        return await this.requestInsight(request);
      } catch (error) {
        lastError = toAiProviderError(error);
        if (!lastError.retryable || attempt === this.maxRetries)
          throw lastError;
      }
    }

    throw lastError ?? unexpectedProviderError();
  }

  private async requestInsight(
    request: InsightRequest,
  ): Promise<MarketInsight> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.timeoutMilliseconds,
    );

    try {
      const response = await this.fetchImplementation(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": this.apiKey,
          },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: buildInsightPrompt(request) }] }],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: insightResponseSchema,
            },
          }),
        },
      );

      if (!response.ok) {
        throw new AiProviderError({
          code: "NETWORK",
          message: `Gemini request failed with HTTP ${response.status}.`,
          retryable: response.status === 429 || response.status >= 500,
        });
      }

      const payload = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text = payload.candidates?.[0]?.content?.parts
        ?.map((part) => part.text ?? "")
        .join("");

      if (!text) {
        throw new AiProviderError({
          code: "INVALID_RESPONSE",
          message: "Gemini returned no insight content.",
          retryable: false,
        });
      }

      return marketInsightSchema.parse(JSON.parse(text));
    } catch (error) {
      if (controller.signal.aborted) {
        throw new AiProviderError({
          code: "TIMEOUT",
          message: "Gemini insight request timed out.",
          retryable: true,
          cause: error,
        });
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function buildInsightPrompt(request: InsightRequest): string {
  return [
    "You are MarketLens, an explainable local market intelligence assistant.",
    "Use only the supplied dataset. Do not invent businesses, ratings, review counts, demand, revenue, or causal claims.",
    "State signals as potential opportunities that need further validation. Include data limitations and the collection timestamp.",
    "Return JSON matching the requested schema with concise, evidence-bound strings.",
    "DATA:",
    JSON.stringify({
      query: request.query,
      category: request.category,
      location: request.location,
      collectedAt: request.collectedAt.toISOString(),
      metrics: request.metrics,
      topCompetitors: request.topCompetitors,
      opportunitySignals: request.opportunitySignals,
    }),
  ].join("\n");
}

function toAiProviderError(error: unknown): AiProviderError {
  if (error instanceof AiProviderError) return error;

  if (error instanceof SyntaxError || error instanceof Error) {
    return new AiProviderError({
      code: "INVALID_RESPONSE",
      message: "Gemini returned an invalid structured insight.",
      retryable: false,
      cause: error,
    });
  }

  return unexpectedProviderError(error);
}

function unexpectedProviderError(cause?: unknown): AiProviderError {
  return new AiProviderError({
    code: "NETWORK",
    message: "Gemini insight request failed unexpectedly.",
    retryable: true,
    cause,
  });
}
