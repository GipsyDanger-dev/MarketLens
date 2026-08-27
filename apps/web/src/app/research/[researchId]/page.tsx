import { ResearchProgress } from "@/components/research/research-progress";
import { ResearchResultsDashboard } from "@/components/research/research-results-dashboard";

export default async function ResearchProgressPage({
  params,
}: {
  params: Promise<{ researchId: string }>;
}) {
  const { researchId } = await params;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 sm:py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <ResearchProgress researchId={researchId} />
        <ResearchResultsDashboard researchId={researchId} />
      </div>
    </main>
  );
}
