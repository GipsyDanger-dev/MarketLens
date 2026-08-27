"use client";

import { useState } from "react";
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
      className="mx-auto max-w-2xl space-y-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-6"
    >
      <div>
        <p className="text-sm font-semibold tracking-[0.2em] text-cyan-300 uppercase">
          New research
        </p>
        <h1 className="mt-1 text-3xl font-semibold">
          Collect local market evidence
        </h1>
      </div>
      <Field
        label="Research name"
        name="name"
        defaultValue="Coffee shops in Malang"
      />
      <label className="block text-sm text-slate-300">
        Provider
        <select
          className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-950 p-2"
          defaultValue={providers[0]?.id}
          name="providerId"
        >
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
      </label>
      <p className="text-xs text-slate-400">
        Google Places appears only when its server-side API key is configured.
      </p>
      <Field label="Search query" name="query" defaultValue="coffee shop" />
      <Field label="Category (optional)" name="category" defaultValue="cafe" />
      <Field
        label="Location label"
        name="locationQuery"
        defaultValue="Malang, Indonesia"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Latitude"
          name="latitude"
          type="number"
          defaultValue="-7.977"
          step="any"
        />
        <Field
          label="Longitude"
          name="longitude"
          type="number"
          defaultValue="112.634"
          step="any"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Radius (metres)"
          name="radiusMeters"
          type="number"
          defaultValue="5000"
          min="1"
        />
        <Field
          label="Maximum results"
          name="maxResults"
          type="number"
          defaultValue="60"
          min="1"
          max="1000"
        />
      </div>
      {error ? (
        <p
          className="rounded-lg bg-rose-400/10 p-3 text-sm text-rose-100"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <Button disabled={isSaving || providers.length === 0} type="submit">
        {isSaving ? "Creating…" : "Create research"}
      </Button>
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
    <label className="block text-sm text-slate-300">
      {label}
      <input
        className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-950 p-2"
        name={name}
        required={name !== "category"}
        {...props}
      />
    </label>
  );
}
