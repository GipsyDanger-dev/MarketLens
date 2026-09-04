"use client";

import { AlertTriangle, ArrowLeft, Database, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export default function ResearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(
      JSON.stringify({
        digest: error.digest,
        event: "research.render_error",
        level: "error",
      }),
    );
  }, [error]);

  return (
    <main className="app-shell min-h-screen bg-[var(--paper-subtle)]">
      <SiteHeader />
      <div className="workspace-frame py-8 sm:py-14">
        <section className="mx-auto grid max-w-5xl overflow-hidden rounded-xl border border-[var(--rule-strong)] bg-white shadow-[var(--shadow-strong)] lg:grid-cols-[0.78fr_1.22fr]">
          <div className="dark-grid flex min-h-80 flex-col justify-between bg-[var(--graphite)] p-7 text-white sm:p-10">
            <span className="grid size-12 place-items-center rounded-md border border-[#704a42] bg-[#2a1820] text-[#f29a8f]">
              <AlertTriangle aria-hidden="true" size={23} strokeWidth={1.8} />
            </span>
            <div className="mt-16">
              <p className="font-mono text-[0.65rem] font-bold tracking-[0.13em] text-[#f29a8f] uppercase">Research interruption</p>
              <p className="type-display mt-4 text-6xl leading-none tracking-[-0.055em] text-white">The view stopped. The record did not.</p>
            </div>
          </div>

          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
            <div className="flex items-start gap-3 rounded-md border border-[var(--accent-line)] bg-[var(--accent-soft)] p-4">
              <Database aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--accent)]" size={18} />
              <p className="text-sm leading-6 text-[var(--ink-soft)]">
                Persisted collection data is stored separately from this interface error.
              </p>
            </div>
            <p className="eyebrow mt-8">Recovery options</p>
            <h1 className="type-display mt-3 text-[clamp(2.8rem,6vw,4.8rem)] leading-[0.92] tracking-[-0.055em] text-[var(--ink)]">
              This research could not be displayed.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-[var(--ink-soft)]">
              Retry the page first. If the problem continues, start a new field study and use the reference below when checking server logs.
            </p>

            {error.digest ? (
              <p className="mt-6 border-l-2 border-[var(--copper)] pl-3 font-mono text-[0.65rem] text-[var(--ink-faint)]">
                Error reference / {error.digest}
              </p>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button onClick={reset} size="lg">
                <RefreshCw aria-hidden="true" size={16} />Retry research
              </Button>
              <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[var(--rule-strong)] bg-white px-5 text-sm font-bold text-[var(--ink)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]" href="/research/new">
                <ArrowLeft aria-hidden="true" size={16} />New field study
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
