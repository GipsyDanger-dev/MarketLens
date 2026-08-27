import { NextResponse } from "next/server";

import { AiProviderError } from "@/ai/errors";
import { ResearchCollectionError } from "@/research/collection-error";
import type { ResearchProgress } from "@/research/progress";

export interface ResearchProgressPayload extends Omit<
  ResearchProgress,
  "startedAt" | "completedAt"
> {
  startedAt: string | null;
  completedAt: string | null;
}

export function researchProgressResponse(
  progress: ResearchProgress,
): NextResponse<ResearchProgressPayload> {
  return NextResponse.json({
    ...progress,
    startedAt: progress.startedAt?.toISOString() ?? null,
    completedAt: progress.completedAt?.toISOString() ?? null,
  });
}

export function researchCollectionErrorResponse(error: unknown): NextResponse {
  if (error instanceof ResearchCollectionError) {
    const status =
      error.code === "PROJECT_NOT_FOUND"
        ? 404
        : error.code === "PROJECT_BUSY"
          ? 409
          : 500;

    return NextResponse.json(
      { error: error.message, code: error.code },
      { status },
    );
  }

  return NextResponse.json(
    { error: "Unable to process research collection." },
    { status: 500 },
  );
}

export function researchInsightErrorResponse(error: unknown): NextResponse {
  if (error instanceof AiProviderError) {
    const status =
      error.code === "CONFIGURATION"
        ? 400
        : error.code === "TIMEOUT" || error.code === "NETWORK"
          ? 502
          : 422;
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status },
    );
  }

  return researchCollectionErrorResponse(error);
}
