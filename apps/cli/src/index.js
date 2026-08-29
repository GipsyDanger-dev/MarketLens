#!/usr/bin/env node

import { defaultConfig } from "./config.js";
import { createMarketLensCli } from "./marketlens-cli.js";
import { runTui } from "./tui.js";

const HELP = `MarketLens local-first CLI

Usage:
  marketlens init [--port <number>] [--provider <openstreetmap|google-places>] [--ai <disabled|gemini|ollama|openai-compatible>]
  marketlens up | down | status | open | doctor | logs
  marketlens config [provider|ai|database|port] [value]
  marketlens tui
`;

export async function main(
  argumentsList = process.argv.slice(2),
  options = {},
) {
  const cli = options.cli ?? createMarketLensCli(options);
  const [command, ...rest] = argumentsList;

  try {
    switch (command) {
      case "init": {
        const result = await cli.init(configFromArguments(rest));
        output(
          options,
          `MarketLens initialized.\nConfig: ${result.paths.config}\nDashboard: http://localhost:${configFromArguments(rest).web.port}`,
        );
        return 0;
      }
      case "up": {
        const result = await cli.up();
        output(options, `MarketLens is running.\nDashboard: ${result.url}`);
        return 0;
      }
      case "down":
        await cli.down();
        output(
          options,
          "MarketLens services stopped. Your PostgreSQL volume was retained.",
        );
        return 0;
      case "status":
        output(options, formatStatus(await cli.status()));
        return 0;
      case "open":
        output(options, `Opening ${await cli.open()}`);
        return 0;
      case "doctor":
        output(options, formatDoctor(await cli.doctor()));
        return 0;
      case "logs": {
        const result = await cli.logs();
        output(
          options,
          result.stdout || result.stderr || "No container logs yet.",
        );
        return result.exitCode;
      }
      case "config":
        return runConfig(cli, rest, options);
      case "tui":
        return runTui({ ...options, cli });
      case "help":
      case "--help":
      case "-h":
        output(options, HELP);
        return 0;
      case undefined:
        if (
          options.interactive ??
          (process.stdin.isTTY && process.stdout.isTTY)
        ) {
          return runTui({ ...options, cli });
        }
        output(options, HELP);
        return 0;
      default:
        throw new Error(`Unknown command '${command}'.\n\n${HELP}`);
    }
  } catch (error) {
    output(
      options,
      `Error: ${error instanceof Error ? error.message : String(error)}`,
      true,
    );
    return 1;
  }
}

export function configFromArguments(argumentsList) {
  const values = new Map();
  for (let index = 0; index < argumentsList.length; index += 2) {
    const key = argumentsList[index];
    const value = argumentsList[index + 1];
    if (!key?.startsWith("--") || value === undefined) {
      throw new Error(
        "init expects --port, --provider, and --ai options with values.",
      );
    }
    values.set(key.slice(2), value);
  }

  const aiProvider = values.get("ai") ?? "disabled";
  return {
    ...defaultConfig,
    provider: values.get("provider") ?? defaultConfig.provider,
    ai: {
      enabled: aiProvider !== "disabled",
      provider: aiProvider === "disabled" ? null : aiProvider,
    },
    web: {
      ...defaultConfig.web,
      port: Number(values.get("port") ?? defaultConfig.web.port),
    },
  };
}

async function runConfig(cli, argumentsList, options) {
  const [field, value] = argumentsList;
  const current = await cli.config();
  if (!field) {
    output(options, JSON.stringify(current, null, 2));
    return 0;
  }
  if (value === undefined) {
    throw new Error("config requires both a field and a value.");
  }

  const next = structuredClone(current);
  switch (field) {
    case "provider":
      next.provider = value;
      break;
    case "ai":
      next.ai = {
        enabled: value !== "disabled",
        provider: value === "disabled" ? null : value,
      };
      break;
    case "database":
      next.database = { mode: value };
      break;
    case "port":
      next.web.port = Number(value);
      break;
    default:
      throw new Error("config supports provider, ai, database, and port.");
  }

  await cli.config(next);
  output(options, "Configuration saved.");
  return 0;
}

function formatStatus(status) {
  const { config, composeStatus, dockerAvailable } = status;
  return [
    "MarketLens Status",
    "",
    `Web          ${composeStatus}`,
    `Docker       ${
      config.database.mode === "embedded"
        ? "NOT REQUIRED"
        : dockerAvailable
          ? "AVAILABLE"
          : "UNAVAILABLE"
    }`,
    `Runtime      ${
      config.database.mode === "embedded"
        ? "LIGHTWEIGHT LOCAL"
        : config.database.mode.toUpperCase()
    }`,
    `Provider     ${config.provider}`,
    `AI           ${config.ai.enabled ? config.ai.provider : "Disabled"}`,
    `Version      1.2.0`,
    `URL          http://${config.web.host}:${config.web.port}`,
  ].join("\n");
}

function formatDoctor(result) {
  return [
    "MarketLens Doctor",
    "",
    `Node.js      ${result.nodeVersion}`,
    `Config       ${result.config ? "READY" : "MISSING"}`,
    `Docker       ${result.dockerAvailable ? "READY" : "MISSING"}`,
    `Compose      ${result.composeAvailable ? "READY" : "MISSING"}`,
    `Runtime      ${result.runtimeDirectory ?? "MISSING"}`,
    result.embedded
      ? `Embedded     ${result.embedded.running ? "RUNNING" : "READY"}`
      : null,
    `Web port     ${result.portAvailable ? "AVAILABLE" : "IN USE OR UNCONFIGURED"}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function output(options, message, isError = false) {
  const writer = isError
    ? (options.stderr ?? console.error)
    : (options.stdout ?? console.log);
  writer(message);
}

if (import.meta.main) {
  main().then((exitCode) => {
    process.exitCode = exitCode;
  });
}
