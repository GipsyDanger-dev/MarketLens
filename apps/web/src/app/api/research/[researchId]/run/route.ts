import { NextResponse } from "next/server";

import {
  researchCollectionErrorResponse,
  researchProgressResponse,
} from "@/app/api/research/response";
import { requestHasAccess } from "@/lib/access-control";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ researchId: string }> },
) {
  try {
    if (!requestHasAccess(request)) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    const { researchId } = await params;
    const { runResearchCollection } =
      await import("@/research/research-collection-service");
    const progress = await runResearchCollection(researchId);

    return researchProgressResponse(progress);
  } catch (error) {
    return researchCollectionErrorResponse(error);
  }
}
