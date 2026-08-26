import { describe, expect, it } from "vitest";

import { collectionProgressByStatus } from "./progress";

describe("collectionProgressByStatus", () => {
  it("reports a monotonic collection path and terminal progress", () => {
    expect(collectionProgressByStatus.DRAFT).toBe(0);
    expect(collectionProgressByStatus.COLLECTING).toBeLessThan(
      collectionProgressByStatus.NORMALIZING,
    );
    expect(collectionProgressByStatus.ANALYZING).toBeLessThan(
      collectionProgressByStatus.READY,
    );
    expect(collectionProgressByStatus.READY).toBe(100);
    expect(collectionProgressByStatus.FAILED).toBe(100);
  });
});
