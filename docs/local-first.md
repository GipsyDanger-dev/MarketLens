# Local-first CLI

MarketLens can run as a local, self-hosted application with no paid data or AI
provider. The default **Lightweight local** runtime is managed by the terminal
UI and does not require Docker Desktop. It uses embedded PostgreSQL-compatible
storage; the default data source is OpenStreetMap/Overpass and AI is disabled
until explicitly configured.

## Start a local installation

After the `marketlens` package is available from npm, run this from the
directory where you want to keep local MarketLens data:

```bash
npx @gipsydanger-dev/marketlens
```

Choose **Initialize local workspace**, then **Start services**. The TUI creates
`.marketlens/config.json`, `.marketlens/data`, `.marketlens/logs`, and a
git-ignored `.env`. It starts the embedded database, runs Prisma migrations,
builds the web app, and prints the local dashboard address. Provider and AI
credentials remain optional.

## Interactive terminal UI

For a Codex-style terminal application with a keyboard menu, install the CLI
globally and run it without a command:

```bash
npm install --global @gipsydanger-dev/marketlens
marketlens
```

The TUI can also be opened explicitly with `marketlens tui`. It is an
operations dashboard—not a conversational AI interface—and exposes a first-run
wizard, start/stop, status, browser open, logs, diagnostics, and settings. The
wizard can set the data provider, optional AI integration, and local web port;
Settings can subsequently change provider, AI, database mode, or web port.
OpenStreetMap works without a key, while Google Places and AI integrations only
need credentials if you opt in. Keep those credentials server-side in the
generated local `.env`; the TUI never asks for or displays API keys. Docker and
external PostgreSQL are available only as Advanced runtime choices in Settings.

Use a source checkout before the npm package is published:

```bash
git clone https://github.com/GipsyDanger-dev/MarketLens.git
cd MarketLens
npm install
node apps/cli/src/index.js init
node apps/cli/src/index.js up
```

The default dashboard address is `http://localhost:3000`. Both the web and
PostgreSQL ports are bound to `localhost`; do not change them to a public bind
without configuring authentication, TLS, and a reverse proxy.

## Commands

```text
marketlens init [--port <number>] [--provider <openstreetmap|google-places>] [--ai <disabled|gemini|ollama|openai-compatible>]
marketlens up | down | status | open | doctor | logs
marketlens config [provider|ai|database|port] [value]
marketlens tui
```

`down` stops containers without deleting the PostgreSQL volume. `doctor` checks
the local configuration, Docker Compose availability, runtime files, and web
port. `logs` prints the latest container output. Direct commands remain
non-interactive for use in local scripts; the optional `tui` command is intended
for a person operating the local installation.

## Configuration examples

Change the local port:

```bash
marketlens config port 3010
marketlens up
```

Use Google Places only after placing an approved server-side API key in `.env`:

```bash
marketlens config provider google-places
# edit .env and set GOOGLE_MAPS_API_KEY
marketlens up
```

AI remains opt-in. Configure a supported provider and add its secret to `.env`;
the rest of MarketLens continues working if AI is unavailable.

## External PostgreSQL

To use your own PostgreSQL database, set a valid connection URL in the local
`.env` and then switch the runtime mode:

```bash
marketlens config database external
# edit .env and replace DATABASE_URL with your PostgreSQL URL
marketlens up
```

The external override prevents the CLI from starting the bundled PostgreSQL
service. MarketLens checks that `DATABASE_URL` is not the placeholder before it
starts. Treat the file as a secret: it is ignored by Git and must not be copied
into browser-visible environment variables.

## Offline and provider boundaries

Configuration, stored research, deterministic analytics, reports, and exports
work entirely on the local stack. Place collection requires the selected data
provider; the bundled OpenStreetMap provider uses the configured Overpass API.
Use a local or self-hosted compatible provider endpoint when a fully offline
collection workflow is required.
