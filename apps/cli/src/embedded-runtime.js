import { spawn } from "node:child_process";
import { access, open, readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { assertSuccessful } from "./command-runner.js";
import { getLocalPaths } from "./config.js";

const START_TIMEOUT_MILLISECONDS = 60_000;

export function getEmbeddedRuntimePaths(installationDirectory) {
  const local = getLocalPaths(installationDirectory);
  return {
    dataDirectory: join(local.data, "embedded-postgres"),
    log: join(local.logs, "embedded-web.log"),
    pid: join(local.localDirectory, "embedded-web.pid"),
  };
}

export async function startEmbeddedRuntime(options) {
  const {
    config,
    installationDirectory,
    runner,
    runtimeDirectory,
    spawnProcess = spawn,
  } = options;
  const paths = getEmbeddedRuntimePaths(installationDirectory);
  const environment = await createEmbeddedEnvironment({
    config,
    dataDirectory: paths.dataDirectory,
    installationDirectory,
  });

  if (await isEmbeddedRuntimeRunning(installationDirectory)) {
    return { alreadyRunning: true, url: getUrl(config) };
  }

  await ensureRuntimeDependencies(runtimeDirectory, runner);
  assertSuccessful(
    await runner(
      npmCommand(),
      ["run", "db:embedded", "--workspace=@marketlens/web"],
      { cwd: runtimeDirectory, env: environment },
    ),
    "Inspect the local runtime log and run 'marketlens doctor'.",
  );
  assertSuccessful(
    await runner(
      npmCommand(),
      ["run", "build", "--workspace=@marketlens/web"],
      {
        cwd: runtimeDirectory,
        env: environment,
      },
    ),
    "Inspect the local runtime log and run 'marketlens doctor'.",
  );

  const log = await open(paths.log, "a");
  try {
    const child = spawnProcess(
      npmCommand(),
      ["run", "start", "--workspace=@marketlens/web"],
      {
        cwd: runtimeDirectory,
        detached: true,
        env: environment,
        stdio: ["ignore", log.fd, log.fd],
        windowsHide: true,
      },
    );
    child.unref();
    if (!child.pid) {
      throw new Error("Unable to start the embedded MarketLens web process.");
    }
    await writeFile(paths.pid, `${child.pid}\n`, "utf8");
  } finally {
    await log.close();
  }

  await waitForWebApp(getUrl(config));
  return { alreadyRunning: false, url: getUrl(config) };
}

export async function stopEmbeddedRuntime(options) {
  const { installationDirectory, runner } = options;
  const pid = await readPid(installationDirectory);
  if (!pid || !isProcessRunning(pid)) {
    await removePidFile(installationDirectory);
    return { stopped: false };
  }

  if (process.platform === "win32") {
    await runner("taskkill", ["/pid", String(pid), "/T", "/F"]);
  } else {
    process.kill(pid, "SIGTERM");
  }
  await removePidFile(installationDirectory);
  return { stopped: true };
}

export async function getEmbeddedRuntimeStatus(installationDirectory) {
  const pid = await readPid(installationDirectory);
  const running = Boolean(pid && isProcessRunning(pid));
  if (!running) await removePidFile(installationDirectory);
  return { pid: running ? pid : null, running };
}

export async function readEmbeddedLogs(installationDirectory) {
  try {
    return await readFile(
      getEmbeddedRuntimePaths(installationDirectory).log,
      "utf8",
    );
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") {
      return "";
    }
    throw error;
  }
}

export async function isEmbeddedRuntimeRunning(installationDirectory) {
  return (await getEmbeddedRuntimeStatus(installationDirectory)).running;
}

async function ensureRuntimeDependencies(runtimeDirectory, runner) {
  try {
    await access(join(runtimeDirectory, "node_modules"));
    return;
  } catch {
    // The global CLI clones source files, but dependencies remain local to it.
  }

  assertSuccessful(
    await runner(npmCommand(), ["ci", "--ignore-scripts"], {
      cwd: runtimeDirectory,
    }),
    "Check the internet connection and npm configuration, then retry.",
  );
}

async function createEmbeddedEnvironment(options) {
  const { config, dataDirectory, installationDirectory } = options;
  const fileValues = await readEnvironment(installationDirectory);
  return {
    ...process.env,
    ...fileValues,
    DATABASE_URL:
      fileValues.DATABASE_URL ??
      "postgresql://marketlens:local@127.0.0.1:5432/marketlens?schema=public",
    MARKETLENS_DATA_DIRECTORY: dataDirectory,
    MARKETLENS_RUNTIME: "embedded",
    NEXT_TELEMETRY_DISABLED: "1",
    PORT: String(config.web.port),
  };
}

async function readEnvironment(installationDirectory) {
  try {
    const content = await readFile(
      getLocalPaths(installationDirectory).environment,
      "utf8",
    );
    return Object.fromEntries(
      content
        .split(/\r?\n/u)
        .filter((line) => line && !line.startsWith("#") && line.includes("="))
        .map((line) => {
          const separator = line.indexOf("=");
          return [line.slice(0, separator), line.slice(separator + 1)];
        }),
    );
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") {
      return {};
    }
    throw error;
  }
}

async function waitForWebApp(url) {
  const deadline = Date.now() + START_TIMEOUT_MILLISECONDS;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${url}/api/health`);
      if (response.ok) return;
    } catch {
      // The process is still initializing.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(
    "The embedded web app did not become ready within one minute. Run 'marketlens logs'.",
  );
}

async function readPid(installationDirectory) {
  try {
    const value = Number.parseInt(
      await readFile(
        getEmbeddedRuntimePaths(installationDirectory).pid,
        "utf8",
      ),
      10,
    );
    return Number.isInteger(value) && value > 0 ? value : null;
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function removePidFile(installationDirectory) {
  try {
    await unlink(getEmbeddedRuntimePaths(installationDirectory).pid);
  } catch (error) {
    if (!(error && typeof error === "object" && error.code === "ENOENT")) {
      throw error;
    }
  }
}

function isProcessRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function getUrl(config) {
  return `http://${config.web.host}:${config.web.port}`;
}

function npmCommand() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}
