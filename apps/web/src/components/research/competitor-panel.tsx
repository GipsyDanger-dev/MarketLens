"use client";

import { ArrowRight, Gauge, MapPin, ShieldCheck, Trophy } from "lucide-react";
import type { ReactNode } from "react";

import {
  nearbyCompetitors,
  scoreNarrative,
} from "@/analytics/competitor-intelligence";

interface Competitor {
  id: string;
  name: string;
  rating: number | null;
  reviewCount: number | null;
  latitude: number;
  longitude: number;
  competitorScores: {
    overallScore: number;
    explanation: string | null;
    componentScores: Record<string, number>;
  }[];
}

export function CompetitorPanel({
  places,
  selectedPlaceId,
  onSelect,
}: {
  places: readonly Competitor[];
  selectedPlaceId: string | null;
  onSelect: (id: string) => void;
}) {
  const ranked = [...places].sort(
    (left, right) =>
      (right.competitorScores[0]?.overallScore ?? 0) -
      (left.competitorScores[0]?.overallScore ?? 0),
  );
  const selected = ranked.find((place) => place.id === selectedPlaceId) ?? ranked[0] ?? null;
  if (!selected) return null;

  const score = selected.competitorScores[0];
  const components = Object.entries(score?.componentScores ?? {}).sort(
    ([, left], [, right]) => right - left,
  );
  const narrative = scoreNarrative(score?.componentScores ?? {});
  const nearby = nearbyCompetitors(
    { ...selected, componentScores: score?.componentScores ?? {} },
    ranked.map((place) => ({
      ...place,
      componentScores: place.competitorScores[0]?.componentScores ?? {},
    })),
    1_000,
  );
  const selectedScore = Math.round((score?.overallScore ?? 0) * 100);

  return (
    <section className="overflow-hidden rounded-xl border border-[var(--rule-strong)] bg-white shadow-[var(--shadow-soft)]">
      <header className="grid gap-5 border-b border-[var(--rule)] p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="eyebrow">Competitive field</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.045em] text-[var(--ink)]">Explainable competitor ranking</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
            Compare market presence through rating strength, review authority, local density, and proximity—not a black-box verdict.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-md border border-[var(--accent-line)] bg-[var(--accent-soft)] px-4 py-3">
          <Trophy aria-hidden="true" className="text-[var(--accent)]" size={20} />
          <div>
            <p className="font-mono text-[0.58rem] tracking-[0.09em] text-[var(--ink-faint)] uppercase">Field size</p>
            <p className="mt-0.5 text-sm font-extrabold text-[var(--ink)]">{ranked.length} ranked places</p>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[minmax(18rem,0.72fr)_minmax(0,1.28fr)]">
        <div className="border-b border-[var(--rule)] lg:border-r lg:border-b-0">
          <div className="flex items-center justify-between border-b border-[var(--rule)] bg-[var(--paper-subtle)] px-5 py-3">
            <span className="data-label">Ranked businesses</span>
            <span className="font-mono text-[0.62rem] text-[var(--ink-faint)]">Score / 100</span>
          </div>
          <ol className="max-h-[39rem] overflow-y-auto">
            {ranked.map((place, index) => {
              const placeScore = Math.round((place.competitorScores[0]?.overallScore ?? 0) * 100);
              const isSelected = place.id === selected.id;
              return (
                <li className="border-b border-[var(--rule)] last:border-b-0" key={place.id}>
                  <button
                    aria-pressed={isSelected}
                    className={`group grid min-h-17 w-full grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 px-5 text-left transition-colors ${isSelected ? "bg-[var(--graphite)] text-white" : "text-[var(--ink-soft)] hover:bg-[var(--paper-muted)]"}`}
                    onClick={() => onSelect(place.id)}
                    type="button"
                  >
                    <span className={`font-mono text-[0.66rem] ${isSelected ? "text-[#8fa8ff]" : "text-[var(--ink-faint)]"}`}>{String(index + 1).padStart(2, "0")}</span>
                    <span className="min-w-0">
                      <span className={`block truncate text-sm font-bold ${isSelected ? "text-white" : "text-[var(--ink)]"}`}>{place.name}</span>
                      <span className={`mt-1 block text-xs ${isSelected ? "text-[#9fadc4]" : "text-[var(--ink-faint)]"}`}>{place.rating ?? "—"} rating · {place.reviewCount ?? "—"} reviews</span>
                    </span>
                    <span className={`font-mono text-sm font-extrabold tabular-nums ${isSelected ? "text-[#8fa8ff]" : "text-[var(--accent)]"}`}>{placeScore}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <article className="p-5 sm:p-7 lg:p-8">
          <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
            <div>
              <p className="eyebrow">Selected place</p>
              <h3 className="type-display mt-3 text-[clamp(2.7rem,6vw,5rem)] leading-[0.9] tracking-[-0.055em] text-[var(--ink)]">{selected.name}</h3>
              <p className="mt-5 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">{score?.explanation ?? "No score explanation is available for this place."}</p>
            </div>
            <div className="grid size-28 shrink-0 place-items-center rounded-full border border-[var(--accent-line)] bg-[var(--accent-soft)] text-center shadow-[inset_0_0_0_8px_white]">
              <span>
                <strong className="type-display block text-4xl leading-none text-[var(--accent)]">{selectedScore}</strong>
                <span className="mt-1 block font-mono text-[0.55rem] font-bold tracking-[0.08em] text-[var(--ink-faint)] uppercase">Overall</span>
              </span>
            </div>
          </div>

          <div className="mt-8 border-y border-[var(--rule)] py-2">
            {components.length === 0 ? <p className="py-3 text-sm text-[var(--ink-faint)]">No component scores available.</p> : null}
            {components.map(([name, value]) => (
              <div className="grid grid-cols-[7rem_minmax(0,1fr)_2.7rem] items-center gap-3 py-2.5" key={name}>
                <span className="truncate text-xs font-semibold capitalize text-[var(--ink-soft)]">{name.replaceAll("_", " ")}</span>
                <span className="h-1.5 overflow-hidden rounded-full bg-[var(--paper-muted)]">
                  <span className="block h-full rounded-full bg-[var(--accent)]" style={{ width: `${Math.max(0, Math.min(100, value * 100))}%` }} />
                </span>
                <span className="text-right font-mono text-[0.66rem] font-bold text-[var(--ink)]">{Math.round(value * 100)}%</span>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <NarrativeBlock icon={<ShieldCheck aria-hidden="true" size={17} />} label="Relative strengths" value={narrative.strengths.join(", ") || "No dominant signal"} />
            <NarrativeBlock icon={<Gauge aria-hidden="true" size={17} />} label="Relative weaknesses" value={narrative.weaknesses.join(", ") || "No material weakness"} />
          </div>

          <div className="mt-6 rounded-lg border border-[var(--rule)] bg-[var(--paper-subtle)] p-4">
            <p className="flex items-center gap-2 text-xs font-bold text-[var(--ink)]"><MapPin aria-hidden="true" className="text-[var(--copper)]" size={15} />Nearby within 1 km</p>
            <p className="mt-2 text-xs leading-5 text-[var(--ink-soft)]">
              {nearby.map(({ place, distanceMeters }) => `${place.name} (${distanceMeters}m)`).join(" · ") || "No other ranked place is within one kilometre."}
            </p>
          </div>
        </article>
      </div>

      <div className="border-t border-[var(--rule-strong)]">
        <div className="flex items-center justify-between px-5 py-4 sm:px-7">
          <div>
            <p className="data-label">Side-by-side evidence</p>
            <h3 className="mt-1 text-lg font-extrabold tracking-[-0.03em] text-[var(--ink)]">Comparison register</h3>
          </div>
          <ArrowRight aria-hidden="true" className="text-[var(--accent)]" size={20} />
        </div>

        <div className="grid gap-px bg-[var(--rule)] md:hidden">
          {ranked.map((place, index) => (
            <div className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 bg-white px-5 py-4" key={place.id}>
              <span className="font-mono text-[0.62rem] text-[var(--ink-faint)]">{String(index + 1).padStart(2, "0")}</span>
              <span className="min-w-0"><strong className="block truncate text-sm text-[var(--ink)]">{place.name}</strong><span className="mt-1 block text-xs text-[var(--ink-faint)]">{place.rating ?? "—"} rating · {place.reviewCount ?? "—"} reviews</span></span>
              <strong className="font-mono text-sm text-[var(--accent)]">{Math.round((place.competitorScores[0]?.overallScore ?? 0) * 100)}%</strong>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-[var(--paper-subtle)] font-mono text-[0.62rem] tracking-[0.08em] text-[var(--ink-faint)] uppercase">
              <tr><th className="px-7 py-3">Rank / competitor</th><th className="px-4 py-3">Rating</th><th className="px-4 py-3">Reviews</th><th className="px-7 py-3 text-right">Score</th></tr>
            </thead>
            <tbody>
              {ranked.map((place, index) => (
                <tr className="border-t border-[var(--rule)] text-[var(--ink-soft)]" key={place.id}>
                  <td className="px-7 py-3.5"><span className="mr-4 font-mono text-[0.65rem] text-[var(--ink-faint)]">{String(index + 1).padStart(2, "0")}</span><strong className="text-[var(--ink)]">{place.name}</strong></td>
                  <td className="px-4 py-3.5 tabular-nums">{place.rating ?? "—"}</td>
                  <td className="px-4 py-3.5 tabular-nums">{place.reviewCount ?? "—"}</td>
                  <td className="px-7 py-3.5 text-right font-mono font-bold text-[var(--accent)]">{Math.round((place.competitorScores[0]?.overallScore ?? 0) * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function NarrativeBlock({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--rule)] p-4">
      <p className="flex items-center gap-2 text-xs font-bold text-[var(--ink)]"><span className="text-[var(--accent)]">{icon}</span>{label}</p>
      <p className="mt-2 text-xs leading-5 text-[var(--ink-soft)]">{value}</p>
    </div>
  );
}
