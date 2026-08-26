import { describe, expect, it } from "vitest";

import {
  assertResearchTransition,
  canTransitionResearch,
} from "./research-status";

describe("research status transitions", () => {
  it("accepts the defined forward path and retry from failure", () => {
    expect(canTransitionResearch("DRAFT", "QUEUED")).toBe(true);
    expect(canTransitionResearch("ANALYZING", "READY")).toBe(true);
    expect(canTransitionResearch("FAILED", "QUEUED")).toBe(true);
  });

  it("allows a failure from every state but rejects skipped states", () => {
    expect(canTransitionResearch("READY", "FAILED")).toBe(true);
    expect(canTransitionResearch("DRAFT", "READY")).toBe(false);
    expect(() => assertResearchTransition("COLLECTING", "READY")).toThrow(
      "Research cannot transition from COLLECTING to READY.",
    );
  });
});
