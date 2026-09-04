import { ArrowUpRight, Plus } from "lucide-react";
import Link from "next/link";

export function SiteHeader({ tone = "light" }: { tone?: "light" | "dark" }) {
  const dark = tone === "dark";

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-xl ${
        dark
          ? "border-white/10 bg-[rgb(11_18_32/0.86)] text-[var(--inverse)]"
          : "border-[var(--rule)] bg-[rgb(255_255_255/0.88)] text-[var(--ink)]"
      }`}
    >
      <div className="workspace-frame flex min-h-18 items-center justify-between gap-4">
        <Link
          aria-label="MarketLens home"
          className="group flex min-h-11 items-center gap-3"
          href="/"
        >
          <BrandMark dark={dark} />
          <span className="flex items-baseline gap-2.5">
            <span className="text-[0.95rem] font-extrabold tracking-[-0.035em]">
              MarketLens
            </span>
            <span
              className={`hidden font-mono text-[0.62rem] font-semibold tracking-[0.12em] uppercase md:inline ${
                dark ? "text-[var(--inverse-soft)]" : "text-[var(--ink-faint)]"
              }`}
            >
              Intelligence workspace
            </span>
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="flex items-center gap-1.5">
          <a
            className={`hidden min-h-11 items-center gap-1.5 rounded-md px-3 text-sm font-semibold transition-colors sm:inline-flex ${
              dark
                ? "text-[#cbd5e7] hover:bg-white/8 hover:text-white visited:text-[#cbd5e7]"
                : "text-[var(--ink-soft)] hover:bg-[var(--paper-muted)] hover:text-[var(--ink)] visited:text-[var(--ink-soft)]"
            }`}
            href="https://github.com/GipsyDanger-dev/MarketLens"
            rel="noreferrer"
            target="_blank"
          >
            Source
            <ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.9} />
          </a>
          <Link
            className={`inline-flex min-h-11 items-center gap-2 rounded-md border px-3.5 text-sm font-bold transition-[background-color,border-color,color,transform,box-shadow] duration-180 active:translate-y-px ${
              dark
                ? "border-[#7090ff] bg-[#315ef5] text-white shadow-[0_8px_28px_rgb(49_94_245/0.28)] hover:border-[#8fa8ff] hover:bg-[#416cf8] visited:text-white"
                : "border-[var(--accent)] bg-[var(--accent)] text-white hover:border-[var(--accent-hover)] hover:bg-[var(--accent-hover)] hover:shadow-[0_8px_22px_rgb(49_94_245/0.2)] visited:text-white"
            }`}
            href="/research/new"
          >
            <Plus aria-hidden="true" size={16} strokeWidth={2.2} />
            <span className="hidden sm:inline">New research</span>
            <span className="sm:hidden">New study</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

function BrandMark({ dark }: { dark: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-md border transition-transform duration-180 group-hover:-rotate-2 ${
        dark
          ? "border-[#7086b8] bg-[#121c30]"
          : "border-[var(--graphite)] bg-[var(--graphite)]"
      }`}
    >
      <span className="absolute -right-2 -bottom-2 size-6 rounded-full border border-[#8fa8ff]" />
      <span className="absolute top-1.5 left-1.5 size-1.5 bg-[#8fa8ff]" />
      <span className="relative font-mono text-[0.67rem] font-bold tracking-[-0.08em] text-white">
        ML
      </span>
    </span>
  );
}
