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
    <section className="border-y border-[var(--rule-strong)] bg-[var(--accent-wash)] px-5 py-6 sm:px-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="eyebrow">Optional interpretation</p>
          <h2 className="type-display mt-3 text-3xl leading-none tracking-[-0.035em] text-[var(--ink)]">Evidence-bound interpretation</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
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
          className="border border-[#c9954f] bg-[#f4ead8] p-3 text-sm text-[#7b4d18]"
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
    <div className="mt-6 grid gap-x-8 gap-y-0 border-t border-[var(--rule-strong)] md:grid-cols-2">
      {sections.map(([title, items]) => (
        <div className="border-b border-[var(--rule)] py-5" key={title}>
          <h3 className="font-semibold text-[var(--ink)]">{title}</h3>
          {items.length ? (
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-[var(--ink-soft)]">
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-[var(--ink-faint)]">
              No signal in this dataset.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
