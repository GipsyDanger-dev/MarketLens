import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { AiProviderError } from "./errors";
import { GeminiAiProvider } from "./gemini-provider";
import { createAiProvider } from "./index";

const databaseUrl =
  "postgresql://marketlens:marketlens@localhost:5432/marketlens";

describe("createAiProvider", () => {
  it("keeps the core product usable when AI is disabled", () => {
    expect(() => createAiProvider({ DATABASE_URL: databaseUrl })).toThrowError(
      expect.objectContaining<Partial<AiProviderError>>({
        code: "DISABLED",
        retryable: false,
      }),
    );
  });

  it("requires a server-side Gemini key only when AI is enabled", () => {
    expect(() =>
      createAiProvider({ DATABASE_URL: databaseUrl, ENABLE_AI: "true" }),
    ).toThrowError(
      expect.objectContaining<Partial<AiProviderError>>({
        code: "CONFIGURATION",
      }),
    );
  });

  it("creates Gemini from enabled configuration", () => {
    expect(
      createAiProvider({
        DATABASE_URL: databaseUrl,
        ENABLE_AI: "true",
        GEMINI_API_KEY: "server-only-key",
      }),
    ).toBeInstanceOf(GeminiAiProvider);
  });
});
