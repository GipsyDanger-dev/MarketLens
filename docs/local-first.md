# Local-first CLI

MarketLens can run as a local, self-hosted application with Docker Desktop and
no paid data or AI provider. The default data source is OpenStreetMap/Overpass;
AI is disabled until explicitly configured.

## Start a local installation

After the `marketlens` package is available from npm, run this from an empty
working directory:

```bash
npx @gipsydanger-dev/marketlens init
npx @gipsydanger-dev/marketlens up
```

`init` creates `.marketlens/config.json`, `.marketlens/data`,
`.marketlens/logs`, and a git-ignored `.env`. The generated `.env` includes a
random local PostgreSQL password and contains placeholders only for optional
provider and AI credentials. `up` starts PostgreSQL and the web app, runs Prisma
migrations, and prints the local dashboard address.

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
```

`down` stops containers without deleting the PostgreSQL volume. `doctor` checks
the local configuration, Docker Compose availability, runtime files, and web
port. `logs` prints the latest container output. The CLI is non-interactive so
it can be used in local scripts.

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
