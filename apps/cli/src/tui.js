import { createInterface } from "node:readline/promises";
import { readFile, writeFile } from "node:fs/promises";

import { defaultConfig, getLocalPaths } from "./config.js";

const VERSION = "1.3.0";

export const TUI_ACTIONS = Object.freeze({
  1: "initialize",
  2: "up",
  3: "down",
  4: "status",
  5: "open",
  6: "logs",
  7: "settings",
  8: "doctor",
  "/help": "help",
  "/doctor": "doctor",
  "/settings": "settings",
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
  const docker =
    database === "embedded"
      ? "Not required"
      : status?.dockerAvailable
        ? "Ready"
        : "Not detected";
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
    `  Storage   ${database === "embedded" ? "Embedded local" : database}`,
    "",
    "  [1] Initialize local workspace     [2] Start services",
    "  [3] Stop services                  [4] Check status",
    "  [5] Open dashboard                 [6] View logs",
    "  [7] Settings                       [8] Run doctor",
    "  [?] Help                           [0] Exit",
    "",
    notice ? `  ${notice}` : "  Select an option or type /help.",
    "",
  ].join("\n");
}

async function updateEnvFile(updates) {
  try {
    const envPath = getLocalPaths(process.cwd()).environment;
    let content = "";
    try {
      content = await readFile(envPath, "utf8");
    } catch {
      // File doesn't exist, will create
    }

    for (const [key, value] of Object.entries(updates)) {
      const regex = new RegExp(`^${key}=.*$`, "m");
      const line = `${key}=${value}`;
      if (regex.test(content)) {
        content = content.replace(regex, line);
      } else {
        content += `\n${line}`;
      }
    }

    await writeFile(envPath, content, "utf8");
  } catch (error) {
    // Silently fail if env file update fails
    console.error("Failed to update .env file:", error.message);
  }
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
        return initializeWorkspace(cli, config, ask);
      case "up": {
        const result = await cli.up();
        return `Services started at ${result.url}.`;
      }
      case "down":
        await cli.down();
        return config?.database.mode === "embedded"
          ? "Lightweight local services stopped. Your local research data was retained."
          : "Services stopped. Local PostgreSQL data was retained.";
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
      case "doctor":
        return await runDoctor(cli, output, ask);
      case "help":
        return "Use 1–8 for actions. Provider and AI are optional settings; API keys stay in .env.";
      default:
        return "Unknown option. Type ? for help or 0 to exit.";
    }
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
}

async function initializeWorkspace(cli, config, ask) {
  if (config) {
    return "Workspace is already initialized. Use Settings to update it.";
  }

  const initialConfig = await createInitialConfig(ask);
  await cli.init(initialConfig);
  return "Workspace initialized. Docker, paid providers, and AI remain optional.";
}

async function createInitialConfig(ask) {
  const providerChoice = await ask(
    "\n  Provider: [1] OpenStreetMap (default)  [2] Google Places  [3] Google Maps Scraper (free)\n  › ",
  );
  const aiChoice = await ask(
    "  Optional AI: [1] Disabled (default)  [2] Gemini  [3] Ollama  [4] OpenAI-compatible\n  › ",
  );
  const port = await ask("  Web port [3000]: ");

  return createTuiConfig({ aiChoice, port, providerChoice });
}

export function createTuiConfig({
  aiChoice = "",
  port = "",
  providerChoice = "",
}) {
  const config = structuredClone(defaultConfig);
  const providerMap = { 2: "google-places", 3: "google-maps-scraper" };
  config.provider = providerMap[providerChoice.trim()] ?? "openstreetmap";
  config.ai = aiConfiguration(aiChoice);

  if (port.trim()) {
    const parsedPort = Number(port);
    if (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
      throw new Error("Web port must be an integer between 1 and 65535.");
    }
    config.web.port = parsedPort;
  }

  return config;
}

async function updateSettings(cli, config, output, ask) {
  if (!config) {
    return "Initialize the workspace before changing settings.";
  }

  output.write(
    "\n  Settings: [1] Data provider  [2] Optional AI  [3] Runtime mode  [4] Web port  [5] Scraper proxy\n",
  );
  const category = await ask("  › ");
  const next = structuredClone(config);

  if (category === "1") {
    const selection = await ask(
      "  Provider: [1] OpenStreetMap  [2] Google Places  [3] Google Maps Scraper (free)\n  › ",
    );
    const providerMap = { 2: "google-places", 3: "google-maps-scraper" };
    next.provider = providerMap[selection.trim()] ?? "openstreetmap";
  } else if (category === "2") {
    const selection = await ask(
      "  Optional AI: [1] Disabled  [2] Gemini  [3] Ollama  [4] OpenAI-compatible\n  › ",
    );
    next.ai = aiConfiguration(selection);
  } else if (category === "3") {
    const selection = await ask(
      "  Runtime: [1] Lightweight local (default)  [2] Docker  [3] External PostgreSQL\n  › ",
    );
    next.database = {
      mode:
        selection === "2"
          ? "docker"
          : selection === "3"
            ? "external"
            : "embedded",
    };
  } else if (category === "4") {
    const port = await ask(`  Web port [${config.web.port}]: `);
    if (port.trim()) {
      const parsedPort = Number(port);
      if (
        !Number.isInteger(parsedPort) ||
        parsedPort < 1 ||
        parsedPort > 65535
      ) {
        return "Settings unchanged. Web port must be an integer between 1 and 65535.";
      }
      next.web.port = parsedPort;
    }
  } else if (category === "5") {
    return await updateScraperProxy(cli, config, output, ask);
  } else {
    return "Settings unchanged.";
  }

  await cli.config(next);
  if (next.database.mode === "external") {
    return "Settings saved. Set DATABASE_URL in .env before starting external PostgreSQL.";
  }
  return "Settings saved. Add optional API keys only to the local .env file.";
}

function aiConfiguration(selection) {
  const providerBySelection = {
    2: "gemini",
    3: "ollama",
    4: "openai-compatible",
  };
  const provider = providerBySelection[selection.trim()];
  return provider
    ? { enabled: true, provider }
    : { enabled: false, provider: null };
}

async function updateScraperProxy(cli, config, output, ask) {
  if (config?.provider !== "google-maps-scraper") {
    return "Proxy settings are only available for Google Maps Scraper provider. Change provider first.";
  }

  output.write(
    "\n  Scraper Proxy:\n" +
      "  [1] No proxy (direct connection)\n" +
      "  [2] Single proxy\n" +
      "  [3] Multiple proxies (rotation)\n",
  );
  const proxyChoice = await ask("  › ");

  if (proxyChoice === "1") {
    // Clear proxy settings
    await updateEnvFile({
      SCRAPER_PROXY_URL: "",
      SCRAPER_PROXY_LIST: "",
      SCRAPER_PROXY_ROTATION: "false",
    });
    return "Proxy disabled. Direct connection will be used.";
  }

  if (proxyChoice === "2") {
    const proxyUrl = await ask(
      "  Proxy URL (e.g., http://user:pass@host:port): ",
    );
    if (!proxyUrl.trim()) {
      return "No proxy URL provided. Settings unchanged.";
    }
    await updateEnvFile({
      SCRAPER_PROXY_URL: proxyUrl.trim(),
      SCRAPER_PROXY_LIST: "",
      SCRAPER_PROXY_ROTATION: "false",
    });
    return `Single proxy configured: ${proxyUrl.trim()}`;
  }

  if (proxyChoice === "3") {
    output.write("  Enter proxies separated by commas:\n");
    const proxyList = await ask("  Proxies: ");
    if (!proxyList.trim()) {
      return "No proxies provided. Settings unchanged.";
    }
    await updateEnvFile({
      SCRAPER_PROXY_URL: "",
      SCRAPER_PROXY_LIST: proxyList.trim(),
      SCRAPER_PROXY_ROTATION: "true",
    });
    return `Proxy rotation enabled with ${proxyList.trim().split(",").length} proxies.`;
  }

  return "Proxy settings unchanged.";
}

async function runDoctor(cli, output, ask) {
  const result = await cli.doctor();
  output.write(
    [
      "\n  MarketLens Doctor",
      `  Node.js    ${result.nodeVersion}`,
      `  Config     ${result.config ? "READY" : "MISSING"}`,
      `  Docker     ${result.dockerAvailable ? "READY" : "MISSING"}`,
      `  Compose    ${result.composeAvailable ? "READY" : "MISSING"}`,
      result.embedded
        ? `  Embedded  ${result.embedded.running ? "RUNNING" : "READY"}`
        : null,
      `  Web port   ${result.portAvailable ? "AVAILABLE" : "IN USE OR UNCONFIGURED"}`,
      "",
    ]
      .filter(Boolean)
      .join("\n"),
  );
  await ask("  Press Enter to continue: ");
  return "Doctor completed.";
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
