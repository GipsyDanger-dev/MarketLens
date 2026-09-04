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
    <main className="app-shell min-h-screen bg-[var(--paper-subtle)]">
      <SiteHeader />
      <div className="workspace-frame flex w-full flex-col gap-6 py-7 sm:py-10">
        <ResearchProgress researchId={researchId} />
        <ResearchResultsDashboard researchId={researchId} />
      </div>
    </main>
  );
}
