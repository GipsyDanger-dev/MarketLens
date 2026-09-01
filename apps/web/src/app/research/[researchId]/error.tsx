"use client";

export default function ResearchError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="app-shell px-4 py-10 sm:py-20">
      <section className="paper-panel mx-auto max-w-xl p-6 sm:p-8">
        <p className="eyebrow text-[var(--danger)]">Research error</p>
        <h1 className="type-display mt-4 text-4xl leading-none tracking-[-0.045em]">
          This research could not be displayed.
        </h1>
        <p className="mt-5 leading-7 text-[var(--ink-soft)]">
          The dataset remains stored. Retry the page, or return to the dashboard
          and try the action again.
        </p>
        <button
          className="mt-7 min-h-11 border border-[var(--accent)] bg-[var(--accent)] px-4 text-sm font-semibold text-[#fffcf5] transition-colors hover:bg-[var(--accent-hover)]"
          onClick={reset}
        >
          Retry research
        </button>
      </section>
    </main>
  );
}
