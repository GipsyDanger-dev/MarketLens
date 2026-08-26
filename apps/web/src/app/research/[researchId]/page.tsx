import { ResearchProgress } from "@/components/research/research-progress";

export default async function ResearchProgressPage({
  params,
}: {
  params: Promise<{ researchId: string }>;
}) {
  const { researchId } = await params;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 sm:py-16">
      <ResearchProgress researchId={researchId} />
    </main>
  );
}
