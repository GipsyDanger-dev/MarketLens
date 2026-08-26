import {
  researchCollectionErrorResponse,
  researchProgressResponse,
} from "@/app/api/research/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ researchId: string }> },
) {
  try {
    const { researchId } = await params;
    const { getResearchProgress } =
      await import("@/lib/research-collection-repository");
    const progress = await getResearchProgress(researchId);

    return researchProgressResponse(progress);
  } catch (error) {
    return researchCollectionErrorResponse(error);
  }
}
