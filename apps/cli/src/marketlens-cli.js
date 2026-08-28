import { access, mkdir } from "node:fs/promises";
import { createServer } from "node:net";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  defaultConfig,
  getLocalPaths,
  readConfig,
  writeConfig,
  writeEnvironment,
} from "./config.js";
import {
  assertSuccessful,
  commandExists,
  createCommandRunner,
} from "./command-runner.js";

const SOURCE_REPOSITORY = "https://github.com/GipsyDanger-dev/MarketLens.git";

export function createMarketLensCli(options = {}) {
  const runner = options.runner ?? createCommandRunner();
  const cwd = options.cwd ?? process.cwd();
  const sourceDirectory = options.sourceDirectory ?? getSourceDirectory();
  const print = options.print ?? (() => {});
  const openUrl = options.openUrl ?? defaultOpenUrl;

  async function loadInstallation() {
    const config = await readConfig(cwd);
    if (!config) {
      throw new Error(
        "MarketLens is not initialized. Run 'marketlens init' first.",
      );
    }

    const runtimeDirectory = await resolveRuntimeDirectory(
      cwd,
      sourceDirectory,
    );
    return { config, runtimeDirectory };
  }

  async function init(config = defaultConfig) {
    const paths = await writeConfig(cwd, config);
    const environment = await writeEnvironment(cwd, config);
    const runtimeDirectory = await resolveRuntimeDirectory(
      cwd,
      sourceDirectory,
      {
        create: true,
        runner,
      },
    );

    return { environment, paths, runtimeDirectory };
  }

  async function up() {
    const { config, runtimeDirectory } = await loadInstallation();
    await assertDockerAvailable(runner);
    assertDockerDatabase(config);
    await assertPortAvailable(config.web.port);

    const compose = composeArguments(cwd, runtimeDirectory);
    assertSuccessful(
      await runner("docker", [
        ...compose,
        "up",
        "-d",
        "--build",
        "postgres",
        "web",
      ]),
      "Run 'marketlens doctor' and inspect Docker Desktop.",
    );
    assertSuccessful(
      await runner("docker", [
        ...compose,
        "--profile",
        "tools",
        "run",
        "--rm",
        "migrate",
        "run",
        "db:deploy",
      ]),
      "Check DATABASE_URL and run 'marketlens logs'.",
    );

    return {
      config,
      url: `http://${config.web.host}:${config.web.port}`,
    };
  }

  async function down() {
    const { runtimeDirectory } = await loadInstallation();
    await assertDockerAvailable(runner);
    const result = await runner("docker", [
      ...composeArguments(cwd, runtimeDirectory),
      "down",
    ]);
    return assertSuccessful(
      result,
      "Docker data is retained. Run 'marketlens doctor' if the stack will not stop.",
    );
  }

  async function status() {
    const { config, runtimeDirectory } = await loadInstallation();
    const dockerAvailable = await commandExists("docker", runner);
    let composeStatus = "UNAVAILABLE";

    if (dockerAvailable) {
      const result = await runner("docker", [
        ...composeArguments(cwd, runtimeDirectory),
        "ps",
        "--format",
        "json",
      ]);
      composeStatus =
        result.exitCode === 0 ? result.stdout.trim() || "STOPPED" : "ERROR";
    }

    return { composeStatus, config, dockerAvailable };
  }

  async function doctor() {
    const config = await readConfig(cwd);
    const dockerAvailable = await commandExists("docker", runner);
    const composeAvailable = dockerAvailable
      ? (await runner("docker", ["compose", "version"])).exitCode === 0
      : false;
    const portAvailable = config
      ? await isPortAvailable(config.web.port)
      : false;
    const runtimeDirectory = await resolveRuntimeDirectory(
      cwd,
      sourceDirectory,
    );

    return {
      composeAvailable,
      config,
      dockerAvailable,
      nodeVersion: process.versions.node,
      portAvailable,
      runtimeDirectory,
    };
  }

  async function config(nextConfig) {
    if (!nextConfig) {
      const currentConfig = await readConfig(cwd);
      if (!currentConfig) {
        throw new Error(
          "MarketLens is not initialized. Run 'marketlens init' first.",
        );
      }
      return currentConfig;
    }

    const paths = await writeConfig(cwd, nextConfig);
    const environment = await writeEnvironment(cwd, nextConfig, {
      overwrite: true,
    });
    return { environment, paths };
  }

  async function logs() {
    const { runtimeDirectory } = await loadInstallation();
    await assertDockerAvailable(runner);
    return runner("docker", [
      ...composeArguments(cwd, runtimeDirectory),
      "logs",
      "--tail",
      "100",
    ]);
  }

  async function open() {
    const { config } = await loadInstallation();
    const url = `http://${config.web.host}:${config.web.port}`;
    await openUrl(url, runner);
    return url;
  }

  return { config, doctor, down, init, logs, open, print, status, up };
}

export async function resolveRuntimeDirectory(
  installationDirectory,
  sourceDirectory,
  options = {},
) {
  const { create = false, runner = createCommandRunner() } = options;
  const localRuntime = join(
    getLocalPaths(installationDirectory).localDirectory,
    "runtime",
  );

  if (await hasComposeFile(installationDirectory)) {
    return installationDirectory;
  }
  if (await hasComposeFile(localRuntime)) {
    return localRuntime;
  }
  if (await hasComposeFile(sourceDirectory)) {
    return sourceDirectory;
  }
  if (!create) {
    return null;
  }

  await mkdir(dirname(localRuntime), { recursive: true });
  assertSuccessful(
    await runner("git", [
      "clone",
      "--depth",
      "1",
      SOURCE_REPOSITORY,
      localRuntime,
    ]),
    "Install Git or initialize MarketLens from a cloned source checkout.",
  );
  return localRuntime;
}

export function composeArguments(installationDirectory, runtimeDirectory) {
  if (!runtimeDirectory) {
    throw new Error(
      "MarketLens runtime files are unavailable. Run 'marketlens init' again.",
    );
  }

  return [
    "compose",
    "--project-directory",
    runtimeDirectory,
    "--env-file",
    join(installationDirectory, ".env"),
    "-f",
    join(runtimeDirectory, "docker-compose.yml"),
  ];
}

export async function assertDockerAvailable(runner) {
  if (!(await commandExists("docker", runner))) {
    throw new Error(
      "Docker is not installed or not running. Install Docker Desktop, start it, then run 'marketlens doctor'.",
    );
  }

  const compose = await runner("docker", ["compose", "version"]);
  assertSuccessful(
    compose,
    "Install Docker Compose v2, then run 'marketlens doctor'.",
  );
}

export function assertDockerDatabase(config) {
  if (config.database.mode !== "docker") {
    throw new Error(
      "External PostgreSQL is configured but runtime wiring is not enabled. Set 'marketlens config database docker' or provide the external runtime override before starting.",
    );
  }
}

export async function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, "127.0.0.1");
  });
}

export async function assertPortAvailable(port) {
  if (!(await isPortAvailable(port))) {
    throw new Error(
      `Port ${port} is already in use. Stop the conflicting process or change it with 'marketlens config port <number>'.`,
    );
  }
}

async function hasComposeFile(directory) {
  if (!directory) return false;

  try {
    await access(join(directory, "docker-compose.yml"));
    return true;
  } catch {
    return false;
  }
}

function getSourceDirectory() {
  return resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
}

async function defaultOpenUrl(url, runner) {
  const command =
    process.platform === "win32"
      ? "cmd"
      : process.platform === "darwin"
        ? "open"
        : "xdg-open";
  const argumentsList =
    process.platform === "win32" ? ["/c", "start", "", url] : [url];
  const result = await runner(command, argumentsList, { stdio: "inherit" });
  assertSuccessful(result, `Open ${url} manually in your browser.`);
}
