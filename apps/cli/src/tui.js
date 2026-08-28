import { createInterface } from "node:readline/promises";

import { defaultConfig } from "./config.js";

const VERSION = "1.2.0";

export const TUI_ACTIONS = Object.freeze({
  1: "initialize",
  2: "up",
  3: "down",
  4: "status",
  5: "open",
  6: "logs",
  7: "settings",
  "/help": "help",
  "/exit": "exit",
  0: "exit",
});

export function parseTuiAction(value) {
  return TUI_ACTIONS[value.trim().toLowerCase()] ?? null;
}

export function renderTuiScreen({ config, notice, status }) {
  const provider = config?.provider ?? "Not configured";
  const ai = config?.ai?.enabled ? config.ai.provider : "Disabled";
  const database = config?.database?.mode ?? "Not configured";
  const webStatus = status?.composeStatus ?? "NOT STARTED";
  const docker = status?.dockerAvailable ? "Ready" : "Not detected";
  const url = config
    ? `http://${config.web.host}:${config.web.port}`
    : "Run Initialize to create a local installation";

  return [
    "\u001Bc",
    "╭──────────────────────────────────────────────────────────────╮",
    `│  MARKETLENS TERMINAL                                    v${VERSION}  │`,
    "│  Local market intelligence · no chat · local-first             │",
    "╰──────────────────────────────────────────────────────────────╯",
    "",
    "  Runtime",
    `  Web       ${webStatus}`,
    `  Docker    ${docker}`,
    `  URL       ${url}`,
    "",
    "  Configuration",
    `  Provider  ${provider}`,
    `  AI        ${ai} (optional)`,
    `  Database  ${database}`,
    "",
    "  [1] Initialize local workspace     [2] Start services",
    "  [3] Stop services                  [4] Check status",
    "  [5] Open dashboard                 [6] View logs",
    "  [7] Settings                       [?] Help",
    "",
    notice ? `  ${notice}` : "  Select an option or type /help.",
    "",
  ].join("\n");
}

export async function runTui(options) {
  const { cli, input = process.stdin, output = process.stdout } = options;
  const readline = createInterface({
    input,
    output,
    terminal: Boolean(output.isTTY),
  });
  let notice = "Welcome. Initialize a workspace to begin.";

  try {
    while (true) {
      const config = await getConfig(cli);
      const status = config ? await getStatus(cli) : null;
      output.write(renderTuiScreen({ config, notice, status }));
      const selection = await readline.question("  › ");
      const action = parseTuiAction(selection === "?" ? "/help" : selection);

      if (action === "exit") {
        output.write("\n  MarketLens terminal closed.\n");
        return 0;
      }

      notice = await performTuiAction({
        action,
        ask: (prompt) => readline.question(prompt),
        cli,
        config,
        output,
      });
    }
  } finally {
    readline.close();
  }
}

async function performTuiAction({ action, ask, cli, config, output }) {
  try {
    switch (action) {
      case "initialize":
        await cli.init(config ?? defaultConfig);
        return "Workspace initialized. Choose Start services when Docker is ready.";
      case "up": {
        const result = await cli.up();
        return `Services started at ${result.url}.`;
      }
      case "down":
        await cli.down();
        return "Services stopped. Local PostgreSQL data was retained.";
      case "status":
        return "Status refreshed.";
      case "open":
        return `Opening ${await cli.open()}.`;
      case "logs": {
        const result = await cli.logs();
        output.write(
          `\n${result.stdout || result.stderr || "No container logs yet."}\n`,
        );
        await ask("  Press Enter to continue: ");
        return "Logs refreshed.";
      }
      case "settings":
        return await updateSettings(cli, config, output, ask);
      case "help":
        return "Use numbers 1–7 for actions. Settings controls provider and optional AI.";
      default:
        return "Unknown option. Type ? for help or 0 to exit.";
    }
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
}

async function updateSettings(cli, config, output, ask) {
  if (!config) {
    return "Initialize the workspace before changing settings.";
  }

  output.write(
    "\n  Settings: [1] OpenStreetMap  [2] Google Places  [3] Disable AI  [4] Gemini AI\n",
  );
  const selection = await ask("  › ");
  const next = structuredClone(config);

  if (selection === "1") next.provider = "openstreetmap";
  else if (selection === "2") next.provider = "google-places";
  else if (selection === "3") next.ai = { enabled: false, provider: null };
  else if (selection === "4") next.ai = { enabled: true, provider: "gemini" };
  else return "Settings unchanged.";

  await cli.config(next);
  return "Settings saved. Add optional API keys only to the local .env file.";
}

async function getConfig(cli) {
  try {
    return await cli.config();
  } catch {
    return null;
  }
}

async function getStatus(cli) {
  try {
    return await cli.status();
  } catch {
    return null;
  }
}
