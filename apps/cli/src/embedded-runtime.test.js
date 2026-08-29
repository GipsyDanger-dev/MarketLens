import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { defaultConfig } from "./config.js";
import { createMarketLensCli } from "./marketlens-cli.js";

test(
  "embedded runtime starts a queryable MarketLens stack without Docker",
  { timeout: 180_000 },
  async (t) => {
    const installationDirectory = await mkdtemp(
      join(tmpdir(), "marketlens-embedded-"),
    );
    const port = await getAvailablePort();
    const cli = createMarketLensCli({
      cwd: installationDirectory,
      sourceDirectory: resolve(
        dirname(fileURLToPath(import.meta.url)),
        "../../..",
      ),
    });

    t.after(async () => {
      await cli.down();
      await rm(installationDirectory, { force: true, recursive: true });
    });

    await cli.init({
      ...defaultConfig,
      web: { host: "localhost", port },
    });
    const started = await cli.up();
    const response = await fetch(`${started.url}/api/research`, {
      body: JSON.stringify({
        latitude: -6.2088,
        locationQuery: "Jakarta, Indonesia",
        longitude: 106.8456,
        name: "Embedded runtime check",
        providerId: "openstreetmap",
        query: "coffee shop",
        radiusMeters: 5_000,
      }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    const body = await response.json();
    const logs = await cli.logs();
    assert.equal(
      response.status,
      201,
      JSON.stringify({ body, logs: logs.stdout }),
    );
    assert.equal(body.providerId, "openstreetmap");
    assert.equal((await cli.status()).composeStatus, "RUNNING");
  },
);

async function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Unable to select a local test port."));
        return;
      }
      server.close(() => resolve(address.port));
    });
  });
}
