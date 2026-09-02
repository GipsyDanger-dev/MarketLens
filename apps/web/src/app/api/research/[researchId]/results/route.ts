import { NextResponse } from "next/server";

import { researchCollectionErrorResponse } from "@/app/api/research/response";
import { requestHasAccess } from "@/lib/access-control";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ researchId: string }> },
) {
  try {
    if (!requestHasAccess(request)) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    const { researchId } = await params;
    const { getResearchResults } =
      await import("@/lib/research-results-repository");

    return NextResponse.json(await getResearchResults(researchId));
  } catch (error) {
    return researchCollectionErrorResponse(error);
  }
}
