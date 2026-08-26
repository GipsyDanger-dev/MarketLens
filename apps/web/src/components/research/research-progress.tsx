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
    <section className="mx-auto w-full max-w-2xl space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30 sm:p-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold tracking-[0.2em] text-cyan-300 uppercase">
          Research collection
        </p>
        <h1 className="text-2xl font-semibold text-slate-50 sm:text-3xl">
          Collection progress
        </h1>
        <p className="break-all text-sm text-slate-400">{researchId}</p>
      </div>

      {error ? (
        <div
          className="rounded-lg border border-rose-400/40 bg-rose-400/10 p-4 text-sm text-rose-100"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {!progress ? (
        <p
          className="rounded-lg bg-slate-800/70 p-4 text-sm text-slate-300"
          aria-live="polite"
        >
          Loading persisted research progress…
        </p>
      ) : (
        <div className="space-y-5" aria-live="polite">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="text-lg font-medium text-slate-100">
              {progress.projectStatus.replaceAll("_", " ")}
            </p>
            <p className="text-sm tabular-nums text-cyan-200">
              {progress.progress}%
            </p>
          </div>

          <div
            aria-label={`${progress.progress}% complete`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={progress.progress}
            className="h-3 overflow-hidden rounded-full bg-slate-800"
            role="progressbar"
          >
            <div
              className="h-full rounded-full bg-cyan-300 transition-[width] duration-500"
              style={{ width: `${progress.progress}%` }}
            />
          </div>

          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <ProgressMetric
              label="Discovered"
              value={progress.totalDiscovered}
            />
            <ProgressMetric label="Processed" value={progress.totalProcessed} />
            <ProgressMetric label="Failed" value={progress.totalFailed} />
          </dl>

          {progress.error ? (
            <p className="rounded-lg border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">
              {progress.error}
            </p>
          ) : null}

          {!progress.jobId ? (
            <p className="text-sm text-slate-400">
              No collection job has been recorded for this research yet.
            </p>
          ) : null}
        </div>
      )}

      <Button disabled={isRunning || isActive} onClick={runCollection}>
        {isRunning
          ? "Running collection…"
          : isRetry
            ? "Retry collection"
            : progress?.jobId
              ? "Run collection again"
              : "Run collection"}
      </Button>
    </section>
  );
}

function ProgressMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-slate-800/70 p-4">
      <dt className="text-slate-400">{label}</dt>
      <dd className="mt-1 text-xl font-semibold tabular-nums text-slate-100">
        {value}
      </dd>
    </div>
  );
}
