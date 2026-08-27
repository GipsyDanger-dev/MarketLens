import { NextResponse } from "next/server";

import { researchCollectionErrorResponse } from "@/app/api/research/response";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const input = await request.json();
    const [{ createProviderRegistry }, { createResearchProject }] =
      await Promise.all([
        import("@/providers"),
        import("@/lib/research-project-repository"),
      ]);
    createProviderRegistry().get(input.providerId);
    const project = await createResearchProject(input);
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return researchCollectionErrorResponse(error);
  }
}
