"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

interface MarketInsight {
  marketSummary: string[];
  competitionInsights: string[];
  opportunitySignals: string[];
  risks: string[];
  recommendations: string[];
  limitations: string[];
}

interface InsightSnapshot {
  id: string;
  provider: string;
  model: string;
  promptVersion: string;
  generatedAt: string;
  insightJson: MarketInsight;
}

export function ResearchAiInsights({ researchId }: { researchId: string }) {
  const [snapshot, setSnapshot] = useState<InsightSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/research/${encodeURIComponent(researchId)}/insights`, {
      cache: "no-store",
    })
      .then(async (response) => {
        const body = (await response.json()) as {
          insight: InsightSnapshot | null;
          error?: string;
        };
        if (!response.ok) {
          throw new Error(body.error ?? "Unable to load AI insight.");
        }
        if (!cancelled) setSnapshot(body.insight);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load AI insight.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [researchId]);

  const generate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/research/${encodeURIComponent(researchId)}/insights`,
        { method: "POST" },
      );
      const body = (await response.json()) as {
        status: "disabled" | "generated";
        reason?: string;
        id?: string;
        generatedAt?: string;
        insight?: MarketInsight;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(body.error ?? "Unable to generate AI insight.");
      }
      if (body.status === "disabled") {
        setError(
          body.reason ?? "AI insights are disabled for this deployment.",
        );
        return;
      }
      if (!body.id || !body.generatedAt || !body.insight) {
        throw new Error("The AI insight response was incomplete.");
      }
      setSnapshot({
        id: body.id,
        provider: "gemini",
        model: "configured model",
        promptVersion: "marketlens-insight-v1",
        generatedAt: body.generatedAt,
        insightJson: body.insight,
      });
    } catch (generateError) {
      setError(
        generateError instanceof Error
          ? generateError.message
          : "Unable to generate AI insight.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="space-y-4 rounded-2xl border border-violet-400/20 bg-violet-400/5 p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-violet-200 uppercase">
            Optional AI insight
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-50">
            Evidence-bound market interpretation
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Uses only this research dataset. Validate all market signals before
            acting.
          </p>
        </div>
        <Button disabled={isGenerating} onClick={generate}>
          {isGenerating ? "Generating insight…" : "Generate AI insight"}
        </Button>
      </div>
      {error ? (
        <p
          className="rounded-lg border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100"
          role="status"
        >
          {error}
        </p>
      ) : null}
      {snapshot ? <InsightContent insight={snapshot.insightJson} /> : null}
    </section>
  );
}

function InsightContent({ insight }: { insight: MarketInsight }) {
  const sections = [
    ["Market summary", insight.marketSummary],
    ["Competition", insight.competitionInsights],
    ["Opportunity signals", insight.opportunitySignals],
    ["Risks", insight.risks],
    ["Recommendations", insight.recommendations],
    ["Limitations", insight.limitations],
  ] as const;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sections.map(([title, items]) => (
        <div className="rounded-xl bg-slate-950/50 p-4" key={title}>
          <h3 className="font-medium text-slate-100">{title}</h3>
          {items.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-400">
              No signal in this dataset.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
