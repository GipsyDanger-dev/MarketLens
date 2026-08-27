import { ResearchCreationForm } from "@/components/research/research-creation-form";
import { createProviderRegistry } from "@/providers";

export const dynamic = "force-dynamic";

export default function NewResearchPage() {
  const providers = createProviderRegistry()
    .list()
    .map((provider) => ({ id: provider.id, name: provider.name }));

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 sm:py-16">
      <ResearchCreationForm providers={providers} />
    </main>
  );
}
