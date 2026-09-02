"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AccessTokenForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/access", {
        body: JSON.stringify({ token }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Unable to verify access.");
      router.replace(nextPath);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to verify access.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="paper-panel space-y-5 p-6 sm:p-8" onSubmit={submit}>
      <div>
        <p className="eyebrow">Private installation</p>
        <h1 className="type-display mt-3 text-4xl tracking-[-0.045em] text-[var(--ink)]">
          Enter access token
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
          This MarketLens deployment is private. Ask its administrator for the
          access token configured on the server.
        </p>
      </div>
      <label className="block text-sm font-semibold text-[var(--ink)]">
        Access token
        <input
          autoComplete="current-password"
          className="ui-input mt-2 w-full"
          onChange={(event) => setToken(event.target.value)}
          required
          type="password"
          value={token}
        />
      </label>
      {error ? (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}
      <button className="ui-button" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Verifying…" : "Continue"}
      </button>
    </form>
  );
}
