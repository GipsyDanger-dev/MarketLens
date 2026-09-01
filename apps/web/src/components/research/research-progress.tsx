"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

interface ResearchProgressPayload {
  projectId: string;
  projectStatus: string;
  jobId: string | null;
  jobStatus: string | null;
  totalDiscovered: number;
  totalProcessed: number;
  totalFailed: number;
  progress: number;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
}

const activeStatuses = new Set([
  "QUEUED",
  "COLLECTING",
  "NORMALIZING",
  "ANALYZING",
]);

export function ResearchProgress({ researchId }: { researchId: string }) {
  const [progress, setProgress] = useState<ResearchProgressPayload | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const loadProgress = useCallback(async () => {
    const response = await fetch(
      `/api/research/${encodeURIComponent(researchId)}/progress`,
      { cache: "no-store" },
    );
    const body = (await response.json()) as ResearchProgressPayload & {
      error?: string;
    };

    if (!response.ok) {
      throw new Error(body.error ?? "Unable to load research progress.");
    }

    setProgress(body);
    setError(null);
  }, [researchId]);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      try {
        await loadProgress();
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load research progress.",
          );
        }
      }
    };

    void refresh();
    const interval = window.setInterval(() => {
      if (isRunning || activeStatuses.has(progress?.projectStatus ?? "DRAFT")) {
        void refresh();
      }
    }, 2_500);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [isRunning, loadProgress, progress?.projectStatus]);

  const runCollection = async () => {
    setIsRunning(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/research/${encodeURIComponent(researchId)}/run`,
        { method: "POST" },
      );
      const body = (await response.json()) as ResearchProgressPayload & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(body.error ?? "Unable to start research collection.");
      }

      setProgress(body);
    } catch (runError) {
      setError(
        runError instanceof Error
          ? runError.message
          : "Unable to start research collection.",
      );
    } finally {
      setIsRunning(false);
    }
  };

  const isRetry = progress?.projectStatus === "FAILED";
  const isActive =
    progress !== null && activeStatuses.has(progress.projectStatus);

  return (
    <section className="paper-panel w-full p-5 sm:p-7">
      <div className="grid gap-4 border-b border-[var(--rule)] pb-5 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="eyebrow">Collection control</p>
          <h1 className="type-display mt-3 text-3xl leading-none tracking-[-0.04em] sm:text-4xl">
            Field collection
          </h1>
        </div>
        <p className="max-w-55 break-all font-mono text-[0.65rem] leading-5 text-[var(--ink-faint)]">
          ID / {researchId}
        </p>
      </div>

      {error ? (
        <div
          className="mt-6 border border-[color:var(--danger)] bg-[#f7e6e2] p-4 text-sm text-[var(--danger)]"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {!progress ? (
        <p
          className="mt-6 bg-[var(--paper-muted)] p-4 text-sm text-[var(--ink-soft)]"
          aria-live="polite"
        >
          Loading persisted research progress…
        </p>
      ) : (
        <div className="mt-6 space-y-6" aria-live="polite">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="text-lg font-semibold text-[var(--ink)]">
              {progress.projectStatus.replaceAll("_", " ")}
            </p>
            <p className="font-mono text-sm tabular-nums text-[var(--accent)]">
              {progress.progress}%
            </p>
          </div>

          <div
            aria-label={`${progress.progress}% complete`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={progress.progress}
            className="h-2 overflow-hidden bg-[var(--paper-muted)]"
            role="progressbar"
          >
            <div
              className="h-full bg-[var(--accent)] transition-[width] duration-500"
              style={{ width: `${progress.progress}%` }}
            />
          </div>

          <dl className="grid divide-y divide-[var(--rule)] border-y border-[var(--rule)] text-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <ProgressMetric
              label="Discovered"
              value={progress.totalDiscovered}
            />
            <ProgressMetric label="Processed" value={progress.totalProcessed} />
            <ProgressMetric label="Failed" value={progress.totalFailed} />
          </dl>

          {progress.error ? (
            <p className="border border-[#c9954f] bg-[#f4ead8] p-4 text-sm text-[#7b4d18]">
              {progress.error}
            </p>
          ) : null}

          {!progress.jobId ? (
            <p className="text-sm text-[var(--ink-soft)]">
              No collection job has been recorded for this research yet.
            </p>
          ) : null}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 border-t border-[var(--rule)] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--ink-soft)]">
          Collection normalizes and deduplicates source records before analysis.
        </p>
        <Button disabled={isRunning || isActive} onClick={runCollection}>
          {isRunning
            ? "Running collection…"
            : isRetry
              ? "Retry collection"
              : progress?.jobId
                ? "Run collection again"
                : "Run collection"}
        </Button>
      </div>
    </section>
  );
}

function ProgressMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4">
      <dt className="data-label">{label}</dt>
      <dd className="type-display mt-2 text-3xl leading-none tabular-nums text-[var(--ink)]">
        {value}
      </dd>
    </div>
  );
}
