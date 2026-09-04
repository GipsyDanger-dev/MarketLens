"use client";

import {
  ArrowLeft,
  Clock3,
  Database,
  Infinity as InfinityIcon,
  LoaderCircle,
  MapPin,
  MoveRight,
  Radar,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { MapRadiusPicker } from "./map-radius-picker";
import { Button } from "@/components/ui/button";

const COVERAGE_PRESETS = [
  { label: "Nearby", description: "1 km", radius: 1000, scrollDepth: 3 },
  { label: "Neighborhood", description: "3 km", radius: 3000, scrollDepth: 8 },
  { label: "City Center", description: "5 km", radius: 5000, scrollDepth: 12 },
  { label: "Metro Area", description: "15 km", radius: 15000, scrollDepth: 25 },
  { label: "Regional", description: "30 km", radius: 30000, scrollDepth: 50 },
  { label: "Custom", description: "Set on map", radius: 0, scrollDepth: 0 },
] as const;

type CoveragePreset = (typeof COVERAGE_PRESETS)[number]["label"];
type ResearchProvider = { id: string; name: string };

export function ResearchCreationForm({ providers }: { providers: ResearchProvider[] }) {
  const router = useRouter();
  const supportedProviders = providers.filter(
    (provider) => provider.id !== "google-maps-scraper",
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [providerId, setProviderId] = useState(
    supportedProviders[0]?.id ?? "openstreetmap",
  );
  const [query, setQuery] = useState("businesses");
  const [selectedPreset, setSelectedPreset] = useState<CoveragePreset>("City Center");
  const [radius, setRadius] = useState(5000);
  const maxResults = 999_999;
  const [scrollDepth, setScrollDepth] = useState(12);
  const [latitude, setLatitude] = useState(-7.977);
  const [longitude, setLongitude] = useState(112.634);

  function handlePresetChange(preset: CoveragePreset) {
    setSelectedPreset(preset);
    const selection = COVERAGE_PRESETS.find((item) => item.label === preset);
    if (selection && selection.radius > 0) {
      setRadius(selection.radius);
      setScrollDepth(selection.scrollDepth);
    }
  }

  function handleMapCenterChange(lat: number, lng: number) {
    setLatitude(lat);
    setLongitude(lng);
  }

  function handleMapRadiusChange(newRadius: number) {
    setRadius(newRadius);
    const closest = COVERAGE_PRESETS.reduce((previous, current) =>
      Math.abs(current.radius - newRadius) < Math.abs(previous.radius - newRadius)
        ? current
        : previous,
    );
    if (closest.radius > 0 && Math.abs(closest.radius - newRadius) < 500) {
      setSelectedPreset(closest.label);
      setScrollDepth(closest.scrollDepth);
    } else {
      setSelectedPreset("Custom");
      setScrollDepth(Math.max(5, Math.min(200, Math.round(newRadius / 150))));
    }
  }

  async function createResearch() {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Research at ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
          providerId,
          query: query.trim() || "businesses",
          category: null,
          locationQuery: `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
          latitude,
          longitude,
          radiusMeters: radius,
          maxResults,
          scrollDepth,
        }),
      });
      const body = (await response.json()) as { id?: string; error?: string };
      if (!response.ok || !body.id) {
        throw new Error(body.error ?? "Unable to create research.");
      }
      router.push(`/research/${encodeURIComponent(body.id)}`);
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Unable to create research.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const estimatedTime = Math.ceil(scrollDepth * 3 + 30);
  const selectedProvider =
    supportedProviders.find((provider) => provider.id === providerId)?.name ??
    "OpenStreetMap";

  return (
    <div>
      <div className="flex flex-col gap-7 border-b border-[var(--rule-strong)] pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link className="text-link inline-flex min-h-11 items-center gap-2 text-sm font-bold" href="/">
            <ArrowLeft aria-hidden="true" size={16} />
            Workspace overview
          </Link>
          <p className="eyebrow mt-5">New field study / 01</p>
          <h1 className="type-display mt-3 max-w-4xl text-[clamp(3.2rem,7vw,6.7rem)] leading-[0.88] tracking-[-0.06em] text-[var(--ink)]">
            Draw the market. Define the evidence.
          </h1>
        </div>

        <ol className="grid shrink-0 grid-cols-3 border border-[var(--rule)] bg-white" aria-label="Research workflow">
          {[
            ["01", "Define"],
            ["02", "Collect"],
            ["03", "Analyze"],
          ].map(([number, label], index) => (
            <li
              className={`min-w-24 px-4 py-3 ${index < 2 ? "border-r border-[var(--rule)]" : ""} ${index === 0 ? "bg-[var(--accent-soft)]" : ""}`}
              key={number}
            >
              <span className="block font-mono text-[0.62rem] font-bold tracking-[0.1em] text-[var(--accent)]">{number}</span>
              <span className="mt-1 block text-xs font-bold text-[var(--ink)]">{label}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-7 overflow-hidden rounded-xl border border-[var(--rule-strong)] bg-white shadow-[var(--shadow-soft)]">
        <div className="grid lg:grid-cols-[22rem_minmax(0,1fr)] xl:grid-cols-[24rem_minmax(0,1fr)]">
          <aside className="border-b border-[var(--rule)] p-5 sm:p-7 lg:border-r lg:border-b-0">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="data-label">Study definition</p>
                <h2 className="mt-2 text-lg font-extrabold tracking-[-0.03em] text-[var(--ink)]">Collection controls</h2>
              </div>
              <span className="status-pill status-info">Draft</span>
            </div>

            <div className="mt-7 space-y-5 border-t border-[var(--rule)] pt-6">
              <label className="grid gap-2 text-sm font-bold text-[var(--ink)]">
                What are you researching?
                <input
                  className="ui-input font-normal"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="e.g. coffee shops"
                  value={query}
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-[var(--ink)]">
                Data provider
                <select className="ui-input font-normal" onChange={(event) => setProviderId(event.target.value)} value={providerId}>
                  {supportedProviders.map((provider) => (
                    <option key={provider.id} value={provider.id}>{provider.name}</option>
                  ))}
                </select>
              </label>
            </div>

            <fieldset className="mt-7 border-t border-[var(--rule)] pt-6">
              <legend className="data-label float-left w-full">Coverage preset</legend>
              <p className="clear-both pt-2 text-xs leading-5 text-[var(--ink-faint)]">
                Select a starting scale, then refine it directly on the map.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {COVERAGE_PRESETS.map((preset) => (
                  <button
                    aria-pressed={selectedPreset === preset.label}
                    className={`min-h-16 rounded-md border px-3 py-2.5 text-left transition-[background-color,border-color,box-shadow] ${
                      selectedPreset === preset.label
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] shadow-[inset_3px_0_0_var(--accent)]"
                        : "border-[var(--rule)] bg-white hover:border-[var(--rule-strong)] hover:bg-[var(--paper-muted)]"
                    }`}
                    key={preset.label}
                    onClick={() => handlePresetChange(preset.label)}
                    type="button"
                  >
                    <span className="block text-xs font-bold text-[var(--ink)]">{preset.label}</span>
                    <span className="mt-1 block font-mono text-[0.62rem] text-[var(--ink-faint)]">{preset.description}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-7 rounded-lg bg-[var(--graphite)] p-5 text-white">
              <div className="flex items-center justify-between gap-4">
                <p className="font-mono text-[0.65rem] font-bold tracking-[0.12em] text-[#93a9da] uppercase">Collection plan</p>
                <span className="flex items-center gap-1.5 text-xs text-[#aab7cc]">
                  <Clock3 aria-hidden="true" size={14} />~{estimatedTime}s
                </span>
              </div>
              <dl className="mt-5 grid grid-cols-3 divide-x divide-white/12">
                <div className="pr-3">
                  <dt className="text-[0.65rem] text-[#9fadc4]">Radius</dt>
                  <dd className="mt-1 font-mono text-sm font-bold">{(radius / 1000).toFixed(1)} km</dd>
                </div>
                <div className="px-3">
                  <dt className="text-[0.65rem] text-[#9fadc4]">Records</dt>
                  <dd className="mt-1 flex items-center gap-1 font-mono text-sm font-bold"><InfinityIcon aria-hidden="true" size={15} />All</dd>
                </div>
                <div className="pl-3">
                  <dt className="text-[0.65rem] text-[#9fadc4]">Depth</dt>
                  <dd className="mt-1 font-mono text-sm font-bold">{scrollDepth}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-6 grid gap-3 border-t border-[var(--rule)] pt-5 text-xs text-[var(--ink-soft)]">
              <span className="flex items-center gap-2"><Database aria-hidden="true" className="text-[var(--accent)]" size={15} />{selectedProvider}</span>
              <span className="flex items-center gap-2"><MapPin aria-hidden="true" className="text-[var(--copper)]" size={15} />{latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
            </div>
          </aside>

          <section className="min-w-0 p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="data-label">Geographic boundary</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[var(--ink)]">Position the collection area</h2>
              </div>
              <p className="max-w-sm text-xs leading-5 text-[var(--ink-faint)] sm:text-right">
                Click to relocate. Drag the center to move the area or the edge handle to resize it.
              </p>
            </div>

            <div className="mt-5">
              <MapRadiusPicker
                initialLatitude={latitude}
                initialLongitude={longitude}
                initialRadius={radius}
                onCenterChange={handleMapCenterChange}
                onRadiusChange={handleMapRadiusChange}
              />
            </div>

            <input type="hidden" name="latitude" value={latitude} />
            <input type="hidden" name="longitude" value={longitude} />
            <input type="hidden" name="radiusMeters" value={radius} />
            <input type="hidden" name="maxResults" value={maxResults} />
            <input type="hidden" name="scrollDepth" value={scrollDepth} />

            {error ? (
              <p className="mt-5 rounded-md border border-[#e8b5ae] bg-[#fff1ef] px-4 py-3 text-sm font-semibold text-[var(--danger)]" role="alert">{error}</p>
            ) : null}

            <div className="mt-6 flex flex-col gap-4 border-t border-[var(--rule)] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-lg text-sm leading-6 text-[var(--ink-soft)]">
                Create the study, then start collection from the next screen.
              </p>
              <Button className="shrink-0" disabled={isSaving} onClick={createResearch} size="lg" type="button">
                {isSaving ? (
                  <><LoaderCircle aria-hidden="true" className="animate-spin" size={17} />Creating study</>
                ) : (
                  <><Radar aria-hidden="true" size={17} />Create study<MoveRight aria-hidden="true" size={17} /></>
                )}
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
