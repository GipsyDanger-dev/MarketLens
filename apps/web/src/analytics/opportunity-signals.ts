export interface OpportunitySignal {
  id: "low-density" | "low-competition" | "limited-rating-data";
  severity: "info" | "potential";
  message: string;
}

export function calculateOpportunitySignals(options: {
  totalBusinesses: number;
  densityScore: number | null;
  averageCompetitionScore: number | null;
  ratedBusinesses: number;
}): OpportunitySignal[] {
  const signals: OpportunitySignal[] = [];

  if (options.densityScore !== null && options.densityScore < 5) {
    signals.push({
      id: "low-density",
      severity: "potential",
      message:
        "The search area has low observed business density; validate demand before acting.",
    });
  }
  if (
    options.averageCompetitionScore !== null &&
    options.averageCompetitionScore < 0.4
  ) {
    signals.push({
      id: "low-competition",
      severity: "potential",
      message:
        "Observed competitors have a lower composite score; this is not a guarantee of opportunity.",
    });
  }
  if (
    options.totalBusinesses > 0 &&
    options.ratedBusinesses / options.totalBusinesses < 0.5
  ) {
    signals.push({
      id: "limited-rating-data",
      severity: "info",
      message:
        "Fewer than half of observed businesses include ratings, limiting score confidence.",
    });
  }

  return signals;
}
