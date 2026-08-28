import Link from "next/link";

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
    <main className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-x-0 top-0 -z-0 h-[32rem] bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.18),_transparent_42%),radial-gradient(circle_at_20%_10%,_rgba(99,102,241,0.16),_transparent_36%)]" />
      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
        <header className="flex items-center justify-between py-6">
          <Link
            className="flex items-center gap-2 font-semibold tracking-tight"
            href="/"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-cyan-300 font-black text-slate-950">
              M
            </span>
            MarketLens
          </Link>
          <nav
            aria-label="Primary navigation"
            className="flex items-center gap-2"
          >
            <a
              className="hidden rounded-md px-3 py-2 text-sm text-slate-300 transition hover:text-white sm:block"
              href="https://github.com/GipsyDanger-dev/MarketLens"
            >
              GitHub
            </a>
            <Link
              className="rounded-md bg-cyan-300 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100"
              href="/research/new"
            >
              New research
            </Link>
          </nav>
        </header>

        <section className="grid gap-12 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-cyan-200 uppercase">
              Open-source local market intelligence
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.045em] text-balance sm:text-6xl lg:text-7xl">
              See the local market before you enter it.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              MarketLens transforms place data into explainable competitor,
              geography, and market signals—without making a paid provider or AI
              account mandatory.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="rounded-md bg-cyan-300 px-5 py-3 text-center font-semibold text-slate-950 transition hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100"
                href="/research/new"
              >
                Create your first research
              </Link>
              <a
                className="rounded-md border border-slate-700 px-5 py-3 text-center font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100"
                href="https://github.com/GipsyDanger-dev/MarketLens"
              >
                View the source
              </a>
            </div>
            <p className="mt-4 text-sm text-slate-400">
              Self-hostable · Provider-agnostic · Useful without AI
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-5 shadow-2xl shadow-cyan-950/30 backdrop-blur sm:p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.15em] text-cyan-200 uppercase">
                  Market snapshot
                </p>
                <p className="mt-1 font-semibold">Coffee shops in Malang</p>
              </div>
              <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                Ready
              </span>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Metric label="Businesses" value="48" />
              <Metric label="Avg. rating" value="4.3" />
              <Metric label="Median reviews" value="127" />
            </dl>
            <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Competitive intensity
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Strongest activity near the city center.
                  </p>
                </div>
                <strong className="text-2xl text-cyan-200">72</strong>
              </div>
              <div
                className="mt-5 flex h-24 items-end gap-1.5"
                aria-hidden="true"
              >
                {[36, 52, 45, 72, 60, 88, 69, 96, 64, 77, 54, 42].map(
                  (height, index) => (
                    <span
                      className="flex-1 rounded-t bg-gradient-to-t from-cyan-500/35 to-cyan-200"
                      key={`${height}-${index}`}
                      style={{ height: `${height}%` }}
                    />
                  ),
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-800 py-14 sm:py-20">
          <p className="text-center text-sm font-semibold tracking-[0.16em] text-slate-400 uppercase">
            One reusable intelligence pipeline
          </p>
          <ol className="mx-auto mt-8 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {workflow.map((step, index) => (
              <li
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"
                key={step}
              >
                <span className="text-sm font-semibold text-cyan-200">
                  0{index + 1}
                </span>
                <p className="mt-2 text-sm leading-6 text-slate-300">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="py-16 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold tracking-[0.16em] text-cyan-200 uppercase">
              Built for evidence
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              A local-market toolkit that you can inspect, extend, and host.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {capabilities.map((capability) => (
              <article
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
                key={capability.title}
              >
                <p className="text-xs font-semibold tracking-[0.14em] text-cyan-200 uppercase">
                  {capability.eyebrow}
                </p>
                <h3 className="mt-4 text-xl font-semibold">
                  {capability.title}
                </h3>
                <p className="mt-3 leading-7 text-slate-400">
                  {capability.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-12 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 px-6 py-10 text-center sm:mb-16 sm:px-12">
          <h2 className="text-3xl font-semibold tracking-tight">
            Start with the market you need to understand.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl leading-7 text-slate-300">
            Run MarketLens locally with PostgreSQL and OpenStreetMap, then add
            providers or AI only when your research calls for them.
          </p>
          <Link
            className="mt-6 inline-flex rounded-md bg-cyan-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100"
            href="/research/new"
          >
            Start a research project
          </Link>
        </section>

        <footer className="flex flex-col gap-3 border-t border-slate-800 py-8 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>MarketLens · Apache-2.0 · Build market knowledge in the open.</p>
          <div className="flex gap-4">
            <a href="https://github.com/GipsyDanger-dev/MarketLens">GitHub</a>
            <Link href="/research/new">New research</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-950/70 p-3">
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="mt-1 text-xl font-semibold text-slate-100">{value}</dd>
    </div>
  );
}
