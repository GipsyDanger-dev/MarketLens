import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Database,
  FileDown,
  Github,
  MapPinned,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";

const workflow = [
  {
    label: "Frame",
    title: "Define the market",
    description:
      "Choose a category, place the search area, and select a provider that fits the study.",
  },
  {
    label: "Collect",
    title: "Build the evidence set",
    description:
      "Collect place records, normalize provider fields, and remove duplicates before analysis.",
  },
  {
    label: "Compare",
    title: "Read the competitive field",
    description:
      "Inspect density, ratings, contact data, geographic patterns, and explainable rankings.",
  },
  {
    label: "Deliver",
    title: "Export a traceable report",
    description:
      "Take the same persisted evidence into CSV, JSON, or a presentation-ready PDF.",
  },
];

const capabilities = [
  {
    icon: MapPinned,
    title: "Provider-neutral collection",
    description:
      "OpenStreetMap works out of the box. Optional adapters stay isolated from the intelligence pipeline.",
  },
  {
    icon: SlidersHorizontal,
    title: "Explainable competitive scoring",
    description:
      "Every rank is composed from visible rating, authority, density, and proximity signals.",
  },
  {
    icon: FileDown,
    title: "Evidence that leaves the app",
    description:
      "Export business contacts, source fields, metrics, and report context without rebuilding the study.",
  },
];

export default function Home() {
  return (
    <main
      className="min-h-screen overflow-hidden bg-[var(--graphite)] text-[var(--inverse)]"
      id="main-content"
    >
      <div className="dark-grid">
        <SiteHeader tone="dark" />
        <section className="workspace-frame grid min-h-[calc(100svh-73px)] gap-14 py-14 sm:py-20 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:py-24">
          <div className="enter-reveal relative z-10">
            <div className="flex items-center gap-3 font-mono text-[0.7rem] font-semibold tracking-[0.12em] text-[#8fa8ff] uppercase">
              <span className="h-px w-8 bg-[#8fa8ff]" />
              Local market intelligence
            </div>
            <h1 className="type-display mt-7 max-w-3xl text-[clamp(3.6rem,7.6vw,7.4rem)] leading-[0.83] font-medium tracking-[-0.062em] text-balance">
              Read the ground before you make a move.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-[#bdc8db] sm:text-xl">
              Collect local business data, see the competitive pattern, and
              keep every market conclusion tied to evidence.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[#7090ff] bg-[#315ef5] px-5 text-sm font-extrabold text-white shadow-[0_14px_36px_rgb(49_94_245/0.3)] transition-[background-color,border-color,transform,box-shadow] duration-180 hover:border-[#8fa8ff] hover:bg-[#416cf8] hover:shadow-[0_18px_46px_rgb(49_94_245/0.38)] active:translate-y-px visited:text-white"
                href="/research/new"
              >
                Start a field study
                <ArrowRight aria-hidden="true" size={17} strokeWidth={2.2} />
              </Link>
              <a
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-4 text-sm font-bold text-[#d8e0ef] transition-colors hover:bg-white/7 hover:text-white visited:text-[#d8e0ef]"
                href="https://github.com/GipsyDanger-dev/MarketLens"
                rel="noreferrer"
                target="_blank"
              >
                <Github aria-hidden="true" size={17} strokeWidth={1.9} />
                Inspect source
                <ArrowUpRight aria-hidden="true" size={15} />
              </a>
            </div>
            <ul className="mt-11 flex flex-wrap gap-x-5 gap-y-3 text-sm text-[#9eacc2]">
              {[
                "No paid provider required",
                "Local-first runtime",
                "MIT licensed",
              ].map((item) => (
                <li className="flex items-center gap-2" key={item}>
                  <Check aria-hidden="true" size={15} className="text-[#8fa8ff]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <MarketPreview />
        </section>
      </div>

      <section className="border-y border-[#26344c] bg-[var(--midnight)]">
        <div className="workspace-frame grid divide-y divide-[#26344c] sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {[
            ["Default source", "OpenStreetMap"],
            ["Storage", "Local embedded"],
            ["Outputs", "CSV · JSON · PDF"],
            ["License", "MIT open source"],
          ].map(([label, value]) => (
            <div className="px-0 py-5 sm:px-5 lg:px-7" key={label}>
              <p className="font-mono text-[0.65rem] font-semibold tracking-[0.1em] text-[#8391aa] uppercase">
                {label}
              </p>
              <p className="mt-1.5 text-sm font-bold text-[#e8edf8]">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[var(--canvas)] text-[var(--ink)]" id="method">
        <div className="workspace-frame grid gap-12 py-20 sm:py-28 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow">The method</p>
            <h2 className="type-display mt-5 max-w-md text-5xl leading-[0.94] font-medium tracking-[-0.045em] text-balance sm:text-6xl">
              A clear line from place records to perspective.
            </h2>
            <p className="mt-6 max-w-sm text-base leading-7 text-[var(--ink-soft)]">
              MarketLens keeps collection, normalization, analysis, and export
              in one traceable research record.
            </p>
          </div>

          <ol className="border-t border-[var(--rule-strong)]">
            {workflow.map((step, index) => (
              <li
                className="grid gap-4 border-b border-[var(--rule)] py-7 sm:grid-cols-[5rem_10rem_1fr] sm:items-baseline sm:gap-6"
                key={step.title}
              >
                <span className="type-data text-xs font-semibold text-[var(--accent)]">
                  0{index + 1}
                </span>
                <span className="text-sm font-bold text-[var(--ink)]">
                  {step.label}
                </span>
                <div>
                  <h3 className="text-xl font-extrabold tracking-[-0.025em]">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-xl text-base leading-7 text-[var(--ink-soft)]">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white text-[var(--ink)]">
        <div className="workspace-frame grid gap-12 border-t border-[var(--rule)] py-20 sm:py-28 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div>
            <p className="eyebrow">Built for scrutiny</p>
            <h2 className="type-display mt-5 max-w-md text-5xl leading-[0.94] font-medium tracking-[-0.045em] text-balance sm:text-6xl">
              Intelligence you can inspect, explain, and carry forward.
            </h2>
          </div>
          <div className="border-t border-[var(--rule-strong)]">
            {capabilities.map(({ icon: Icon, title, description }) => (
              <article
                className="grid gap-4 border-b border-[var(--rule)] py-7 sm:grid-cols-[2rem_1fr] sm:gap-5"
                key={title}
              >
                <Icon
                  aria-hidden="true"
                  className="mt-0.5 text-[var(--accent)]"
                  size={22}
                  strokeWidth={1.7}
                />
                <div>
                  <h3 className="text-xl font-extrabold tracking-[-0.025em]">
                    {title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-base leading-7 text-[var(--ink-soft)]">
                    {description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#e8edff] text-[var(--ink)]">
        <div className="workspace-frame grid gap-8 py-16 sm:py-20 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="eyebrow">Your next field study</p>
            <h2 className="type-display mt-4 max-w-3xl text-5xl leading-[0.94] font-medium tracking-[-0.045em] text-balance sm:text-6xl">
              Replace the spreadsheet chase with a repeatable market record.
            </h2>
          </div>
          <Link
            className="inline-flex min-h-12 w-fit items-center justify-center gap-2 rounded-md border border-[var(--graphite)] bg-[var(--graphite)] px-5 text-sm font-extrabold text-white transition-[background-color,transform] duration-180 hover:bg-[var(--midnight-soft)] active:translate-y-px visited:text-white"
            href="/research/new"
          >
            Create a study
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </div>
      </section>

      <footer className="bg-[var(--graphite)] text-[#aeb9cc]">
        <div className="workspace-frame flex flex-col gap-5 border-t border-white/10 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck aria-hidden="true" size={17} className="text-[#8fa8ff]" />
            <p>MarketLens · MIT License · Local intelligence in the open.</p>
          </div>
          <a
            className="inline-flex min-h-11 items-center gap-2 font-bold text-[#dce4f3] hover:text-white visited:text-[#dce4f3]"
            href="https://github.com/GipsyDanger-dev/MarketLens"
            rel="noreferrer"
            target="_blank"
          >
            View repository
            <ArrowUpRight aria-hidden="true" size={15} />
          </a>
        </div>
      </footer>
    </main>
  );
}

function MarketPreview() {
  const rows = [
    ["Kopi Nako", "4.8", "92%"],
    ["Titik Temu", "4.6", "84%"],
    ["Common Grounds", "4.5", "78%"],
  ];

  return (
    <aside
      aria-label="Example MarketLens research workspace"
      className="enter-reveal-delay relative lg:pl-4"
    >
      <div className="absolute -inset-6 bg-[#315ef5]/12 blur-3xl" aria-hidden="true" />
      <div className="relative overflow-hidden rounded-[1.125rem] border border-white/16 bg-[#f8faff] text-[var(--ink)] shadow-[var(--shadow-lg)]">
        <div className="flex min-h-12 items-center justify-between border-b border-[#dbe1ec] bg-white px-4">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#b9c3d3]" />
            <span className="size-2 rounded-full bg-[#b9c3d3]" />
            <span className="size-2 rounded-full bg-[#315ef5]" />
          </div>
          <p className="type-data text-[0.62rem] font-semibold tracking-[0.08em] text-[#68758b] uppercase">
            Study / Coffee shops / Malang
          </p>
          <span className="status-pill border-[#315ef5] bg-[#eef2ff] text-[#2347c8]">
            <span className="status-dot" /> Ready
          </span>
        </div>

        <div className="grid lg:grid-cols-[1.28fr_0.72fr]">
          <div className="relative min-h-70 overflow-hidden border-b border-[#dbe1ec] bg-[#e8edf7] lg:border-r lg:border-b-0">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-80"
              style={{
                backgroundImage:
                  "linear-gradient(32deg, transparent 46%, rgba(255,255,255,.92) 47%, rgba(255,255,255,.92) 50%, transparent 51%), linear-gradient(128deg, transparent 46%, rgba(255,255,255,.72) 47%, rgba(255,255,255,.72) 49%, transparent 50%), linear-gradient(rgba(49,94,245,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(49,94,245,.08) 1px, transparent 1px)",
                backgroundSize: "120px 90px, 150px 110px, 32px 32px, 32px 32px",
              }}
            />
            <div className="absolute top-[18%] left-[16%] size-36 rounded-full border border-[#315ef5]/55 bg-[#315ef5]/10 sm:size-44" />
            {[
              ["23%", "28%", "4.8"],
              ["58%", "38%", "4.6"],
              ["42%", "66%", "4.5"],
              ["74%", "72%", "4.3"],
            ].map(([left, top, rating], index) => (
              <span
                aria-hidden="true"
                className={`absolute grid size-8 place-items-center rounded-md border-2 border-white text-[0.62rem] font-extrabold text-white shadow-md ${
                  index === 0 ? "bg-[#315ef5]" : "bg-[#25344f]"
                }`}
                key={`${left}-${top}`}
                style={{ left, top }}
              >
                {rating}
              </span>
            ))}
            <div className="absolute bottom-4 left-4 rounded-md border border-white/80 bg-white/92 px-3 py-2 shadow-sm backdrop-blur">
              <p className="data-label">Research radius</p>
              <p className="mt-1 text-sm font-extrabold">5.0 km · 48 places</p>
            </div>
          </div>

          <div className="bg-white p-5">
            <p className="data-label">Market pulse</p>
            <p className="type-display mt-4 text-6xl leading-none font-medium tracking-[-0.05em] text-[var(--accent)]">
              72
            </p>
            <p className="mt-1 text-xs font-semibold text-[var(--ink-faint)]">
              competition index
            </p>
            <dl className="mt-6 divide-y divide-[var(--rule)] border-y border-[var(--rule)]">
              <PreviewMetric label="Average rating" value="4.3" />
              <PreviewMetric label="Median reviews" value="127" />
              <PreviewMetric label="Density" value="0.61/km²" />
            </dl>
            <p className="mt-5 flex gap-2 text-xs leading-5 text-[var(--ink-soft)]">
              <Database aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--copper)]" size={14} />
              Central activity is high. Two western pockets remain lightly
              served.
            </p>
          </div>
        </div>

        <div className="bg-white px-4 py-3 sm:px-5">
          <div className="grid grid-cols-[1fr_3.5rem_3.5rem] border-b border-[var(--rule)] pb-2 text-[0.64rem] font-bold tracking-[0.06em] text-[var(--ink-faint)] uppercase">
            <span>Competitor</span>
            <span>Rating</span>
            <span>Score</span>
          </div>
          {rows.map(([name, rating, score]) => (
            <div
              className="grid grid-cols-[1fr_3.5rem_3.5rem] items-center border-b border-[var(--rule)] py-2.5 text-xs last:border-b-0"
              key={name}
            >
              <span className="truncate font-bold">{name}</span>
              <span className="type-data text-[0.68rem] text-[var(--ink-soft)]">
                {rating}
              </span>
              <span className="type-data text-[0.68rem] font-bold text-[var(--accent)]">
                {score}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <dt className="text-xs text-[var(--ink-soft)]">{label}</dt>
      <dd className="type-data text-xs font-bold text-[var(--ink)]">{value}</dd>
    </div>
  );
}
