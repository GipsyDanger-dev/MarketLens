"use client";

import {
  AlertTriangle,
  Check,
  DatabaseZap,
  LoaderCircle,
  Play,
  RefreshCw,
} from "lucide-react";
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

const activeStatuses = new Set(["QUEUED", "COLLECTING", "NORMALIZING", "ANALYZING"]);

export function ResearchProgress({ researchId }: { researchId: string }) {
  const [progress, setProgress] = useState<ResearchProgressPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const loadProgress = useCallback(async () => {
    const response = await fetch(
      `/api/research/${encodeURIComponent(researchId)}/progress`,
      { cache: "no-store" },
    );
    const body = (await response.json()) as ResearchProgressPayload & { error?: string };
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
      const body = (await response.json()) as ResearchProgressPayload & { error?: string };
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

  const status = progress?.projectStatus ?? "LOADING";
  const isRetry = status === "FAILED";
  const isReady = status === "READY";
  const isActive = progress !== null && activeStatuses.has(status);

  return (
    <section className="overflow-hidden rounded-xl border border-[var(--rule-strong)] bg-white shadow-[var(--shadow-soft)]">
      <div className="h-1 bg-[var(--paper-muted)]">
        <div
          className={`h-full transition-[width,background-color] duration-500 ${isRetry ? "bg-[var(--danger)]" : isReady ? "bg-[var(--success)]" : "bg-[var(--accent)]"}`}
          style={{ width: `${progress?.progress ?? 4}%` }}
        />
      </div>
      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(15rem,0.8fr)_minmax(28rem,1.5fr)_auto] lg:items-center">
        <div className="flex items-center gap-4">
          <span className={`grid size-11 shrink-0 place-items-center rounded-md border ${isRetry ? "border-[#e8b5ae] bg-[#fff1ef] text-[var(--danger)]" : isReady ? "border-[#acd4bd] bg-[#edf8f1] text-[var(--success)]" : "border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent)]"}`}>
            {isRetry ? (
              <AlertTriangle aria-hidden="true" size={20} />
            ) : isReady ? (
              <Check aria-hidden="true" size={20} strokeWidth={2.4} />
            ) : isActive || isRunning ? (
              <LoaderCircle aria-hidden="true" className="animate-spin" size={20} />
            ) : (
              <DatabaseZap aria-hidden="true" size={20} />
            )}
          </span>
          <div className="min-w-0">
            <p className="data-label">Collection control</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-extrabold tracking-[-0.03em] text-[var(--ink)]">Field collection</h2>
              <span className={`status-pill ${isRetry ? "bg-[#fff1ef] text-[var(--danger)]" : isReady ? "bg-[#edf8f1] text-[var(--success)]" : "bg-[var(--accent-soft)] text-[var(--accent)]"}`}>
                {status.replaceAll("_", " ")}
              </span>
            </div>
          </div>
        </div>

        <div>
          {!progress ? (
            <p className="text-sm text-[var(--ink-soft)]" aria-live="polite">Loading persisted research progress…</p>
          ) : (
            <div className="grid grid-cols-3 divide-x divide-[var(--rule)]" aria-live="polite">
              <ProgressMetric label="Discovered" value={progress.totalDiscovered} />
              <ProgressMetric label="Processed" value={progress.totalProcessed} />
              <ProgressMetric label="Failed" value={progress.totalFailed} danger={progress.totalFailed > 0} />
            </div>
          )}
        </div>

        <Button disabled={isRunning || isActive} onClick={runCollection} variant={isReady ? "outline" : "default"}>
          {isRunning || isActive ? (
            <><LoaderCircle aria-hidden="true" className="animate-spin" size={16} />Collecting {progress?.progress ?? 0}%</>
          ) : isRetry ? (
            <><RefreshCw aria-hidden="true" size={16} />Retry collection</>
          ) : progress?.jobId ? (
            <><RefreshCw aria-hidden="true" size={16} />Run again</>
          ) : (
            <><Play aria-hidden="true" size={16} />Run collection</>
          )}
        </Button>
      </div>

      {(error || progress?.error) ? (
        <div className="border-t border-[#e8b5ae] bg-[#fff1ef] px-5 py-3 text-sm font-semibold text-[var(--danger)]" role="alert">
          {error ?? progress?.error}
        </div>
      ) : (
        <div className="flex flex-col gap-1 border-t border-[var(--rule)] bg-[var(--paper-subtle)] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--ink-faint)]">Records are normalized and deduplicated before analysis.</p>
          <p className="max-w-xs truncate font-mono text-[0.62rem] text-[var(--ink-faint)]" title={researchId}>ID / {researchId}</p>
        </div>
      )}
    </section>
  );
}

function ProgressMetric({ label, value, danger = false }: { label: string; value: number; danger?: boolean }) {
  return (
    <div className="px-4 first:pl-0 last:pr-0">
      <dt className="font-mono text-[0.62rem] font-semibold tracking-[0.08em] text-[var(--ink-faint)] uppercase">{label}</dt>
      <dd className={`mt-1 text-xl font-extrabold tabular-nums ${danger ? "text-[var(--danger)]" : "text-[var(--ink)]"}`}>{value}</dd>
    </div>
  );
}
