# MarketLens CLI

The MarketLens CLI creates and runs a secure local MarketLens installation.
It requires Node.js 22+. Docker Desktop is optional and only used when you
select the advanced Docker runtime.

```bash
npx @gipsydanger-dev/marketlens
```

## Interactive terminal dashboard

Install the CLI globally, then run `marketlens` without a subcommand to open
the keyboard-driven terminal UI:

```bash
npm install --global @gipsydanger-dev/marketlens
marketlens
```

The TUI is an operations menu, not an AI chat. Its default **Lightweight local**
mode manages an embedded PostgreSQL-compatible database and the web app without
Docker. It provides local initialization, service controls, status, logs, and
settings for the provider, optional AI, and runtime. OpenStreetMap is available
with no credentials. Google Places and Gemini remain opt-in; add their
server-side keys directly to the generated local `.env` file. Use
`marketlens tui` to explicitly open the same interface.

The CLI writes its configuration and generated local PostgreSQL password to the
current working directory. It binds services to localhost and does not enable
AI or paid providers by default.

See the [local-first guide](https://github.com/GipsyDanger-dev/MarketLens/blob/main/docs/local-first.md)
for configuration, external PostgreSQL, and operational commands.

## Publishing

This package is published from `apps/cli` as `@gipsydanger-dev/marketlens`.
Validate it before publishing with:

```bash
npm pack --dry-run --workspace=@gipsydanger-dev/marketlens
npm publish --workspace=@gipsydanger-dev/marketlens
```

Publishing requires an npm account authorized for the `gipsydanger-dev` scope.
