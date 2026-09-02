import { describe, expect, it } from "vitest";

import { isValidAccessToken, requestHasAccess } from "./access-control";

const privateEnvironment = {
  DATABASE_URL: "postgresql://marketlens:marketlens@localhost:5432/marketlens",
  ENABLE_AUTH: "true",
  MARKETLENS_ACCESS_TOKEN: "test-access-token",
};

describe("access control", () => {
  it("allows local mode without a configured token", () => {
    expect(
      isValidAccessToken(undefined, {
        DATABASE_URL:
          "postgresql://marketlens:marketlens@localhost:5432/marketlens",
      }),
    ).toBe(true);
  });

  it("requires the exact token in private mode", () => {
    expect(isValidAccessToken("test-access-token", privateEnvironment)).toBe(
      true,
    );
    expect(isValidAccessToken("wrong", privateEnvironment)).toBe(false);
  });

  it("reads the token only from the named cookie", () => {
    const request = new Request("http://localhost/api/research", {
      headers: { cookie: "unrelated=value; marketlens_access=test-access-token" },
    });
    expect(requestHasAccess(request, privateEnvironment)).toBe(true);
  });
});
