# Security policy

## Supported versions

Security fixes are applied to the latest version on the `main` branch while the
project is in pre-1.0 development.

## Reporting a vulnerability

Do not open a public GitHub issue for suspected vulnerabilities or accidentally
exposed credentials. Use GitHub's private vulnerability reporting feature for
this repository. Include affected versions, reproduction steps, impact, and any
suggested mitigation.

Maintainers will acknowledge valid reports, assess impact, and coordinate a fix
before public disclosure. Please do not access, modify, or exfiltrate data that
does not belong to you while researching an issue.

## Security expectations

- API keys and secrets remain server-side.
- Provider adapters must not bypass CAPTCHAs, authentication, or anti-bot
  protections.
- Provider configuration must be validated and must not permit arbitrary code
  execution.
- New external integrations must document authentication, retention,
  attribution, and terms-of-service constraints.
