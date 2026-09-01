import Link from "next/link";

export function SiteHeader({ tone = "light" }: { tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  const muted = dark
    ? "text-[#c9cdc1] hover:text-[#fffcf5]"
    : "text-[var(--ink-soft)] hover:text-[var(--ink)]";
  const rule = dark ? "border-[#617066]" : "border-[var(--rule)]";

  return (
    <header className={`border-b ${rule}`}>
      <div className="workspace-frame flex min-h-18 items-center justify-between gap-4">
        <Link className="group flex items-center gap-3" href="/">
          <span
            aria-hidden="true"
            className={`grid size-8 place-items-center border text-sm font-bold ${dark ? "border-[#aeb9aa] text-[#e8efda]" : "border-[var(--ink)] text-[var(--ink)]"}`}
          >
            ML
          </span>
          <span
            className={`text-base font-semibold tracking-[-0.03em] ${dark ? "text-[#fffcf5]" : "text-[var(--ink)]"}`}
          >
            MarketLens
          </span>
          <span
            className={`hidden border-l pl-3 font-mono text-[0.66rem] tracking-[0.09em] uppercase sm:inline ${dark ? "border-[#617066] text-[#b9c5b5]" : "border-[var(--rule-strong)] text-[var(--ink-faint)]"}`}
          >
            Local intelligence
          </span>
        </Link>
        <nav
          aria-label="Primary navigation"
          className="flex items-center gap-1 sm:gap-3"
        >
          <a
            className={`hidden min-h-11 items-center px-2 text-sm font-medium transition-colors sm:inline-flex ${muted}`}
            href="https://github.com/GipsyDanger-dev/MarketLens"
          >
            Source
          </a>
          <Link
            className={`inline-flex min-h-10 items-center border px-3 text-sm font-semibold transition-colors ${dark ? "border-[#d5e0bf] bg-[#d5e0bf] text-[#16201b] hover:bg-[#e8efda]" : "border-[var(--accent)] bg-[var(--accent)] text-[#fffcf5] hover:bg-[var(--accent-hover)]"}`}
            href="/research/new"
          >
            New research
          </Link>
        </nav>
      </div>
    </header>
  );
}
