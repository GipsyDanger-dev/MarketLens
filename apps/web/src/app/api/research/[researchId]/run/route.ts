import {
  researchCollectionErrorResponse,
  researchProgressResponse,
} from "@/app/api/research/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ researchId: string }> },
) {
  try {
    const { researchId } = await params;
    const { runResearchCollection } =
      await import("@/research/research-collection-service");
    const progress = await runResearchCollection(researchId);

    return researchProgressResponse(progress);
  } catch (error) {
    return researchCollectionErrorResponse(error);
  }
}
