import { describe, expect, it } from "vitest";
import { z } from "zod";

import { researchCollectionErrorResponse } from "./response";

describe("researchCollectionErrorResponse", () => {
  it("returns a client error for an invalid research payload", async () => {
    let validationError: unknown;
    try {
      z.object({ name: z.string().min(1) }).parse({ name: "" });
    } catch (error) {
      validationError = error;
    }

    const response = researchCollectionErrorResponse(validationError);
    await expect(response.json()).resolves.toEqual({
      code: "INVALID_INPUT",
      error: "Invalid research request.",
    });
    expect(response.status).toBe(400);
  });
});
