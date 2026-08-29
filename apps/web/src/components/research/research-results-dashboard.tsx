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
        className="border border-[color:var(--danger)] bg-[#f7e6e2] p-4 text-sm text-[var(--danger)]"
        role="alert"
      >
        {error}
      </p>
    );
  if (!data)
    return (
      <p
        className="paper-panel p-5 text-sm text-[var(--ink-soft)]"
        aria-live="polite"
      >
        Loading research results…
      </p>
    );
  if (!data.marketMetrics || data.status !== "READY")
    return (
      <p className="border border-[#c9954f] bg-[#f4ead8] p-5 text-sm text-[#7b4d18]">
        Results will appear when this research reaches READY.
      </p>
    );

  const metrics = data.marketMetrics;
  return (
    <section className="mx-auto w-full max-w-7xl space-y-7">
      <header className="grid gap-5 border-b border-[var(--rule-strong)] pb-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="eyebrow">Market report / ready</p>
          <h1 className="type-display mt-3 text-4xl leading-none tracking-[-0.045em] text-balance sm:text-5xl">{data.name}</h1>
          <p className="mt-4 text-base text-[var(--ink-soft)]">{data.query} <span className="px-1 text-[var(--ink-faint)]">/</span> {data.locationQuery}</p>
        </div>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:flex sm:gap-8">
          <div><dt className="data-label">Radius</dt><dd className="mt-1 font-semibold tabular-nums">{Math.round(data.radiusMeters / 1_000)} km</dd></div>
          <div><dt className="data-label">Status</dt><dd className="mt-1 font-semibold text-[var(--success)]">Complete</dd></div>
        </dl>
      </header>
      <dl className="grid divide-y divide-[var(--rule)] border-y border-[var(--rule)] sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
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
      <div className="grid gap-5 lg:grid-cols-2">
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
      <section className="paper-panel space-y-5 p-4 sm:p-6">
        <div className="flex flex-col justify-between gap-4 border-b border-[var(--rule)] pb-5 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Observed places</p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">Businesses</h2>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">
              {places.length} shown from {data.places.length}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              aria-label="Filter businesses"
              className="ui-input min-w-45 flex-1 py-2 text-sm sm:flex-none"
              placeholder="Search name or category"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <select
              aria-label="Sort businesses"
              className="ui-input w-auto py-2 text-sm"
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value as typeof sortBy)
              }
            >
              <option value="score">Competition score</option>
              <option value="rating">Rating</option>
              <option value="name">Name</option>
            </select>
            <label className="flex min-h-11 items-center gap-2 px-1 text-sm text-[var(--ink-soft)]">
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
          <p className="bg-[var(--paper-muted)] p-4 text-sm text-[var(--ink-soft)]">
            No businesses match this filter.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-[var(--rule-strong)] text-[var(--ink-faint)]">
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
                    className={`cursor-pointer border-b border-[var(--rule)] text-[var(--ink-soft)] transition-colors hover:bg-[var(--accent-wash)] ${selectedPlaceId === place.id ? "bg-[var(--accent-soft)]" : ""}`}
                    key={place.id}
                    onClick={() => setSelectedPlaceId(place.id)}
                  >
                    <td className="p-3">
                      <p className="font-medium text-[var(--ink)]">{place.name}</p>
                      <p className="text-[var(--ink-faint)]">
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
    <div className="p-4 sm:p-5">
      <dt className="data-label">{label}</dt>
      <dd className="type-display mt-2 text-4xl leading-none tabular-nums text-[var(--ink)]">
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
    <section className="paper-panel p-5">
      <p className="eyebrow">Distribution</p>
      <h2 className="mt-2 font-semibold text-[var(--ink)]">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex justify-between text-xs text-[var(--ink-faint)]">
              <span>{item.label}</span>
              <span>{item.count}</span>
            </div>
            <div className="h-2 bg-[var(--paper-muted)]">
              <div
                className="h-full bg-[var(--accent)]"
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
