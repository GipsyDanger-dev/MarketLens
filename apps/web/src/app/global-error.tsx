"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(
      JSON.stringify({
        level: "error",
        event: "app.unhandled_error",
        digest: error.digest,
      }),
    );
  }, [error]);
  return (
    <html lang="en">
      <body
        style={{
          background: "#f3f0e7",
          color: "#16201b",
          fontFamily: "DM Sans, sans-serif",
          margin: 0,
        }}
      >
        <main
          style={{
            borderTop: "1px solid #9aa398",
            borderBottom: "1px solid #9aa398",
            maxWidth: 640,
            margin: "15vh auto",
            padding: "32px 24px",
          }}
        >
          <p
            style={{
              color: "#476b50",
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            MarketLens / recovery
          </p>
          <h1
            style={{
              fontFamily: "Fraunces, Georgia, serif",
              fontSize: "clamp(2.5rem, 7vw, 4rem)",
              letterSpacing: "-0.05em",
              lineHeight: 0.96,
              margin: "18px 0",
            }}
          >
            We could not load this page.
          </h1>
          <p style={{ color: "#445149", lineHeight: 1.6, maxWidth: 520 }}>
            Try again. If the problem continues, use the error reference when
            contacting the operator.
          </p>
          {error.digest ? (
            <p
              style={{
                borderTop: "1px solid #c9cdc1",
                color: "#718076",
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: 12,
                marginTop: 24,
                paddingTop: 16,
              }}
            >
              Error reference / {error.digest}
            </p>
          ) : null}
          <button
            onClick={reset}
            style={{
              background: "#476b50",
              border: "1px solid #476b50",
              borderRadius: 0,
              color: "#fffcf5",
              cursor: "pointer",
              fontWeight: 600,
              marginTop: 16,
              minHeight: 44,
              padding: "10px 16px",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
