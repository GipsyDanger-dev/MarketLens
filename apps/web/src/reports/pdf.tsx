import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";

import type { ResearchReport } from "./types";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, color: "#172033" },
  title: { fontSize: 22, marginBottom: 4 },
  subtitle: { color: "#526074", marginBottom: 16 },
  section: { marginBottom: 14 },
  heading: { fontSize: 13, marginBottom: 5, color: "#0f766e" },
  text: { lineHeight: 1.45, marginBottom: 3 },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  metric: { width: "31%", padding: 6, backgroundColor: "#f1f5f9" },
  small: { color: "#64748b", fontSize: 8 },
});

export async function researchReportToPdf(
  report: ResearchReport,
): Promise<Buffer> {
  return renderToBuffer(<ReportDocument report={report} />);
}

function ReportDocument({ report }: { report: ResearchReport }) {
  return (
    <Document
      title={`${report.metadata.name} — MarketLens report`}
      author="MarketLens"
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{report.metadata.name}</Text>
        <Text style={styles.subtitle}>
          {report.metadata.query} · {report.metadata.location}
        </Text>
        <Text style={styles.small}>
          Generated {report.metadata.generatedAt} · Collected{" "}
          {report.metadata.collectedAt ?? "unknown"}
        </Text>
        <Section
          title="Executive summary"
          items={
            report.aiInsight?.marketSummary ?? [
              `${report.metrics.totalBusinesses} businesses were observed in this research dataset.`,
            ]
          }
        />
        <View style={styles.section}>
          <Text style={styles.heading}>Market metrics</Text>
          <View style={styles.metricGrid}>
            {[
              ["Businesses", report.metrics.totalBusinesses],
              ["Average rating", report.metrics.averageRating ?? "—"],
              ["Average reviews", report.metrics.averageReviewCount ?? "—"],
              ["Competition score", report.metrics.competitionScore ?? "—"],
              ["Density score", report.metrics.densityScore ?? "—"],
            ].map(([label, value]) => (
              <View key={String(label)} style={styles.metric}>
                <Text>{label}</Text>
                <Text>{String(value)}</Text>
              </View>
            ))}
          </View>
        </View>
        <Section
          title="Competition"
          items={report.competitors
            .slice(0, 10)
            .map(
              (competitor) =>
                `${competitor.name}: score ${competitor.overallScore ?? "—"}, rating ${competitor.rating ?? "—"}, reviews ${competitor.reviewCount ?? "—"}. ${competitor.explanation ?? ""}`,
            )}
        />
        <Section
          title="Opportunity signals"
          items={report.metrics.opportunitySignals}
        />
        {report.aiInsight ? (
          <>
            <Section
              title="AI competition insights"
              items={report.aiInsight.competitionInsights}
            />
            <Section title="AI risks" items={report.aiInsight.risks} />
            <Section
              title="AI recommendations"
              items={report.aiInsight.recommendations}
            />
          </>
        ) : null}
        <Section title="Methodology" items={[report.metadata.methodology]} />
        <Section title="Limitations" items={report.limitations} />
      </Page>
    </Document>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{title}</Text>
      {items.map((item, index) => (
        <Text key={`${title}-${index}`} style={styles.text}>
          • {item}
        </Text>
      ))}
    </View>
  );
}
