import { NextResponse } from "next/server";

import { researchInsightErrorResponse } from "@/app/api/research/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ researchId: string }> },
) {
  try {
    const { researchId } = await params;
    const { getLatestResearchInsight } =
      await import("@/lib/research-ai-repository");
    const insight = await getLatestResearchInsight(researchId);

    return NextResponse.json({ insight });
  } catch (error) {
    return researchInsightErrorResponse(error);
  }
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ researchId: string }> },
) {
  try {
    const { researchId } = await params;
    const [{ createAiProvider }, repository, { createResearchAiService }] =
      await Promise.all([
        import("@/ai"),
        import("@/lib/research-ai-repository"),
        import("@/research/research-ai-service"),
      ]);
    const service = createResearchAiService({
      createProvider: createAiProvider,
      repository,
    });
    const result = await service.generate(researchId);

    return NextResponse.json(result, {
      status: result.status === "generated" ? 201 : 200,
    });
  } catch (error) {
    return researchInsightErrorResponse(error);
  }
}
