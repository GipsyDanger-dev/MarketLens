export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <section className="max-w-2xl space-y-6 text-center">
        <p className="text-sm font-semibold tracking-[0.3em] text-cyan-300 uppercase">
          MarketLens
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          Local market intelligence, on your terms.
        </h1>
        <p className="text-lg leading-8 text-slate-300">
          An open-source platform for collecting, normalizing, and analyzing
          local business data without making paid providers or AI mandatory.
        </p>
        <p className="text-sm text-slate-400">Sprint 0 foundation is underway.</p>
      </section>
    </main>
  );
}
