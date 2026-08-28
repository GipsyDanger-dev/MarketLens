import assert from "node:assert/strict";
import test from "node:test";

import { createTuiConfig, parseTuiAction, renderTuiScreen } from "./tui.js";

test("TUI maps menu choices and slash commands", () => {
  assert.equal(parseTuiAction("1"), "initialize");
  assert.equal(parseTuiAction(" /help "), "help");
  assert.equal(parseTuiAction("/doctor"), "doctor");
  assert.equal(parseTuiAction("0"), "exit");
  assert.equal(parseTuiAction("invalid"), null);
});

test("TUI renders runtime and optional AI state", () => {
  const screen = renderTuiScreen({
    config: {
      ai: { enabled: false, provider: null },
      database: { mode: "docker" },
      provider: "openstreetmap",
      web: { host: "localhost", port: 3000 },
    },
    status: { composeStatus: "RUNNING", dockerAvailable: true },
  });

  assert.match(screen, /MARKETLENS TERMINAL/);
  assert.match(screen, /Web       RUNNING/);
  assert.match(screen, /AI        Disabled \(optional\)/);
  assert.match(screen, /Run doctor/);
});

test("TUI onboarding creates a local-first configuration without credentials", () => {
  assert.deepEqual(
    createTuiConfig({ aiChoice: "3", port: "3010", providerChoice: "2" }),
    {
      ai: { enabled: true, provider: "ollama" },
      database: { mode: "docker" },
      provider: "google-places",
      version: 1,
      web: { host: "localhost", port: 3010 },
    },
  );
  assert.throws(
    () => createTuiConfig({ port: "70000" }),
    /Web port must be an integer/,
  );
});
