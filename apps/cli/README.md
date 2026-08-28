# MarketLens CLI

The MarketLens CLI creates and runs a secure local MarketLens installation.
It requires Node.js 22+ and Docker Desktop with Docker Compose.

```bash
npx @gipsydanger-dev/marketlens init
npx @gipsydanger-dev/marketlens up
```

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
