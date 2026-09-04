import { ArrowDownRight, Fingerprint, ShieldCheck } from "lucide-react";

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
    <main className="app-shell min-h-screen bg-[var(--paper-subtle)]">
      <SiteHeader />
      <div className="workspace-frame grid flex-1 py-7 lg:grid-cols-[minmax(0,0.88fr)_minmax(28rem,0.72fr)] lg:py-12">
        <section className="dark-grid relative flex min-h-[27rem] overflow-hidden rounded-t-xl border border-[var(--graphite)] bg-[var(--graphite)] px-6 py-8 text-white lg:min-h-[42rem] lg:rounded-l-xl lg:rounded-tr-none lg:px-10 lg:py-11">
          <div className="relative z-10 flex w-full flex-col justify-between gap-12">
            <div>
              <div className="flex items-center gap-3 font-mono text-[0.68rem] font-bold tracking-[0.14em] text-[#9cb1df] uppercase">
                <span className="h-px w-7 bg-[#6f8fff]" />
                Restricted workspace
              </div>
              <h1 className="type-display mt-7 max-w-xl text-[clamp(3rem,6vw,5.6rem)] leading-[0.9] tracking-[-0.06em] text-white">
                Private data stays behind one clear gate.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-[#c4cfe2]">
                Access control protects research records without changing the
                local-first workflow. Your token is verified by this
                installation and is never included in exported market data.
              </p>
            </div>

            <div className="grid gap-px overflow-hidden rounded-lg border border-white/12 bg-white/12 sm:grid-cols-2">
              <div className="bg-[#0d1728] p-5">
                <ShieldCheck aria-hidden="true" className="text-[#8ea8ff]" size={21} strokeWidth={1.8} />
                <p className="mt-5 text-sm font-bold">Server-side validation</p>
                <p className="mt-1 text-xs leading-5 text-[#9fadc4]">
                  Credentials remain outside the browser bundle.
                </p>
              </div>
              <div className="bg-[#0d1728] p-5">
                <Fingerprint aria-hidden="true" className="text-[#d58850]" size={21} strokeWidth={1.8} />
                <p className="mt-5 text-sm font-bold">Scoped session</p>
                <p className="mt-1 text-xs leading-5 text-[#9fadc4]">
                  Access applies only to this MarketLens deployment.
                </p>
              </div>
            </div>
          </div>

          <ArrowDownRight aria-hidden="true" className="absolute right-7 bottom-7 text-white/8" size={190} strokeWidth={0.55} />
        </section>

        <section className="flex items-center rounded-b-xl border border-t-0 border-[var(--rule)] bg-white px-5 py-9 sm:px-9 lg:rounded-r-xl lg:rounded-bl-none lg:border-t lg:border-l-0 lg:px-12">
          <AccessTokenForm nextPath={safeNextPath(next)} />
        </section>
      </div>
    </main>
  );
}
