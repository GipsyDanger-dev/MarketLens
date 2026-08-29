import { ResearchProgress } from "@/components/research/research-progress";
import { ResearchResultsDashboard } from "@/components/research/research-results-dashboard";
import { SiteHeader } from "@/components/site-header";

export default async function ResearchProgressPage({
  params,
}: {
  params: Promise<{ researchId: string }>;
}) {
  const { researchId } = await params;

  return (
    <main className="app-shell">
      <SiteHeader />
      <div className="workspace-frame flex w-full flex-col gap-10 py-8 sm:py-12">
        <ResearchProgress researchId={researchId} />
        <ResearchResultsDashboard researchId={researchId} />
      </div>
    </main>
  );
}
