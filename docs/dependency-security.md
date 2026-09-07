# Dependency security maintenance

The root lockfile includes the web runtime, CLI, and database tooling. Run
`npm audit --audit-level=high` from the repository root before a release; the
standalone CLI package has no npm runtime dependencies, but installs the web
runtime's locked dependencies on first use.

## September 2026 remediation

Two scoped overrides retain Prisma 7.9.1 while updating affected transitive
dependencies:

- `@prisma/config > deepmerge-ts`: 8.0.2 resolves recursive merge stack exhaustion
  ([advisory](https://github.com/advisories/GHSA-ggr8-5vv4-36mx)).
- `prisma > mysql2`: 3.24.3 resolves the authentication downgrade and compressed
  protocol denial of service findings
  ([authentication advisory](https://github.com/advisories/GHSA-3f6p-5ww8-9rcr),
  [compression advisory](https://github.com/advisories/GHSA-rgwj-5xj2-c3m3)).

Prisma config uses `deepmerge` to merge trusted local configuration. The
[v8 changes](https://github.com/RebeccaStevens/deepmerge-ts/releases/tag/v8.0.0)
include deep merging Map values and circular-reference handling. This project's
Prisma configuration uses plain objects, not Maps or the changed type helpers.
Schema validation and client generation pass with the override. Database
integration tests and production builds remain required compatibility gates.

The application uses PostgreSQL/PGlite, not a MySQL connection. The vulnerable
MySQL dependency was still removed from the installed dependency graph rather
than exempted from audit. `npm audit` reports zero findings after remediation.

Revisit these overrides when Prisma updates its own dependency constraints.
Do not remove them until a clean `npm ci`, audit, schema validation, client
generation, database integration tests, and build pass without them. Avoid
`npm audit fix --force` as an unattended release step: its proposed downgrade
crosses the Prisma major-version boundary.
