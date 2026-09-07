# MarketLens 1.3.2 release candidate

This candidate addresses the September 7 release audit. It is prepared for
publication after all required CI jobs pass. Preparing a Git commit or tag does
not publish an npm version; the existing npm `latest` remains unchanged until
the maintainer publishes.

## Verification

Use Node.js 24+, npm 11+, and Git. Required checks:

```bash
npm ci
npm run db:validate
npm run db:generate
npm run format
npm run release:check
npm audit --audit-level=high
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e --workspace=@marketlens/web
npm run test:release
```

CI additionally runs the PostgreSQL integration tests in Docker and the tarball
smoke test on Windows and Linux. `test:release` creates an isolated temporary
installation from a tarball and the checked-out Git commit, not the developer's
untracked files or database. It verifies a real embedded database and HTTP
pipeline against a controlled Overpass fixture, plus CSV, JSON, PDF, restart
and data retention. Its output identifies retained temporary artifacts.

Live third-party availability is not simulated by that check. Public Overpass
can time out; Google browser collection is experimental and must not be
represented as a guaranteed full Google Maps dataset. Optional paid Google
Places/Gemini calls require the operator's own credentials. See
[known limitations](known-limitations.md) and
[dependency remediation](dependency-security.md).

## Publish after green checks

Review the commit referenced by the candidate tag and the package contents:

```bash
npm pack --dry-run --workspace=@gipsydanger-dev/marketlens
npm whoami
npm publish --workspace=@gipsydanger-dev/marketlens --access=public
npm view @gipsydanger-dev/marketlens dist-tags version
```

Publishing requires an authorized npm account and its configured authentication
flow. Never paste a token or one-time code into an issue, commit, or chat.
Do not reuse a published version number. Verify `latest` is `1.3.2` before
announcing that users can install it.

## Upgrade an installation after publication

```bash
npm install --global @gipsydanger-dev/marketlens@latest
marketlens down
marketlens update
marketlens up
```

Take a database backup before production upgrades. The CLI package and cloned
web runtime are separate: npm updates the command/TUI; `marketlens update`
fast-forwards the managed runtime. Startup applies migrations, refreshes locked
dependencies when needed and rebuilds. Source checkouts use Git directly.

Existing projects with oversized limits remain readable; each subsequent run
uses the operator cap. No existing research is removed by the limit change.
