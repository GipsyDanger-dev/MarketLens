import { expect, test } from "@playwright/test";

test("returns application health", async ({ request }) => {
  const response = await request.get("/api/health");

  await expect(response).toBeOK();
  await expect(response.json()).resolves.toMatchObject({
    service: "marketlens-web",
    status: "ok",
  });
});
