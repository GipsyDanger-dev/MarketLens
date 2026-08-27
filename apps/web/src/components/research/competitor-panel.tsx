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
  const nearby = nearbyCompetitors(selected, ranked, 1_000);
  return (
    <section className="grid gap-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 lg:grid-cols-2">
      <div>
        <h2 className="font-semibold text-slate-100">Competitor ranking</h2>
        <ol className="mt-3 space-y-2">
          {ranked.map((place, index) => (
            <li key={place.id}>
              <button
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${place.id === selected.id ? "bg-cyan-300/15 text-cyan-100" : "bg-slate-800/70 text-slate-200"}`}
                onClick={() => onSelect(place.id)}
              >
                <span>
                  {index + 1}. {place.name}
                </span>
                <span>
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
        <p className="text-sm font-medium text-cyan-300">Selected competitor</p>
        <h3 className="mt-1 text-xl font-semibold text-slate-50">
          {selected.name}
        </h3>
        <p className="mt-2 text-sm text-slate-400">
          {score?.explanation ?? "No score explanation is available."}
        </p>
        <dl className="mt-4 space-y-2">
          {components.map(([name, value]) => (
            <div className="flex justify-between text-sm" key={name}>
              <dt className="text-slate-400">{name}</dt>
              <dd className="font-medium text-slate-100">
                {Math.round(value * 100)}%
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-slate-300">
          Strengths: {narrative.strengths.join(", ") || "—"}
        </p>
        <p className="text-sm text-slate-300">
          Weaknesses: {narrative.weaknesses.join(", ") || "—"}
        </p>
        <p className="mt-4 text-sm text-slate-300">
          Nearby within 1 km:{" "}
          {nearby
            .map(
              ({ place, distanceMeters }) =>
                `${place.name} (${distanceMeters}m)`,
            )
            .join(", ") || "None"}
        </p>
      </div>
    </section>
  );
}
