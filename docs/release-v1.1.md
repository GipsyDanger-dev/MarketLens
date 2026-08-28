# MarketLens v1.1.0 — Local-First Runtime

MarketLens v1.1.0 makes the self-hosted workflow a first-class product surface.
The existing research, analytics, AI, export, and reporting features now have a
non-interactive local lifecycle command designed for contributors and local
operators.

## Highlights

- `marketlens init` creates local configuration, local data/log directories,
  and a random PostgreSQL password in git-ignored `.env`.
- `marketlens up`, `down`, `status`, `open`, `doctor`, and `logs` manage and
  diagnose the Docker Compose runtime.
- OpenStreetMap/Overpass remains the no-key default; AI stays disabled by
  default.
- Default Docker port mappings bind only to localhost. The web port can be
  configured, and Docker-managed PostgreSQL can be replaced with an external
  `DATABASE_URL`.
- The CLI package has a verified npm tarball, README, executable metadata, and
  publish instructions for the unscoped `marketlens` package name.

## Verification

- CLI unit tests cover local initialization, generated password handling,
  configuration preservation, external database validation, and command
  parsing.
- The npm package tarball was smoke-tested with `npx` before release.
- Repository linting, type checking, unit tests, production build, and Docker
  Compose CI pass on the release branch.

## npm publication

The CLI is published as
[`@gipsydanger-dev/marketlens@1.1.2`](https://www.npmjs.com/package/@gipsydanger-dev/marketlens).
Use `npx --yes @gipsydanger-dev/marketlens init` from the target local
installation directory. The package is public, while npm publishing remains
restricted to the `gipsydanger-dev` scope.
