import type { Metadata } from "next";
import { JetBrains_Mono, Manrope, Newsreader } from "next/font/google";
import type { ReactNode } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

const manrope = Manrope({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-manrope",
});

const newsreader = Newsreader({
  axes: ["opsz"],
  display: "swap",
  subsets: ["latin"],
  variable: "--font-newsreader",
});

const jetBrainsMono = JetBrains_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

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
    <html
      lang="en"
      className={`${manrope.variable} ${newsreader.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--canvas)]">
        {children}
      </body>
    </html>
  );
}
