"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { MapRadiusPicker } from "./map-radius-picker";

const COVERAGE_PRESETS = [
  {
    label: "Nearby",
    description: "1 km • ~20 places",
    radius: 1000,
    maxResults: 20,
    scrollDepth: 3,
  },
  {
    label: "Neighborhood",
    description: "3 km • ~50 places",
    radius: 3000,
    maxResults: 50,
    scrollDepth: 5,
  },
  {
    label: "City Center",
    description: "5 km • ~100 places",
    radius: 5000,
    maxResults: 100,
    scrollDepth: 8,
  },
  {
    label: "Metro Area",
    description: "15 km • ~250 places",
    radius: 15000,
    maxResults: 250,
    scrollDepth: 15,
  },
  {
    label: "Regional",
    description: "30 km • ~500 places",
    radius: 30000,
    maxResults: 500,
    scrollDepth: 25,
  },
  {
    label: "Custom",
    description: "Drag circle on map",
    radius: 0,
    maxResults: 0,
    scrollDepth: 0,
  },
] as const;

type CoveragePreset = (typeof COVERAGE_PRESETS)[number]["label"];

type ResearchProvider = { id: string; name: string };

export function ResearchCreationForm({
  providers,
}: {
  providers: ResearchProvider[];
}) {
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
  const [selectedPreset, setSelectedPreset] =
    useState<CoveragePreset>("City Center");
  const [radius, setRadius] = useState(5000);
  const [maxResults, setMaxResults] = useState(100);
  const [scrollDepth, setScrollDepth] = useState(8);
  const [latitude, setLatitude] = useState(-7.977);
  const [longitude, setLongitude] = useState(112.634);

  function handlePresetChange(preset: CoveragePreset) {
    setSelectedPreset(preset);
    const p = COVERAGE_PRESETS.find((cp) => cp.label === preset);
    if (p && p.radius > 0) {
      setRadius(p.radius);
      setMaxResults(p.maxResults);
      setScrollDepth(p.scrollDepth);
    }
  }

  function handleMapCenterChange(lat: number, lng: number) {
    setLatitude(lat);
    setLongitude(lng);
  }

  function handleMapRadiusChange(newRadius: number) {
    setRadius(newRadius);
    // Auto-select preset based on radius
    const closest = COVERAGE_PRESETS.reduce((prev, curr) =>
      Math.abs(curr.radius - newRadius) < Math.abs(prev.radius - newRadius)
        ? curr
        : prev,
    );
    if (closest.radius > 0 && Math.abs(closest.radius - newRadius) < 500) {
      setSelectedPreset(closest.label);
      setMaxResults(closest.maxResults);
      setScrollDepth(closest.scrollDepth);
    } else {
      setSelectedPreset("Custom");
      // Estimate max results based on radius (rough: ~10 places per km²)
      const km2 = Math.PI * (newRadius / 1000) ** 2;
      setMaxResults(Math.min(1000, Math.max(10, Math.round(km2 * 10))));
      setScrollDepth(Math.max(3, Math.min(50, Math.round(newRadius / 2000))));
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
      if (!response.ok || !body.id)
        throw new Error(body.error ?? "Unable to create research.");
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

  const estimatedTime = Math.ceil((maxResults * 1.5) / scrollDepth);

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        className="text-sm font-medium text-[var(--accent)] underline underline-offset-4"
        href="/"
      >
        ← Back to overview
      </Link>
      <div className="mt-8 grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="lg:pr-8">
          <p className="eyebrow">New field study / 01</p>
          <h1 className="type-display mt-4 text-5xl leading-[0.96] tracking-[-0.05em] text-balance">
            Define the market you want to inspect.
          </h1>
          <p className="mt-5 max-w-sm leading-7 text-[var(--ink-soft)]">
            Drag the circle on the map to set your search area. Resize by
            dragging the white handle on the edge.
          </p>
          <dl className="mt-9 space-y-4 border-t border-[var(--rule-strong)] pt-5 text-sm">
            <div>
              <dt className="data-label">Data source</dt>
              <dd className="mt-1 font-medium">
                {supportedProviders.find(
                  (provider) => provider.id === providerId,
                )?.name ?? "OpenStreetMap"}
              </dd>
            </div>
            <div>
              <dt className="data-label">Storage</dt>
              <dd className="mt-1 font-medium">Local and embedded</dd>
            </div>
          </dl>
        </aside>
        <div className="paper-panel p-5 sm:p-8">
          <div className="border-b border-[var(--rule)] pb-5">
            <p className="data-label">Study definition</p>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
              Drag the green circle to move, drag the white handle to resize.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
              What are you researching?
              <input
                className="h-10 rounded-md border border-[var(--rule)] bg-white px-3 text-sm font-normal outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="e.g. coffee shops"
                value={query}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
              Data provider
              <select
                className="h-10 rounded-md border border-[var(--rule)] bg-white px-3 text-sm font-normal outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
                onChange={(event) => setProviderId(event.target.value)}
                value={providerId}
              >
                {supportedProviders.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Interactive Map Picker */}
          <div className="mt-6">
            <MapRadiusPicker
              initialLatitude={latitude}
              initialLongitude={longitude}
              initialRadius={radius}
              onCenterChange={handleMapCenterChange}
              onRadiusChange={handleMapRadiusChange}
            />
          </div>

          {/* Coverage Presets */}
          <div className="mt-6 border-t border-[var(--rule)] pt-6">
            <span className="data-label">Quick presets</span>
            <p className="mt-1 mb-3 text-xs leading-5 text-[var(--ink-faint)]">
              Or choose a preset to set radius automatically.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {COVERAGE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handlePresetChange(preset.label)}
                  className={`rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                    selectedPreset === preset.label
                      ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "border-[var(--rule)] hover:border-[var(--ink-soft)]"
                  }`}
                >
                  <span className="block font-medium">{preset.label}</span>
                  <span className="mt-0.5 block text-[10px] leading-4 text-[var(--ink-faint)]">
                    {preset.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 border-t border-[var(--rule)] pt-6">
            <div className="flex items-center justify-between">
              <span className="data-label">Collection plan</span>
              <span className="text-xs text-[var(--ink-faint)]">
                ⏱ Est. ~{estimatedTime}s
              </span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-4 text-center">
              <div className="rounded-md bg-[var(--paper-subtle)] p-3">
                <p className="text-2xl font-bold text-[var(--accent)]">
                  {(radius / 1000).toFixed(1)}
                </p>
                <p className="text-xs text-[var(--ink-faint)]">km radius</p>
              </div>
              <div className="rounded-md bg-[var(--paper-subtle)] p-3">
                <p className="text-2xl font-bold text-[var(--accent)]">
                  {maxResults}
                </p>
                <p className="text-xs text-[var(--ink-faint)]">max places</p>
              </div>
              <div className="rounded-md bg-[var(--paper-subtle)] p-3">
                <p className="text-2xl font-bold text-[var(--accent)]">
                  {scrollDepth}
                </p>
                <p className="text-xs text-[var(--ink-faint)]">scroll depth</p>
              </div>
            </div>
          </div>

          {/* Hidden inputs for form submission */}
          <input type="hidden" name="latitude" value={latitude} />
          <input type="hidden" name="longitude" value={longitude} />
          <input type="hidden" name="radiusMeters" value={radius} />
          <input type="hidden" name="maxResults" value={maxResults} />
          <input type="hidden" name="scrollDepth" value={scrollDepth} />

          {error ? (
            <p
              className="mt-6 border border-[color:var(--danger)] bg-[#f7e6e2] p-3 text-sm text-[var(--danger)]"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <div className="mt-7 flex flex-col gap-3 border-t border-[var(--rule)] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--ink-soft)]">
              Collection starts immediately after creation.
            </p>
            <Button disabled={isSaving} type="button" onClick={createResearch}>
              {isSaving ? "Creating study…" : "Create & Run"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
