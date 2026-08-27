export function ResearchExportControls({ researchId }: { researchId: string }) {
  const base = `/api/research/${encodeURIComponent(researchId)}/export`;
  return (
    <section className="flex flex-col justify-between gap-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-5 sm:flex-row sm:items-center">
      <div>
        <p className="text-sm font-semibold tracking-[0.2em] text-cyan-200 uppercase">
          Export report
        </p>
        <h2 className="mt-1 text-xl font-semibold text-slate-50">
          Take this research with you
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Each download creates a timestamped report snapshot from persisted
          research data.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {(["csv", "json", "pdf"] as const).map((format) => (
          <a
            className={
              format === "pdf"
                ? "inline-flex h-9 items-center rounded-md bg-cyan-300 px-3 text-sm font-medium text-slate-950 hover:bg-cyan-200"
                : "inline-flex h-9 items-center rounded-md border border-slate-600 px-3 text-sm font-medium text-slate-100 hover:bg-slate-800"
            }
            download
            href={`${base}/${format}`}
            key={format}
          >
            Export {format.toUpperCase()}
          </a>
        ))}
      </div>
    </section>
  );
}
