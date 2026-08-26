import { describe, expect, it } from "vitest";

import { createServiceHealth } from "./health";

describe("createServiceHealth", () => {
  it("returns the application identity and a stable ISO timestamp", () => {
    const result = createServiceHealth(new Date("2026-08-26T00:00:00.000Z"));

    expect(result).toEqual({
      service: "marketlens-web",
      status: "ok",
      timestamp: "2026-08-26T00:00:00.000Z",
    });
  });
});
