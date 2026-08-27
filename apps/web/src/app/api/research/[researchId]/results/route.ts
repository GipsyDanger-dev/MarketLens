import { NextResponse } from "next/server";

import { researchCollectionErrorResponse } from "@/app/api/research/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ researchId: string }> },
) {
  try {
    const { researchId } = await params;
    const { getResearchResults } =
      await import("@/lib/research-results-repository");

    return NextResponse.json(await getResearchResults(researchId));
  } catch (error) {
    return researchCollectionErrorResponse(error);
  }
}
