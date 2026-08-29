"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function ResearchCreationForm({
  providers,
}: {
  providers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function createResearch(formData: FormData) {
    setIsSaving(true);
    setError(null);
    const number = (name: string) => Number(formData.get(name));
    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          providerId: formData.get("providerId"),
          query: formData.get("query"),
          category: formData.get("category") || null,
          locationQuery: formData.get("locationQuery"),
          latitude: number("latitude"),
          longitude: number("longitude"),
          radiusMeters: number("radiusMeters"),
          maxResults: number("maxResults"),
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

  return (
    <form
      action={createResearch}
      className="mx-auto max-w-5xl"
    >
      <Link className="text-sm font-medium text-[var(--accent)] underline underline-offset-4" href="/">
        ← Back to overview
      </Link>
      <div className="mt-8 grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="lg:pr-8">
          <p className="eyebrow">New field study / 01</p>
          <h1 className="type-display mt-4 text-5xl leading-[0.96] tracking-[-0.05em] text-balance">
            Define the market you want to inspect.
          </h1>
          <p className="mt-5 max-w-sm leading-7 text-[var(--ink-soft)]">
            Start with a clear place, category, and radius. MarketLens keeps the collection method visible so the result remains traceable.
          </p>
          <dl className="mt-9 space-y-4 border-t border-[var(--rule-strong)] pt-5 text-sm">
            <div>
              <dt className="data-label">Default source</dt>
              <dd className="mt-1 font-medium">OpenStreetMap</dd>
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
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">Fields marked required determine the collection boundary.</p>
          </div>
          <div className="mt-6 grid gap-5">
            <Field label="Research name" name="name" defaultValue="Coffee shops in Malang" />
            <label className="block">
              <span className="data-label">Provider</span>
              <select className="ui-input mt-2" defaultValue={providers[0]?.id} name="providerId">
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>{provider.name}</option>
                ))}
              </select>
              <span className="mt-2 block text-xs leading-5 text-[var(--ink-faint)]">Google Places appears only when its server-side API key is configured.</span>
            </label>
            <div className="grid gap-5 sm:grid-cols-[1.35fr_0.65fr]">
              <Field label="Search query" name="query" defaultValue="coffee shop" />
              <Field label="Category (optional)" name="category" defaultValue="cafe" />
            </div>
            <Field label="Location label" name="locationQuery" defaultValue="Malang, Indonesia" />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Latitude" name="latitude" type="number" defaultValue="-7.977" step="any" />
              <Field label="Longitude" name="longitude" type="number" defaultValue="112.634" step="any" />
            </div>
            <div className="grid gap-5 border-t border-[var(--rule)] pt-6 sm:grid-cols-2">
              <Field label="Radius (metres)" name="radiusMeters" type="number" defaultValue="5000" min="1" />
              <Field label="Maximum results" name="maxResults" type="number" defaultValue="60" min="1" max="1000" />
            </div>
          </div>
          {error ? (
            <p className="mt-6 border border-[color:var(--danger)] bg-[#f7e6e2] p-3 text-sm text-[var(--danger)]" role="alert">{error}</p>
          ) : null}
          <div className="mt-7 flex flex-col gap-3 border-t border-[var(--rule)] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--ink-soft)]">You can review and run collection on the next screen.</p>
            <Button disabled={isSaving || providers.length === 0} type="submit">
              {isSaving ? "Creating study…" : "Create study"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  ...props
}: {
  label: string;
  name: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="data-label">{label}</span>
      <input
        className="ui-input mt-2"
        name={name}
        required={name !== "category"}
        {...props}
      />
    </label>
  );
}
