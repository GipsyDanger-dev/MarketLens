"use client";

export default function ResearchError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <section className="mx-auto max-w-lg rounded-2xl border border-rose-400/30 bg-slate-900 p-6">
        <p className="text-sm font-semibold tracking-[0.2em] text-rose-200 uppercase">
          Research error
        </p>
        <h1 className="mt-2 text-2xl font-semibold">
          This research could not be displayed.
        </h1>
        <p className="mt-2 text-slate-300">
          The dataset remains stored. Retry the page, or return to the dashboard
          and try the action again.
        </p>
        <button
          className="mt-5 rounded-md bg-cyan-300 px-4 py-2 font-medium text-slate-950 hover:bg-cyan-200"
          onClick={reset}
        >
          Retry research
        </button>
      </section>
    </main>
  );
}
