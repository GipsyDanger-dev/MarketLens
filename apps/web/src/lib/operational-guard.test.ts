import { describe, expect, it } from "vitest";
import { createRateLimiter } from "./operational-guard";

describe("createRateLimiter", () => {
  it("blocks requests above the configured fixed-window limit", () => {
    let time = 0;
    const limiter = createRateLimiter({
      limit: 2,
      windowMilliseconds: 1_000,
      now: () => time,
    });
    expect(limiter.consume("client").allowed).toBe(true);
    expect(limiter.consume("client").allowed).toBe(true);
    expect(limiter.consume("client")).toMatchObject({
      allowed: false,
      retryAfterSeconds: 1,
    });
    time = 1_000;
    expect(limiter.consume("client").allowed).toBe(true);
  });
});
