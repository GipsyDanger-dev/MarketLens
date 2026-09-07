# Contributing to MarketLens

Thanks for helping build a provider-agnostic local business intelligence
platform.

## Before you start

1. Read the [architecture](docs/architecture.md), [roadmap](docs/roadmap.md), and
   [known limitations](docs/known-limitations.md).
2. Open an issue before starting substantial work so maintainers and
   contributors can align on scope.
3. Follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Local setup

```bash
copy .env.example .env
npm ci
docker compose up -d postgres
npm run db:migrate
npm run dev
```

Run the required checks before opening a pull request:

```bash
npm run format
npm run release:check
npm audit --audit-level=high
npm run lint
npm run typecheck
npm run test
npm run build
```

## Contribution standards

- Keep one logical task in each commit and use Conventional Commits.
- Push after at most three changed files before continuing to another task.
- Add or update tests for core business logic.
- Keep deterministic calculations out of LLM prompts and implementations.
- Never expose secrets, provider keys, or raw credentials in source, tests,
  screenshots, or issue reports.
- Update user or provider documentation whenever public behavior changes.

## Provider adapters

Providers must implement the shared SDK contract and keep provider-specific
mapping, attribution, rate-limit handling, and terms within the adapter layer.
Do not make core analytics depend on a provider implementation. New adapters
must document their capabilities, error behavior, pagination, attribution, and
data-use constraints.

## Pull requests

Use the pull request template, explain the user-facing impact, and include
validation evidence. Small focused pull requests are easier to review and
release.
