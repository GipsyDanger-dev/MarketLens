import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { ensureRuntimeDependencies } from "./embedded-runtime.js";

test("installs on first use, skips unchanged dependencies, and reinstalls changed lockfiles", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "marketlens-dependencies-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await writeFile(join(directory, "package-lock.json"), "first lockfile");
  const calls = [];
  const runner = async (command, args) => {
    calls.push([command, args]);
    await mkdir(join(directory, "node_modules"), { recursive: true });
    return { exitCode: 0, stdout: "", stderr: "" };
  };
  await ensureRuntimeDependencies(directory, runner);
  await ensureRuntimeDependencies(directory, runner);
  assert.equal(calls.length, 1);
  assert.match(calls[0][1].join(" "), /ci --ignore-scripts/);
  await writeFile(join(directory, "package-lock.json"), "patched lockfile");
  await ensureRuntimeDependencies(directory, runner);
  assert.equal(calls.length, 2);
});

test("failed installs remain retryable instead of recording success", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "marketlens-dependencies-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await writeFile(join(directory, "package-lock.json"), "lockfile");
  let calls = 0;
  const runner = async () => {
    calls++;
    return { exitCode: 1, stdout: "", stderr: "offline" };
  };
  await assert.rejects(ensureRuntimeDependencies(directory, runner));
  await assert.rejects(ensureRuntimeDependencies(directory, runner));
  assert.equal(calls, 2);
});
