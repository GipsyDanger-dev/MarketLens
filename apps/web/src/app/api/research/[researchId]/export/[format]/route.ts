import { NextResponse } from "next/server";

import { researchCollectionErrorResponse } from "@/app/api/research/response";
import { requestHasAccess } from "@/lib/access-control";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ researchId: string; format: string }> },
) {
  try {
    if (!requestHasAccess(request)) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    const { researchId, format } = await params;
    const [
      { createResearchReportService },
      repository,
      { researchReportToCsv },
      { researchReportToPdf },
    ] = await Promise.all([
      import("@/reports/report-service"),
      import("@/lib/research-report-repository"),
      import("@/reports/csv"),
      import("@/reports/pdf"),
    ]);
    const { report } =
      await createResearchReportService(repository).generate(researchId);
    if (format === "json")
      return new NextResponse(JSON.stringify(report, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="marketlens-${researchId}.json"`,
        },
      });
    if (format === "csv")
      return new NextResponse(researchReportToCsv(report), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="marketlens-${researchId}.csv"`,
        },
      });
    if (format === "pdf")
      return new NextResponse(
        Uint8Array.from(await researchReportToPdf(report)),
        {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="marketlens-${researchId}.pdf"`,
          },
        },
      );
    return NextResponse.json(
      { error: "Unsupported export format." },
      { status: 404 },
    );
  } catch (error) {
    return researchCollectionErrorResponse(error);
  }
}
