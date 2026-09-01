export function ResearchExportControls({ researchId }: { researchId: string }) {
  const base = `/api/research/${encodeURIComponent(researchId)}/export`;
  return (
    <section className="flex flex-col justify-between gap-5 border-y border-[var(--rule-strong)] py-6 sm:flex-row sm:items-end">
      <div>
        <p className="eyebrow">Research archive</p>
        <h2 className="type-display mt-3 text-3xl leading-none tracking-[-0.035em] text-[var(--ink)]">
          Export the evidence
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--ink-soft)]">
          Each download creates a timestamped report snapshot from persisted
          research data.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {(["csv", "json", "pdf"] as const).map((format) => (
          <a
            className={
              format === "pdf"
                ? "inline-flex min-h-11 items-center border border-[var(--accent)] bg-[var(--accent)] px-3 text-sm font-semibold text-[#fffcf5] transition-colors hover:bg-[var(--accent-hover)]"
                : "inline-flex min-h-11 items-center border border-[var(--rule-strong)] bg-[var(--paper)] px-3 text-sm font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--paper-muted)]"
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
