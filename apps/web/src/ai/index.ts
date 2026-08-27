import "server-only";

import { parseServerEnvironment } from "../lib/environment";
import { AiProviderError } from "./errors";
import { GeminiAiProvider } from "./gemini-provider";
import type { AiProvider } from "./types";

export function createAiProvider(
  environment: Record<string, string | undefined> = process.env,
): AiProvider {
  const configuration = parseServerEnvironment(environment);

  if (!configuration.ENABLE_AI) {
    throw new AiProviderError({
      code: "DISABLED",
      message: "AI insights are disabled by ENABLE_AI=false.",
      retryable: false,
    });
  }

  if (!configuration.GEMINI_API_KEY) {
    throw new AiProviderError({
      code: "CONFIGURATION",
      message: "GEMINI_API_KEY is required when AI insights are enabled.",
      retryable: false,
    });
  }

  return new GeminiAiProvider({
    apiKey: configuration.GEMINI_API_KEY,
    timeoutMilliseconds: configuration.AI_TIMEOUT_MILLISECONDS,
    maxRetries: configuration.AI_MAX_RETRIES,
  });
}
