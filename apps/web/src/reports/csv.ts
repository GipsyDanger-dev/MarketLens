import type { ResearchReport } from "./types";

export function researchReportToCsv(report: ResearchReport): string {
  const header = [
    "name",
    "category",
    "address",
    "rating",
    "review_count",
    "phone",
    "website",
    "social_links",
    "source_url",
    "latitude",
    "longitude",
    "competition_score",
  ];
  const scores = new Map(report.competitors.map((item) => [item.name, item]));
  const rows = report.places.map((place) => [
    place.name,
    place.category ?? "",
    place.address ?? "",
    place.rating ?? "",
    place.reviewCount ?? "",
    place.phone ?? "",
    place.website ?? "",
    Object.entries(place.socialLinks ?? {})
      .map(([network, href]) => `${network}: ${href}`)
      .join(" | "),
    place.sourceUrl ?? "",
    place.latitude,
    place.longitude,
    scores.get(place.name)?.overallScore ?? "",
  ]);

  return [header, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\r\n");
}

function escapeCsv(value: string | number): string {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}
