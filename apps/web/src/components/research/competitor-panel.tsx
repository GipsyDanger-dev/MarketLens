"use client";

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
  const selected =
    ranked.find((place) => place.id === selectedPlaceId) ?? ranked[0] ?? null;
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
  return (
    <section className="paper-panel grid gap-6 p-5 lg:grid-cols-[0.88fr_1.12fr] sm:p-6">
      <div className="border-b border-[var(--rule)] pb-6 lg:border-r lg:border-b-0 lg:pr-6 lg:pb-0">
        <p className="eyebrow">Competitive field</p>
        <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-[var(--ink)]">
          Competitor ranking
        </h2>
        <ol className="mt-4 divide-y divide-[var(--rule)] border-y border-[var(--rule)]">
          {ranked.map((place, index) => (
            <li key={place.id}>
              <button
                className={`flex min-h-12 w-full items-center justify-between gap-3 px-2 text-left text-sm transition-colors hover:bg-[var(--accent-wash)] ${place.id === selected.id ? "bg-[var(--accent-soft)] text-[var(--ink)]" : "text-[var(--ink-soft)]"}`}
                onClick={() => onSelect(place.id)}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="font-mono text-xs text-[var(--ink-faint)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="truncate">{place.name}</span>
                </span>
                <span className="font-mono text-xs tabular-nums">
                  {Math.round(
                    (place.competitorScores[0]?.overallScore ?? 0) * 100,
                  )}
                  %
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <div>
        <p className="eyebrow">Selected place</p>
        <h3 className="type-display mt-3 text-3xl leading-none tracking-[-0.035em] text-[var(--ink)]">
          {selected.name}
        </h3>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--ink-soft)]">
          {score?.explanation ?? "No score explanation is available."}
        </p>
        <dl className="mt-5 space-y-0 border-y border-[var(--rule)]">
          {components.map(([name, value]) => (
            <div
              className="flex justify-between gap-4 border-b border-[var(--rule)] py-2 text-sm last:border-b-0"
              key={name}
            >
              <dt className="text-[var(--ink-soft)]">{name}</dt>
              <dd className="font-mono text-xs font-medium tabular-nums text-[var(--ink)]">
                {Math.round(value * 100)}%
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 text-sm leading-6 text-[var(--ink-soft)]">
          Strengths: {narrative.strengths.join(", ") || "—"}
        </p>
        <p className="text-sm leading-6 text-[var(--ink-soft)]">
          Weaknesses: {narrative.weaknesses.join(", ") || "—"}
        </p>
        <p className="mt-5 border-t border-[var(--rule)] pt-4 text-sm leading-6 text-[var(--ink-soft)]">
          Nearby within 1 km:{" "}
          {nearby
            .map(
              ({ place, distanceMeters }) =>
                `${place.name} (${distanceMeters}m)`,
            )
            .join(", ") || "None"}
        </p>
      </div>
      <div className="border-t border-[var(--rule-strong)] pt-5 lg:col-span-2">
        <p className="eyebrow">Side-by-side</p>
        <h3 className="mt-2 font-semibold text-[var(--ink)]">Comparison</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-[var(--rule-strong)] text-[var(--ink-faint)]">
              <tr>
                <th className="p-2">Competitor</th>
                <th className="p-2">Rating</th>
                <th className="p-2">Reviews</th>
                <th className="p-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((place) => (
                <tr
                  className="border-b border-[var(--rule)] text-[var(--ink-soft)]"
                  key={place.id}
                >
                  <td className="p-2">{place.name}</td>
                  <td className="p-2">{place.rating ?? "—"}</td>
                  <td className="p-2">{place.reviewCount ?? "—"}</td>
                  <td className="p-2">
                    {Math.round(
                      (place.competitorScores[0]?.overallScore ?? 0) * 100,
                    )}
                    %
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
