"use client";

import {
  BrainCircuit,
  Clock3,
  Database,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
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
        if (!response.ok) throw new Error(body.error ?? "Unable to load AI insight.");
        if (!cancelled) setSnapshot(body.insight);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load AI insight.");
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
      if (!response.ok) throw new Error(body.error ?? "Unable to generate AI insight.");
      if (body.status === "disabled") {
        setError(body.reason ?? "AI insights are disabled for this deployment.");
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
    <section className="overflow-hidden rounded-xl border border-[var(--rule-strong)] bg-white shadow-[var(--shadow-soft)]">
      <div className="grid lg:grid-cols-[minmax(20rem,0.62fr)_minmax(0,1.38fr)]">
        <header className="dark-grid flex flex-col justify-between bg-[var(--graphite)] p-6 text-white sm:p-8">
          <div>
            <span className="grid size-12 place-items-center rounded-md border border-[#586b91] bg-[#111d32] text-[#8fa8ff]">
              <BrainCircuit aria-hidden="true" size={23} strokeWidth={1.7} />
            </span>
            <p className="mt-8 font-mono text-[0.65rem] font-bold tracking-[0.13em] text-[#93a9da] uppercase">Optional interpretation</p>
            <h2 className="type-display mt-4 text-[clamp(3rem,6vw,5rem)] leading-[0.9] tracking-[-0.055em] text-white">Evidence, interpreted with boundaries.</h2>
            <p className="mt-5 max-w-lg text-sm leading-6 text-[#b5c1d4]">
              AI receives this research dataset and its computed metrics—not an open-ended prompt. Every output remains an interpretation to validate.
            </p>
          </div>

          <div className="mt-10 border-t border-white/14 pt-5">
            <div className="flex items-start gap-3">
              <ShieldCheck aria-hidden="true" className="mt-0.5 shrink-0 text-[#d58850]" size={18} />
              <p className="text-xs leading-5 text-[#9fadc4]">Facts, interpretation, and limitations are kept visibly separate in the generated memo.</p>
            </div>
          </div>
        </header>

        <div className="p-5 sm:p-8">
          <div className="flex flex-col gap-5 border-b border-[var(--rule)] pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="eyebrow">Interpretation memo</p>
              <h3 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[var(--ink)]">
                {snapshot ? "Saved research insight" : "No insight generated yet"}
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--ink-soft)]">
                Core maps, metrics, rankings, and exports remain available whether AI is enabled or not.
              </p>
            </div>
            <Button disabled={isGenerating} onClick={generate} variant={snapshot ? "outline" : "default"}>
              {isGenerating ? (
                <><LoaderCircle aria-hidden="true" className="animate-spin" size={16} />Generating memo</>
              ) : snapshot ? (
                <><RefreshCw aria-hidden="true" size={16} />Regenerate</>
              ) : (
                <><Sparkles aria-hidden="true" size={16} />Generate insight</>
              )}
            </Button>
          </div>

          {error ? (
            <p className="mt-5 rounded-md border border-[#dfc39d] bg-[#fff8ec] px-4 py-3 text-sm font-semibold text-[#78471e]" role="status">{error}</p>
          ) : null}

          {snapshot ? (
            <>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-b border-[var(--rule)] pb-5 font-mono text-[0.62rem] text-[var(--ink-faint)]">
                <span className="flex items-center gap-1.5"><Database aria-hidden="true" size={13} />{snapshot.provider} / {snapshot.model}</span>
                <span className="flex items-center gap-1.5"><Clock3 aria-hidden="true" size={13} />{formatDate(snapshot.generatedAt)}</span>
                <span>{snapshot.promptVersion}</span>
              </div>
              <InsightContent insight={snapshot.insightJson} />
            </>
          ) : (
            <div className="grid min-h-72 place-items-center py-10 text-center">
              <div className="max-w-sm">
                <span className="mx-auto grid size-11 place-items-center rounded-full border border-[var(--rule)] text-[var(--ink-faint)]"><Sparkles aria-hidden="true" size={18} /></span>
                <p className="mt-4 text-sm font-bold text-[var(--ink)]">The evidence remains primary.</p>
                <p className="mt-2 text-xs leading-5 text-[var(--ink-faint)]">Generate a memo only when an AI provider has been configured for this installation.</p>
              </div>
            </div>
          )}
        </div>
      </div>
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
    <div className="divide-y divide-[var(--rule)]">
      {sections.map(([title, items], index) => (
        <section className="grid gap-3 py-5 sm:grid-cols-[2rem_10rem_minmax(0,1fr)]" key={title}>
          <span className="font-mono text-[0.62rem] font-bold text-[var(--accent)]">{String(index + 1).padStart(2, "0")}</span>
          <h4 className="text-sm font-extrabold text-[var(--ink)]">{title}</h4>
          {items.length ? (
            <ul className="space-y-2 text-sm leading-6 text-[var(--ink-soft)]">
              {items.map((item) => <li className="border-l-2 border-[var(--accent-line)] pl-3" key={item}>{item}</li>)}
            </ul>
          ) : (
            <p className="text-sm text-[var(--ink-faint)]">No signal in this dataset.</p>
          )}
        </section>
      ))}
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
