import { AccessTokenForm } from "@/components/access-token-form";
import { SiteHeader } from "@/components/site-header";

function safeNextPath(value: string | undefined): string {
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/research/new";
}

export default async function AccessPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="app-shell">
      <SiteHeader />
      <div className="workspace-frame max-w-xl py-10 sm:py-16">
        <AccessTokenForm nextPath={safeNextPath(next)} />
      </div>
    </main>
  );
}
