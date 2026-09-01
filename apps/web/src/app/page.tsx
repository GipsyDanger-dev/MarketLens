import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

const capabilities = [
  {
    eyebrow: "01 / Collect",
    title: "Start with evidence, not a spreadsheet.",
    description:
      "Search a category and location with OpenStreetMap by default, or bring your own Google Places credentials.",
  },
  {
    eyebrow: "02 / Understand",
    title: "Turn place data into a market view.",
    description:
      "Normalize and deduplicate records, then explore rankings, density, distributions, and mapped competitors.",
  },
  {
    eyebrow: "03 / Decide",
    title: "Keep every conclusion explainable.",
    description:
      "Use deterministic scoring and optional guarded AI interpretation, then export the evidence as CSV, JSON, or PDF.",
  },
];

const workflow = [
  "Choose a provider and define the market",
  "Collect, normalize, and deduplicate places",
  "Compare competitors and geographic patterns",
  "Export a traceable research report",
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#16201b] text-[#fffcf5]">
      <SiteHeader tone="dark" />
      <section className="workspace-frame relative grid gap-12 py-16 sm:py-22 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:py-28">
        <div className="enter-reveal">
          <p className="font-mono text-xs tracking-[0.12em] text-[#d5e0bf] uppercase">
            Local market intelligence / 01
          </p>
          <h1 className="type-display mt-6 max-w-4xl text-5xl leading-[0.95] tracking-[-0.055em] text-balance sm:text-7xl lg:text-[5.75rem]">
            Read the ground before you make a move.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[#c9cdc1] sm:text-xl">
            Collect place data, inspect the evidence, and arrive at an
            explainable view of your local market.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              className="inline-flex min-h-12 items-center justify-center border border-[#d5e0bf] bg-[#d5e0bf] px-5 font-semibold text-[#16201b] transition-colors hover:bg-[#e8efda]"
              href="/research/new"
            >
              Start a field study
            </Link>
            <a
              className="inline-flex min-h-12 items-center justify-center px-3 text-sm font-medium text-[#d5e0bf] underline decoration-[#7d8b7e] underline-offset-5 transition-colors hover:text-[#fffcf5]"
              href="https://github.com/GipsyDanger-dev/MarketLens"
            >
              Inspect the source
            </a>
          </div>
        </div>
        <aside
          className="border-y border-[#617066] py-5 sm:py-6 lg:ml-10"
          aria-label="Example market snapshot"
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[0.68rem] tracking-[0.11em] text-[#aeb9aa] uppercase">
                Example study
              </p>
              <p className="mt-2 text-lg font-semibold">
                Coffee shops / Malang
              </p>
            </div>
            <span className="border border-[#739477] px-2 py-1 font-mono text-[0.66rem] tracking-[0.08em] text-[#d5e0bf] uppercase">
              Ready
            </span>
          </div>
          <div className="mt-10 grid grid-cols-[1.45fr_1fr] gap-4 border-b border-[#617066] pb-5">
            <div>
              <p className="font-mono text-[0.68rem] tracking-[0.1em] text-[#aeb9aa] uppercase">
                Observed businesses
              </p>
              <p className="type-display mt-1 text-7xl leading-none text-[#d5e0bf]">
                48
              </p>
            </div>
            <dl className="space-y-4 pt-1">
              <Metric label="Avg. rating" value="4.3" />
              <Metric label="Median reviews" value="127" />
            </dl>
          </div>
          <div
            className="mt-5 grid grid-cols-12 items-end gap-1"
            aria-label="Example market activity distribution"
          >
            {[35, 48, 42, 66, 58, 84, 67, 92, 61, 72, 49, 38].map(
              (height, index) => (
                <span
                  className="bg-[#d5e0bf]"
                  key={`${height}-${index}`}
                  style={{
                    height: `${height / 2}px`,
                    opacity: 0.45 + index / 32,
                  }}
                />
              ),
            )}
          </div>
          <p className="mt-3 text-sm text-[#aeb9aa]">
            Activity clusters near the city center. A signal, not a verdict.
          </p>
        </aside>
      </section>

      <section className="border-y border-[#617066] bg-[#1d2a23]">
        <div className="workspace-frame grid gap-0 lg:grid-cols-[0.8fr_2.2fr]">
          <div className="border-b border-[#617066] py-7 lg:border-r lg:border-b-0 lg:pr-8 lg:py-12">
            <p className="font-mono text-xs tracking-[0.1em] text-[#d5e0bf] uppercase">
              Method
            </p>
            <h2 className="type-display mt-3 text-4xl leading-none">
              A traceable path from places to perspective.
            </h2>
          </div>
          <ol className="divide-y divide-[#617066] lg:pl-10">
            {workflow.map((step, index) => (
              <li
                className="grid grid-cols-[3rem_1fr] gap-4 py-5 sm:grid-cols-[5rem_1fr]"
                key={step}
              >
                <span className="font-mono text-sm text-[#d5e0bf]">
                  0{index + 1}
                </span>
                <p className="max-w-xl text-base leading-7 text-[#e5e8df]">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-[#f3f0e7] text-[var(--ink)]">
        <div className="workspace-frame grid gap-12 py-16 sm:py-22 lg:grid-cols-[0.85fr_2fr]">
          <div>
            <p className="eyebrow">What changes</p>
            <h2 className="type-display mt-4 text-4xl leading-[0.98] tracking-[-0.04em] sm:text-5xl">
              Evidence stays close to every claim.
            </h2>
          </div>
          <div className="divide-y divide-[var(--rule-strong)] border-t border-[var(--rule-strong)]">
            {capabilities.map((capability) => (
              <article
                className="grid gap-3 py-6 sm:grid-cols-[8rem_1fr] sm:gap-6"
                key={capability.title}
              >
                <p className="font-mono text-xs tracking-[0.08em] text-[var(--accent)] uppercase">
                  {capability.eyebrow}
                </p>
                <div>
                  <h3 className="text-xl font-semibold tracking-[-0.025em]">
                    {capability.title}
                  </h3>
                  <p className="mt-2 max-w-2xl leading-7 text-[var(--ink-soft)]">
                    {capability.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#f3f0e7] text-[var(--ink)]">
        <div className="workspace-frame flex flex-col gap-4 border-t border-[var(--rule-strong)] py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            MarketLens · MIT License · Local market intelligence in the open.
          </p>
          <Link
            className="font-semibold text-[var(--accent)] underline underline-offset-4"
            href="/research/new"
          >
            Create a study
          </Link>
        </div>
      </footer>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[0.66rem] tracking-[0.08em] text-[#aeb9aa] uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-xl font-semibold text-[#fffcf5]">{value}</dd>
    </div>
  );
}
