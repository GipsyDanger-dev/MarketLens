"use client";

import {
  BarChart3,
  Building2,
  Download,
  ExternalLink,
  Filter,
  Lightbulb,
  Map as MapIcon,
  Search,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { toSafeExternalUrl } from "@/lib/external-url";

import { BusinessDetailPanel } from "./business-detail-panel";
import { CompetitorPanel } from "./competitor-panel";
import { ResearchAiInsights } from "./research-ai-insights";
import { ResearchExportControls } from "./research-export-controls";
import { ResearchMap } from "./research-map";

interface PlaceResult {
  id: string;
  name: string;
  category: string | null;
  address: string | null;
  rating: number | null;
  reviewCount: number | null;
  phone: string | null;
  website: string | null;
  emails: string[] | null;
  socialLinks: Record<string, string> | null;
  sourceUrl: string | null;
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

type WorkspaceView =
  | "overview"
  | "map"
  | "competitors"
  | "businesses"
  | "insights"
  | "export";

const WORKSPACE_VIEWS: {
  id: WorkspaceView;
  label: string;
  icon: typeof BarChart3;
}[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "map", label: "Map", icon: MapIcon },
  { id: "competitors", label: "Competitors", icon: Trophy },
  { id: "businesses", label: "Businesses", icon: Building2 },
  { id: "insights", label: "AI insights", icon: Sparkles },
  { id: "export", label: "Export", icon: Download },
];

export function ResearchResultsDashboard({ researchId }: { researchId: string }) {
  const [data, setData] = useState<ResultsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "rating" | "score">("score");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [withinRadiusOnly, setWithinRadiusOnly] = useState(false);
  const [activeView, setActiveView] = useState<WorkspaceView>("overview");

  useEffect(() => {
    let cancelled = false;
    const loadResults = () => {
      void fetch(`/api/research/${encodeURIComponent(researchId)}/results`, {
        cache: "no-store",
      })
        .then(async (response) => {
          const body = (await response.json()) as ResultsPayload & { error?: string };
          if (!response.ok) throw new Error(body.error ?? "Unable to load results.");
          if (!cancelled) {
            setData(body);
            setError(null);
          }
        })
        .catch((loadError: unknown) => {
          if (!cancelled) {
            setError(loadError instanceof Error ? loadError.message : "Unable to load results.");
          }
        });
    };

    loadResults();
    if (data?.status === "READY") {
      return () => {
        cancelled = true;
      };
    }

    const interval = window.setInterval(loadResults, 2_500);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [data?.status, researchId]);

  const places = useMemo(() => {
    if (!data) return [];
    const search = query.trim().toLocaleLowerCase();
    return data.places
      .filter(
        (place) =>
          !search ||
          `${place.name} ${place.category ?? ""}`.toLocaleLowerCase().includes(search),
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
        if (sortBy === "rating") return (right.rating ?? -1) - (left.rating ?? -1);
        return (
          (right.competitorScores[0]?.overallScore ?? -1) -
          (left.competitorScores[0]?.overallScore ?? -1)
        );
      });
  }, [data, query, sortBy, withinRadiusOnly]);

  if (error) {
    return (
      <div className="rounded-lg border border-[#e8b5ae] bg-[#fff1ef] p-5 text-sm font-semibold text-[var(--danger)]" role="alert">
        {error}
      </div>
    );
  }
  if (!data) {
    return (
      <div className="rounded-xl border border-[var(--rule)] bg-white p-6 text-sm text-[var(--ink-soft)] shadow-[var(--shadow-soft)]" aria-live="polite">
        Loading research results…
      </div>
    );
  }
  if (!data.marketMetrics || data.status !== "READY") {
    return (
      <div className="rounded-lg border border-[#dfc39d] bg-[#fff8ec] p-5 text-sm text-[#78471e]">
        Results will appear when this research reaches READY.
      </div>
    );
  }

  const metrics = data.marketMetrics;
  const selectedPlace = data.places.find((place) => place.id === selectedPlaceId) ?? null;
  const openPlaceOnMap = (placeId: string) => {
    setSelectedPlaceId(placeId);
    setActiveView("map");
  };

  return (
    <section className="min-w-0">
      <header className="dark-grid overflow-hidden rounded-xl border border-[var(--graphite)] bg-[var(--graphite)] text-white shadow-[var(--shadow-strong)]">
        <div className="grid gap-8 px-6 py-7 sm:px-8 sm:py-9 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <div className="flex items-center gap-3 font-mono text-[0.66rem] font-bold tracking-[0.14em] text-[#93a9da] uppercase">
              <span className="h-px w-7 bg-[#6f8fff]" />
              Market report / ready
            </div>
            <h1 className="type-display mt-5 max-w-4xl text-[clamp(3rem,7vw,6.5rem)] leading-[0.88] tracking-[-0.06em] text-white">
              {data.name}
            </h1>
            <p className="mt-5 flex flex-wrap items-center gap-2 text-sm text-[#bdc9dc]">
              <strong className="text-white">{data.query}</strong>
              <span aria-hidden="true" className="text-[#627292]">/</span>
              {data.locationQuery}
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-white/14 bg-white/14 text-sm">
            <div className="min-w-28 bg-[#0d1728] px-4 py-3">
              <dt className="font-mono text-[0.61rem] tracking-[0.1em] text-[#8fa1bd] uppercase">Radius</dt>
              <dd className="mt-1 font-bold tabular-nums">{formatNumber(data.radiusMeters / 1_000)} km</dd>
            </div>
            <div className="min-w-28 bg-[#0d1728] px-4 py-3">
              <dt className="font-mono text-[0.61rem] tracking-[0.1em] text-[#8fa1bd] uppercase">Status</dt>
              <dd className="mt-1 flex items-center gap-2 font-bold text-[#7ed59e]"><span className="size-1.5 rounded-full bg-current" />Complete</dd>
            </div>
          </dl>
        </div>

        <dl className="grid border-t border-white/14 sm:grid-cols-2 lg:grid-cols-4">
          <Metric dark label="Businesses" value={metrics.totalBusinesses} />
          <Metric dark label="Average rating" value={formatNumber(metrics.averageRating)} />
          <Metric dark label="Average reviews" value={formatNumber(metrics.averageReviewCount)} />
          <Metric dark label="Density / km²" value={formatNumber(metrics.densityScore)} />
        </dl>
      </header>

      <nav aria-label="Research result views" className="sticky top-18 z-30 mt-5 overflow-x-auto rounded-lg border border-[var(--rule-strong)] bg-[rgb(255_255_255/0.94)] p-1.5 shadow-[var(--shadow-soft)] backdrop-blur-xl">
        <div className="flex min-w-max gap-1" role="tablist">
          {WORKSPACE_VIEWS.map(({ id, label, icon: Icon }) => (
            <button
              aria-controls={`workspace-panel-${id}`}
              aria-selected={activeView === id}
              className={`inline-flex min-h-10 items-center gap-2 rounded-md px-3.5 text-sm font-bold transition-colors ${activeView === id ? "bg-[var(--graphite)] text-white" : "text-[var(--ink-soft)] hover:bg-[var(--paper-muted)] hover:text-[var(--ink)]"}`}
              id={`workspace-tab-${id}`}
              key={id}
              onClick={() => setActiveView(id)}
              role="tab"
              type="button"
            >
              <Icon aria-hidden="true" size={15} strokeWidth={1.9} />
              {label}
            </button>
          ))}
        </div>
      </nav>

      <div className="mt-5" aria-labelledby={`workspace-tab-${activeView}`} id={`workspace-panel-${activeView}`} role="tabpanel">
        {activeView === "overview" ? (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.55fr)]">
            <div className="grid gap-5 md:grid-cols-2">
              <Distribution title="Rating distribution" items={metrics.metricJson.ratingDistribution ?? []} />
              <Distribution title="Review distribution" items={metrics.metricJson.reviewDistribution ?? []} />
            </div>
            <aside className="rounded-xl border border-[var(--rule-strong)] bg-[var(--accent-soft)] p-6">
              <Lightbulb aria-hidden="true" className="text-[var(--copper)]" size={23} strokeWidth={1.7} />
              <p className="eyebrow mt-6">Market pulse</p>
              <p className="type-display mt-3 text-6xl leading-none tracking-[-0.06em] text-[var(--accent)]">
                {formatNumber(metrics.competitionScore)}
              </p>
              <p className="mt-2 text-sm font-bold text-[var(--ink)]">Competition index</p>
              <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">
                This score summarizes the collected field. Open competitors to inspect every ranked business and its component signals.
              </p>
              <button className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-[var(--accent)] hover:text-[var(--accent-hover)]" onClick={() => setActiveView("competitors")} type="button">
                Inspect the ranking <Trophy aria-hidden="true" size={16} />
              </button>
            </aside>
          </div>
        ) : null}

        {activeView === "map" ? (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(21rem,0.45fr)]">
            <ResearchMap center={{ latitude: data.latitude, longitude: data.longitude }} places={places} radiusMeters={data.radiusMeters} selectedPlaceId={selectedPlaceId} onPlaceSelect={setSelectedPlaceId} />
            <BusinessDetailPanel place={selectedPlace} />
          </div>
        ) : null}

        {activeView === "competitors" ? (
          <CompetitorPanel onSelect={setSelectedPlaceId} places={places} selectedPlaceId={selectedPlaceId} />
        ) : null}

        {activeView === "businesses" ? (
          <BusinessDirectory
            allPlacesCount={data.places.length}
            onPlaceSelect={openPlaceOnMap}
            places={places}
            query={query}
            selectedPlaceId={selectedPlaceId}
            setQuery={setQuery}
            setSortBy={setSortBy}
            setWithinRadiusOnly={setWithinRadiusOnly}
            sortBy={sortBy}
            withinRadiusOnly={withinRadiusOnly}
          />
        ) : null}

        {activeView === "insights" ? <ResearchAiInsights researchId={researchId} /> : null}
        {activeView === "export" ? <ResearchExportControls researchId={researchId} /> : null}
      </div>
    </section>
  );
}

function BusinessDirectory({
  allPlacesCount,
  onPlaceSelect,
  places,
  query,
  selectedPlaceId,
  setQuery,
  setSortBy,
  setWithinRadiusOnly,
  sortBy,
  withinRadiusOnly,
}: {
  allPlacesCount: number;
  onPlaceSelect: (id: string) => void;
  places: PlaceResult[];
  query: string;
  selectedPlaceId: string | null;
  setQuery: (value: string) => void;
  setSortBy: (value: "name" | "rating" | "score") => void;
  setWithinRadiusOnly: (value: boolean) => void;
  sortBy: "name" | "rating" | "score";
  withinRadiusOnly: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-[var(--rule-strong)] bg-white shadow-[var(--shadow-soft)]">
      <div className="grid gap-5 border-b border-[var(--rule)] p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="eyebrow">Observed places</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[var(--ink)]">Business directory</h2>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">{places.length} shown from {allPlacesCount} collected records</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative min-w-56 flex-1">
            <Search aria-hidden="true" className="absolute top-1/2 left-3 -translate-y-1/2 text-[var(--ink-faint)]" size={16} />
            <span className="sr-only">Filter businesses</span>
            <input aria-label="Filter businesses" className="ui-input w-full pl-9" onChange={(event) => setQuery(event.target.value)} placeholder="Search name or category" value={query} />
          </label>
          <select aria-label="Sort businesses" className="ui-input w-auto" onChange={(event) => setSortBy(event.target.value as typeof sortBy)} value={sortBy}>
            <option value="score">Competition score</option>
            <option value="rating">Rating</option>
            <option value="name">Name</option>
          </select>
          <label className="flex min-h-11 items-center gap-2 rounded-md border border-[var(--rule)] px-3 text-sm font-semibold text-[var(--ink-soft)]">
            <input checked={withinRadiusOnly} onChange={(event) => setWithinRadiusOnly(event.target.checked)} type="checkbox" />
            <Filter aria-hidden="true" size={14} />In radius
          </label>
        </div>
      </div>

      {places.length === 0 ? (
        <p className="m-5 bg-[var(--paper-muted)] p-4 text-sm text-[var(--ink-soft)]">No businesses match this filter.</p>
      ) : (
        <>
          <div className="grid gap-px bg-[var(--rule)] md:hidden">
            {places.map((place) => {
              const website = toSafeExternalUrl(place.website);
              return (
                <article className={`bg-white p-5 ${selectedPlaceId === place.id ? "shadow-[inset_3px_0_0_var(--accent)]" : ""}`} key={place.id}>
                  <button className="w-full text-left" onClick={() => onPlaceSelect(place.id)} type="button">
                    <p className="font-extrabold text-[var(--ink)]">{place.name}</p>
                    <p className="mt-1 text-xs text-[var(--ink-faint)]">{place.category ?? place.address ?? "Uncategorized"}</p>
                    <dl className="mt-4 grid grid-cols-3 divide-x divide-[var(--rule)]">
                      <SmallMetric label="Rating" value={formatNumber(place.rating)} />
                      <SmallMetric label="Reviews" value={formatNumber(place.reviewCount)} />
                      <SmallMetric label="Score" value={formatPercent(place.competitorScores[0]?.overallScore)} />
                    </dl>
                  </button>
                  {website ? (
                    <a className="text-link mt-4 inline-flex min-h-11 items-center gap-2 text-xs font-bold" href={website} rel="noopener noreferrer" target="_blank">Visit website <ExternalLink aria-hidden="true" size={13} /></a>
                  ) : null}
                </article>
              );
            })}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-[var(--paper-subtle)] font-mono text-[0.64rem] tracking-[0.08em] text-[var(--ink-faint)] uppercase">
                <tr>
                  <th className="px-5 py-3.5">Business</th>
                  <th className="px-4 py-3.5">Rating</th>
                  <th className="px-4 py-3.5">Reviews</th>
                  <th className="px-4 py-3.5">Contact</th>
                  <th className="px-4 py-3.5">Website</th>
                  <th className="px-5 py-3.5 text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {places.map((place) => {
                  const website = toSafeExternalUrl(place.website);
                  return (
                    <tr className={`border-t border-[var(--rule)] text-[var(--ink-soft)] ${selectedPlaceId === place.id ? "bg-[var(--accent-soft)]" : "hover:bg-[var(--paper-subtle)]"}`} key={place.id}>
                      <td className="px-5 py-4">
                        <button className="text-left" onClick={() => onPlaceSelect(place.id)} type="button">
                          <span className="block font-bold text-[var(--ink)] hover:text-[var(--accent)]">{place.name}</span>
                          <span className="mt-1 block text-xs text-[var(--ink-faint)]">{place.category ?? place.address ?? "Uncategorized"}</span>
                        </button>
                      </td>
                      <td className="px-4 py-4 tabular-nums">{formatNumber(place.rating)}</td>
                      <td className="px-4 py-4 tabular-nums">{formatNumber(place.reviewCount)}</td>
                      <td className="px-4 py-4 text-xs">{place.phone || place.emails?.[0] || "—"}</td>
                      <td className="px-4 py-4 text-xs">
                        {website ? (
                          <a className="text-link inline-flex items-center gap-1.5 font-bold" href={website} rel="noopener noreferrer" target="_blank">{new URL(website).hostname.replace("www.", "")}<ExternalLink aria-hidden="true" size={12} /></a>
                        ) : "—"}
                      </td>
                      <td className="px-5 py-4 text-right font-mono font-bold text-[var(--accent)]">{formatPercent(place.competitorScores[0]?.overallScore)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

function Metric({ dark = false, label, value }: { dark?: boolean; label: string; value: string | number }) {
  return (
    <div className="border-b border-white/14 px-6 py-5 last:border-b-0 sm:[&:nth-child(odd)]:border-r sm:[&:nth-child(n+3)]:border-b-0 lg:border-r lg:border-b-0 lg:last:border-r-0">
      <dt className={`font-mono text-[0.63rem] font-bold tracking-[0.1em] uppercase ${dark ? "text-[#8fa1bd]" : "text-[var(--ink-faint)]"}`}>{label}</dt>
      <dd className={`type-display mt-2 text-4xl leading-none tabular-nums ${dark ? "text-white" : "text-[var(--ink)]"}`}>{value}</dd>
    </div>
  );
}

function SmallMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="px-3 first:pl-0 last:pr-0">
      <dt className="font-mono text-[0.58rem] tracking-[0.08em] text-[var(--ink-faint)] uppercase">{label}</dt>
      <dd className="mt-1 font-bold tabular-nums text-[var(--ink)]">{value}</dd>
    </div>
  );
}

function Distribution({ title, items }: { title: string; items: { label: string; count: number }[] }) {
  const maximum = Math.max(1, ...items.map((item) => item.count));
  return (
    <section className="rounded-xl border border-[var(--rule-strong)] bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <p className="eyebrow">Distribution</p>
      <h2 className="mt-2 text-xl font-extrabold tracking-[-0.03em] text-[var(--ink)]">{title}</h2>
      <div className="mt-6 space-y-4">
        {items.length === 0 ? <p className="text-sm text-[var(--ink-faint)]">No distribution data available.</p> : null}
        {items.map((item) => (
          <div className="grid grid-cols-[4.5rem_minmax(0,1fr)_2rem] items-center gap-3" key={item.label}>
            <span className="truncate font-mono text-[0.65rem] text-[var(--ink-soft)]">{item.label}</span>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--paper-muted)]">
              <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${(item.count / maximum) * 100}%` }} />
            </div>
            <span className="text-right font-mono text-[0.68rem] font-bold text-[var(--ink)]">{item.count}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function formatNumber(value: number | null | undefined) {
  return value === null || value === undefined
    ? "—"
    : new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
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
