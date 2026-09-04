"use client";

import { Eye, EyeOff, KeyRound, LoaderCircle, MoveRight } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function AccessTokenForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

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
    <form className="w-full" onSubmit={submit}>
      <div className="grid size-11 place-items-center rounded-md border border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent)]">
        <KeyRound aria-hidden="true" size={21} strokeWidth={1.9} />
      </div>
      <p className="eyebrow mt-7">Installation access</p>
      <h2 className="type-display mt-3 text-[clamp(2.5rem,5vw,4rem)] leading-[0.95] tracking-[-0.05em] text-[var(--ink)]">
        Open the workspace.
      </h2>
      <p className="mt-4 max-w-md text-sm leading-6 text-[var(--ink-soft)]">
        Enter the access token supplied by the administrator of this private
        MarketLens installation.
      </p>

      <label className="mt-8 block text-sm font-bold text-[var(--ink)]">
        Access token
        <span className="relative mt-2 block">
          <input
            aria-describedby={error ? "access-error" : "access-help"}
            autoComplete="current-password"
            className="ui-input w-full pr-13 font-mono tracking-[0.08em]"
            onChange={(event) => setToken(event.target.value)}
            required
            type={isVisible ? "text" : "password"}
            value={token}
          />
          <button
            aria-label={isVisible ? "Hide access token" : "Show access token"}
            className="absolute top-1/2 right-1 grid size-10 -translate-y-1/2 place-items-center rounded-md text-[var(--ink-faint)] transition-colors hover:bg-[var(--paper-muted)] hover:text-[var(--ink)]"
            onClick={() => setIsVisible((visible) => !visible)}
            type="button"
          >
            {isVisible ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
          </button>
        </span>
      </label>
      <p className="mt-2 text-xs leading-5 text-[var(--ink-faint)]" id="access-help">
        Token comparison happens on the server over the current connection.
      </p>

      {error ? (
        <p className="mt-4 rounded-md border border-[#e8b5ae] bg-[#fff1ef] px-4 py-3 text-sm font-semibold text-[var(--danger)]" id="access-error" role="alert">
          {error}
        </p>
      ) : null}

      <Button className="mt-6 w-full" disabled={isSubmitting} size="lg" type="submit">
        {isSubmitting ? (
          <>
            <LoaderCircle aria-hidden="true" className="animate-spin" size={17} />
            Verifying access
          </>
        ) : (
          <>
            Continue to workspace
            <MoveRight aria-hidden="true" size={17} />
          </>
        )}
      </Button>

      <div className="mt-7 border-t border-[var(--rule)] pt-5">
        <p className="font-mono text-[0.66rem] leading-5 tracking-[0.06em] text-[var(--ink-faint)] uppercase">
          Destination / {nextPath}
        </p>
      </div>
    </form>
  );
}
