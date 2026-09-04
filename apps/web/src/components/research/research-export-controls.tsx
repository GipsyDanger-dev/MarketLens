import {
  ArrowDownToLine,
  Braces,
  FileChartColumn,
  FileSpreadsheet,
  PackageCheck,
} from "lucide-react";

const FORMATS = [
  {
    description: "Flat place records for spreadsheets and downstream analysis.",
    extension: "csv",
    icon: FileSpreadsheet,
    label: "Spreadsheet data",
  },
  {
    description: "Structured research, metrics, scores, and source metadata.",
    extension: "json",
    icon: Braces,
    label: "Machine-readable archive",
  },
  {
    description: "A presentation-ready report for review and circulation.",
    extension: "pdf",
    icon: FileChartColumn,
    label: "Research report",
  },
] as const;

export function ResearchExportControls({ researchId }: { researchId: string }) {
  const base = `/api/research/${encodeURIComponent(researchId)}/export`;
  return (
    <section className="overflow-hidden rounded-xl border border-[var(--rule-strong)] bg-white shadow-[var(--shadow-soft)]">
      <div className="grid lg:grid-cols-[minmax(19rem,0.62fr)_minmax(0,1.38fr)]">
        <header className="dark-grid flex flex-col justify-between bg-[var(--graphite)] p-6 text-white sm:p-8">
          <div>
            <span className="grid size-12 place-items-center rounded-md border border-[#586b91] bg-[#111d32] text-[#8fa8ff]">
              <PackageCheck aria-hidden="true" size={23} strokeWidth={1.7} />
            </span>
            <p className="mt-8 font-mono text-[0.65rem] font-bold tracking-[0.13em] text-[#93a9da] uppercase">Research archive</p>
            <h2 className="type-display mt-4 text-[clamp(3rem,6vw,5rem)] leading-[0.9] tracking-[-0.055em] text-white">Carry the evidence forward.</h2>
            <p className="mt-5 max-w-lg text-sm leading-6 text-[#b5c1d4]">
              Every file is generated from the same persisted study, keeping the record consistent across analysis and presentation.
            </p>
          </div>
          <p className="mt-10 border-t border-white/14 pt-5 font-mono text-[0.61rem] leading-5 tracking-[0.06em] text-[#8495b0] uppercase">
            Snapshot ID / {researchId}
          </p>
        </header>

        <div>
          <div className="border-b border-[var(--rule)] p-5 sm:p-7">
            <p className="eyebrow">Available formats</p>
            <h3 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[var(--ink)]">Choose the file for the next job</h3>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--ink-soft)]">Downloads are created on demand and include the latest persisted research snapshot.</p>
          </div>

          <div className="divide-y divide-[var(--rule)]">
            {FORMATS.map(({ description, extension, icon: Icon, label }) => (
              <div className="grid gap-4 p-5 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-center sm:px-7" key={extension}>
                <span className="grid size-11 place-items-center rounded-md border border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-[var(--ink)]">{label}</h4>
                    <span className="rounded-sm bg-[var(--paper-muted)] px-1.5 py-0.5 font-mono text-[0.58rem] font-bold tracking-[0.06em] text-[var(--ink-faint)] uppercase">.{extension}</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[var(--ink-soft)]">{description}</p>
                </div>
                <a
                  className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-4 text-sm font-bold transition-[background-color,border-color,color,box-shadow] ${extension === "pdf" ? "border-[var(--accent)] bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] visited:text-white" : "border-[var(--rule-strong)] bg-white text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)]"}`}
                  download
                  href={`${base}/${extension}`}
                >
                  <ArrowDownToLine aria-hidden="true" size={16} />Download {extension.toUpperCase()}
                </a>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-3 border-t border-[var(--rule)] bg-[var(--paper-subtle)] px-5 py-4 text-xs leading-5 text-[var(--ink-faint)] sm:px-7">
            <PackageCheck aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--copper)]" size={16} />
            Provider attribution and source metadata remain attached where the chosen format supports them.
          </div>
        </div>
      </div>
    </section>
  );
}
