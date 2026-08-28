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
          background: "#020617",
          color: "#f8fafc",
          fontFamily: "system-ui",
          margin: 0,
        }}
      >
        <main style={{ maxWidth: 560, margin: "15vh auto", padding: 24 }}>
          <p
            style={{
              color: "#67e8f9",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
            }}
          >
            MarketLens
          </p>
          <h1>We could not load this page.</h1>
          <p>
            Try again. If the problem continues, use the error reference when
            contacting the operator.
          </p>
          {error.digest ? <p>Error reference: {error.digest}</p> : null}
          <button
            onClick={reset}
            style={{
              background: "#67e8f9",
              border: 0,
              borderRadius: 6,
              color: "#020617",
              cursor: "pointer",
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
