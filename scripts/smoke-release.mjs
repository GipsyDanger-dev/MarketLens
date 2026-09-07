import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { access, appendFile, mkdir, mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Test an npm tarball plus a clean checkout, never the developer's database.
const root = fileURLToPath(new URL("../", import.meta.url));
const workspace = await mkdtemp(join(tmpdir(), "marketlens-release-"));
const npmCli = process.env.npm_execpath;
assert(npmCli, "Run this check with npm run test:release");
const installation = join(workspace, "installation");
const tools = join(workspace, "tools");
await mkdir(join(installation, ".marketlens"), { recursive: true });
const runtime = join(installation, ".marketlens", "runtime");
let cli;
let requests = 0;
const fixture = createServer((req, res) => {
  requests++;
  req.resume();
  res.setHeader("content-type", "application/json");
  res.end(
    JSON.stringify({
      elements: [
        {
          type: "node",
          id: 101,
          lat: -7.977,
          lon: 112.634,
          tags: {
            name: "Release Test Cafe",
            amenity: "cafe",
            phone: "+62 812 0000 0101",
            website: "https://example.com",
            "addr:street": "Test Street",
          },
        },
        {
          type: "node",
          id: 102,
          lat: -7.978,
          lon: 112.635,
          tags: { name: "Release Test Coffee", amenity: "cafe" },
        },
      ],
    }),
  );
});

async function run(command, args, cwd = root) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
      windowsHide: true,
    });
    let output = "";
    child.stdout.on("data", (chunk) => {
      output += chunk;
    });
    child.stderr.on("data", (chunk) => {
      output += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0
        ? resolveRun(output)
        : reject(
            new Error(
              `${command} ${args.join(" ")} failed (${code})\n${output}`,
            ),
          ),
    );
  });
}
const npm = (args, cwd) => run(process.execPath, [npmCli, ...args], cwd);
const command = (args) => run(process.execPath, [cli, ...args], installation);

async function listen(server) {
  await new Promise((resolveListen) =>
    server.listen(0, "127.0.0.1", resolveListen),
  );
  return server.address().port;
}

try {
  console.log(`Release smoke workspace: ${workspace}`);
  const metadata = JSON.parse(
    await readFile(join(root, "apps/cli/package.json"), "utf8"),
  );
  await npm([
    "pack",
    "--workspace=@gipsydanger-dev/marketlens",
    "--pack-destination",
    workspace,
  ]);
  const tarball = join(
    workspace,
    `gipsydanger-dev-marketlens-${metadata.version}.tgz`,
  );
  await npm([
    "install",
    "--prefix",
    tools,
    "--ignore-scripts",
    "--no-audit",
    "--no-fund",
    tarball,
  ]);
  const packageRoot = join(tools, "node_modules/@gipsydanger-dev/marketlens");
  cli = join(packageRoot, "src/index.js");
  await access(join(packageRoot, "LICENSE"));
  await access(join(packageRoot, "LICENSE-MIT"));
  assert.equal(
    (await readFile(join(packageRoot, "LICENSE"), "utf8"))
      .replaceAll("\r\n", "\n")
      .trim(),
    (await readFile(join(root, "LICENSE"), "utf8"))
      .replaceAll("\r\n", "\n")
      .trim(),
  );
  assert.match(
    await npm(
      ["exec", "--prefix", tools, "--", "marketlens", "help"],
      installation,
    ),
    /MarketLens local-first CLI/,
  );
  console.log("Tarball installation, executable and license checks passed.");

  // Clone the checked-out commit, not a moving remote branch or untracked files.
  await run("git", ["clone", "--no-local", root, runtime]);
  const sha = (await run("git", ["rev-parse", "HEAD"])).trim();
  await run("git", ["checkout", "--detach", sha], runtime);
  const fixturePort = await listen(fixture);
  const reservation = createServer();
  const webPort = await listen(reservation);
  await new Promise((resolveClose) => reservation.close(resolveClose));
  await command(["init", "--port", String(webPort)]);
  await appendFile(
    join(installation, ".env"),
    `\nOVERPASS_API_URL=http://127.0.0.1:${fixturePort}/api/interpreter\nMAX_RESEARCH_RESULTS=2\n`,
  );
  console.log(
    "Starting clean embedded runtime: dependency install, client generation, migration, build.",
  );
  await command(["up"]);
  assert.match(await command(["status"]), /RUNNING/);
  const base = `http://localhost:${webPort}`;
  const json = async (path, options) => {
    const response = await fetch(`${base}${path}`, {
      ...options,
      signal: AbortSignal.timeout(60000),
    });
    const body = await response.json();
    assert(response.ok, `${path}: ${response.status} ${JSON.stringify(body)}`);
    return body;
  };
  assert.equal((await json("/api/health")).status, "ok");
  for (const path of ["/", "/research/new", "/settings"]) {
    assert.equal((await fetch(`${base}${path}`)).status, 200, path);
  }
  const project = await json("/api/research", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Release smoke",
      providerId: "openstreetmap",
      query: "cafe",
      category: "cafe",
      locationQuery: "Malang",
      latitude: -7.977,
      longitude: 112.634,
      radiusMeters: 1000,
      maxResults: 1000,
    }),
  });
  assert.equal(project.maxResults, 2);
  const progress = await json(`/api/research/${project.id}/run`, {
    method: "POST",
  });
  assert.equal(progress.projectStatus, "READY");
  assert.equal(progress.totalProcessed, 2);
  assert(requests > 0, "Collection must call the controlled provider endpoint");
  const results = await json(`/api/research/${project.id}/results`);
  assert.equal(results.places.length, 2);
  assert(results.places.some((place) => place.phone === "+62 812 0000 0101"));
  for (const format of ["json", "csv", "pdf"]) {
    const response = await fetch(
      `${base}/api/research/${project.id}/export/${format}`,
    );
    assert.equal(response.status, 200, `${format} export`);
    const data = Buffer.from(await response.arrayBuffer());
    assert(data.length > 100, `${format} export must contain data`);
    if (format === "pdf") assert.equal(data.subarray(0, 5).toString(), "%PDF-");
    else assert.match(data.toString(), /Release Test Cafe/);
  }
  await command(["down"]);
  await command(["up"]);
  assert.equal(
    (await json(`/api/research/${project.id}/results`)).places.length,
    2,
  );
  console.log(
    "PASS: clean npm install, startup, bounded collection, persisted details, JSON/CSV/PDF exports, restart and data retention.",
  );
} finally {
  if (cli) await command(["down"]).catch(() => {});
  fixture.closeAllConnections();
  await new Promise((resolveClose) => fixture.close(resolveClose));
  console.log(
    `Isolated test artifacts retained at ${resolve(workspace)} (no user research was used).`,
  );
}
