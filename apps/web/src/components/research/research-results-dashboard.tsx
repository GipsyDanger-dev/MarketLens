"use client";

import { useEffect, useMemo, useState } from "react";

import { ResearchMap } from "./research-map";
import { CompetitorPanel } from "./competitor-panel";
import { ResearchAiInsights } from "./research-ai-insights";
import { ResearchExportControls } from "./research-export-controls";

interface PlaceResult {
  id: string;
  name: string;
  category: string | null;
  address: string | null;
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

interface ResultsPayload {
  name: string;
  query: string;
  locationQuery: string;
  status: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  marketMetrics: {
    totalBusinesses: number;
    averageRating: number | null;
    averageReviewCount: number | null;
    competitionScore: number | null;
    densityScore: number | null;
    metricJson: {
      ratingDistribution?: { label: string; count: number }[];
      reviewDistribution?: { label: string; count: number }[];
    };
  } | null;
  places: PlaceResult[];
}

export function ResearchResultsDashboard({
  researchId,
}: {
  researchId: string;
}) {
  const [data, setData] = useState<ResultsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "rating" | "score">("score");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [withinRadiusOnly, setWithinRadiusOnly] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/research/${encodeURIComponent(researchId)}/results`, {
      cache: "no-store",
    })
      .then(async (response) => {
        const body = (await response.json()) as ResultsPayload & {
          error?: string;
        };
        if (!response.ok)
          throw new Error(body.error ?? "Unable to load results.");
        if (!cancelled) setData(body);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load results.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [researchId]);

  const places = useMemo(() => {
    if (!data) return [];
    const search = query.trim().toLocaleLowerCase();
    return data.places
      .filter(
        (place) =>
          !search ||
          `${place.name} ${place.category ?? ""}`
            .toLocaleLowerCase()
            .includes(search),
      )
      .filter(
        (place) =>
          !withinRadiusOnly ||
          distanceMeters(
            data.latitude,
            data.longitude,
            place.latitude,
            place.longitude,
          ) <= data.radiusMeters,
      )
      .sort((left, right) => {
        if (sortBy === "name") return left.name.localeCompare(right.name);
        if (sortBy === "rating")
          return (right.rating ?? -1) - (left.rating ?? -1);
        return (
          (right.competitorScores[0]?.overallScore ?? -1) -
          (left.competitorScores[0]?.overallScore ?? -1)
        );
      });
  }, [data, query, sortBy, withinRadiusOnly]);

  if (error)
    return (
      <p
        className="rounded-xl border border-rose-400/40 bg-rose-400/10 p-4 text-sm text-rose-100"
        role="alert"
      >
        {error}
      </p>
    );
  if (!data)
    return (
      <p
        className="rounded-xl bg-slate-900 p-5 text-sm text-slate-300"
        aria-live="polite"
      >
        Loading research results…
      </p>
    );
  if (!data.marketMetrics || data.status !== "READY")
    return (
      <p className="rounded-xl border border-amber-300/30 bg-amber-300/10 p-5 text-sm text-amber-100">
        Results will appear when this research reaches READY.
      </p>
    );

  const metrics = data.marketMetrics;
  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold tracking-[0.2em] text-cyan-300 uppercase">
          Market results
        </p>
        <h1 className="text-3xl font-semibold text-slate-50">{data.name}</h1>
        <p className="text-sm text-slate-400">
          {data.query} · {data.locationQuery}
        </p>
      </header>
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Businesses" value={metrics.totalBusinesses} />
        <Metric
          label="Average rating"
          value={formatNumber(metrics.averageRating)}
        />
        <Metric
          label="Average reviews"
          value={formatNumber(metrics.averageReviewCount)}
        />
        <Metric
          label="Density / km²"
          value={formatNumber(metrics.densityScore)}
        />
      </dl>
      <div className="grid gap-6 lg:grid-cols-2">
        <Distribution
          title="Rating distribution"
          items={metrics.metricJson.ratingDistribution ?? []}
        />
        <Distribution
          title="Review distribution"
          items={metrics.metricJson.reviewDistribution ?? []}
        />
      </div>
      <ResearchMap
        center={{ latitude: data.latitude, longitude: data.longitude }}
        places={places}
        radiusMeters={data.radiusMeters}
        selectedPlaceId={selectedPlaceId}
        onPlaceSelect={setSelectedPlaceId}
      />
      <CompetitorPanel
        onSelect={setSelectedPlaceId}
        places={places}
        selectedPlaceId={selectedPlaceId}
      />
      <ResearchAiInsights researchId={researchId} />
      <ResearchExportControls researchId={researchId} />
      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Businesses</h2>
            <p className="text-sm text-slate-400">
              {places.length} shown from {data.places.length}
            </p>
          </div>
          <div className="flex gap-2">
            <input
              aria-label="Filter businesses"
              className="min-w-0 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              placeholder="Search name or category"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <select
              aria-label="Sort businesses"
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value as typeof sortBy)
              }
            >
              <option value="score">Competition score</option>
              <option value="rating">Rating</option>
              <option value="name">Name</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                checked={withinRadiusOnly}
                onChange={(event) => setWithinRadiusOnly(event.target.checked)}
                type="checkbox"
              />
              In radius
            </label>
          </div>
        </div>
        {places.length === 0 ? (
          <p className="rounded-lg bg-slate-800/70 p-4 text-sm text-slate-300">
            No businesses match this filter.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-700 text-slate-400">
                <tr>
                  <th className="p-3">Business</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3">Reviews</th>
                  <th className="p-3">Competition</th>
                </tr>
              </thead>
              <tbody>
                {places.map((place) => (
                  <tr
                    className={`cursor-pointer border-b border-slate-800 text-slate-200 ${selectedPlaceId === place.id ? "bg-cyan-300/10" : ""}`}
                    key={place.id}
                    onClick={() => setSelectedPlaceId(place.id)}
                  >
                    <td className="p-3">
                      <p className="font-medium text-slate-100">{place.name}</p>
                      <p className="text-slate-400">
                        {place.category ?? place.address ?? "Uncategorized"}
                      </p>
                    </td>
                    <td className="p-3">{formatNumber(place.rating)}</td>
                    <td className="p-3">{formatNumber(place.reviewCount)}</td>
                    <td className="p-3">
                      {formatPercent(place.competitorScores[0]?.overallScore)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <dt className="text-sm text-slate-400">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tabular-nums text-slate-50">
        {value}
      </dd>
    </div>
  );
}
function Distribution({
  title,
  items,
}: {
  title: string;
  items: { label: string; count: number }[];
}) {
  const maximum = Math.max(1, ...items.map((item) => item.count));
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <h2 className="font-semibold text-slate-100">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex justify-between text-xs text-slate-400">
              <span>{item.label}</span>
              <span>{item.count}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-cyan-300"
                style={{ width: `${(item.count / maximum) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
function formatNumber(value: number | null | undefined) {
  return value === null || value === undefined
    ? "—"
    : new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
        value,
      );
}
function formatPercent(value: number | undefined) {
  return value === undefined ? "—" : `${Math.round(value * 100)}%`;
}

function distanceMeters(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
) {
  const radians = (value: number) => (value * Math.PI) / 180;
  const latitudeDelta = radians(latitudeB - latitudeA);
  const longitudeDelta = radians(longitudeB - longitudeA);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(latitudeA)) *
      Math.cos(radians(latitudeB)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 6_371_000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
