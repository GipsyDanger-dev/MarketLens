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
          background: "#0b1220",
          color: "#f7f9fc",
          fontFamily: 'Manrope, "Segoe UI", sans-serif',
          margin: 0,
        }}
      >
        <main
          style={{
            alignItems: "center",
            backgroundImage:
              "linear-gradient(rgba(129,151,200,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(129,151,200,.08) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            display: "flex",
            minHeight: "100vh",
            padding: "clamp(20px, 5vw, 72px)",
          }}
        >
          <section
            style={{
              border: "1px solid #34415a",
              boxShadow: "0 28px 80px rgba(0,0,0,.32)",
              margin: "0 auto",
              maxWidth: 720,
              overflow: "hidden",
              width: "100%",
            }}
          >
            <div
              style={{
                alignItems: "center",
                borderBottom: "1px solid #34415a",
                display: "flex",
                justifyContent: "space-between",
                padding: "16px 20px",
              }}
            >
              <strong style={{ fontSize: 14, letterSpacing: "-.02em" }}>
                MarketLens
              </strong>
              <span
                style={{
                  color: "#9aa9c1",
                  fontFamily: '"JetBrains Mono", Consolas, monospace',
                  fontSize: 10,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                }}
              >
                Recovery console
              </span>
            </div>
            <div style={{ padding: "clamp(28px, 7vw, 64px)" }}>
              <p
                style={{
                  color: "#8eabff",
                  fontFamily: '"JetBrains Mono", Consolas, monospace',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: ".12em",
                  margin: 0,
                  textTransform: "uppercase",
                }}
              >
                Application interruption / 500
              </p>
              <h1
                style={{
                  color: "#f7f9fc",
                  fontFamily: "Newsreader, Georgia, serif",
                  fontSize: "clamp(3rem, 9vw, 5.6rem)",
                  fontWeight: 500,
                  letterSpacing: "-.055em",
                  lineHeight: 0.9,
                  margin: "24px 0",
                  maxWidth: 600,
                }}
              >
                The workspace lost its place.
              </h1>
              <p style={{ color: "#b5c0d2", lineHeight: 1.7, margin: 0, maxWidth: 520 }}>
                Retry the request. Your persisted research data is kept
                separate from this page error and should remain available.
              </p>
              {error.digest ? (
                <p
                  style={{
                    borderLeft: "2px solid #b7642a",
                    color: "#9aa9c1",
                    fontFamily: '"JetBrains Mono", Consolas, monospace',
                    fontSize: 11,
                    margin: "28px 0 0",
                    padding: "4px 0 4px 12px",
                  }}
                >
                  Error reference / {error.digest}
                </p>
              ) : null}
              <button
                onClick={reset}
                style={{
                  background: "#315ef5",
                  border: "1px solid #7090ff",
                  borderRadius: 6,
                  color: "#ffffff",
                  cursor: "pointer",
                  fontWeight: 700,
                  marginTop: 30,
                  minHeight: 48,
                  padding: "11px 20px",
                }}
              >
                Retry workspace
              </button>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
