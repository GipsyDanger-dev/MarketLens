import { NextResponse } from "next/server";

import {
  researchCollectionErrorResponse,
  researchProgressResponse,
} from "@/app/api/research/response";
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
    const { getResearchProgress } =
      await import("@/lib/research-collection-repository");
    const progress = await getResearchProgress(researchId);

    return researchProgressResponse(progress);
  } catch (error) {
    return researchCollectionErrorResponse(error);
  }
}
