import type { Metadata } from "next";
import type { ReactNode } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MarketLens — Local market intelligence",
    template: "%s | MarketLens",
  },
  description:
    "Open-source, self-hostable local market intelligence for explainable competitor and geographic research.",
  applicationName: "MarketLens",
  keywords: [
    "local market intelligence",
    "competitor analysis",
    "business intelligence",
    "open source",
    "OpenStreetMap",
  ],
  openGraph: {
    title: "MarketLens — Local market intelligence",
    description:
      "Transform place data into explainable market analytics, competitor intelligence, and exportable insights.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[var(--canvas)]">
        {children}
      </body>
    </html>
  );
}
