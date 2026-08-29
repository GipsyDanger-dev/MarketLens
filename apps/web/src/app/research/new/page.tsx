import { ResearchCreationForm } from "@/components/research/research-creation-form";
import { SiteHeader } from "@/components/site-header";
import { createProviderRegistry } from "@/providers";

export const dynamic = "force-dynamic";

export default function NewResearchPage() {
  const providers = createProviderRegistry()
    .list()
    .map((provider) => ({ id: provider.id, name: provider.name }));

  return (
    <main className="app-shell">
      <SiteHeader />
      <div className="workspace-frame py-10 sm:py-16">
        <ResearchCreationForm providers={providers} />
      </div>
    </main>
  );
}
