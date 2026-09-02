import { NextResponse } from "next/server";

import { researchCollectionErrorResponse } from "@/app/api/research/response";
import { researchProjectInputSchema } from "@/core/research-project";
import {
  guardResearchMutation,
  logOperationalEvent,
} from "@/lib/operational-guard";
import { requestHasAccess } from "@/lib/access-control";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!requestHasAccess(request)) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    const rateLimit = guardResearchMutation(request, "research-create");
    if (!rateLimit.allowed)
      return NextResponse.json(
        { error: "Too many research requests. Try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        },
      );
    const input = researchProjectInputSchema.parse(await request.json());
    const [{ createProviderRegistry }, { createResearchProject }] =
      await Promise.all([
        import("@/providers"),
        import("@/lib/research-project-repository"),
      ]);
    createProviderRegistry().get(input.providerId);
    const project = await createResearchProject(input);
    logOperationalEvent("research.created", {
      projectId: project.id,
      providerId: project.providerId,
    });
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("research.create.failed", error);
    return researchCollectionErrorResponse(error);
  }
}
