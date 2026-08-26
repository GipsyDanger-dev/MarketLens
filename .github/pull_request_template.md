## Summary

Describe the user-facing outcome and the approach taken.

## Validation

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test`
- [ ] `npm run build`
- [ ] Documentation updated where relevant

## Provider and data considerations

Complete when this PR changes a provider adapter or its data handling.

- [ ] Capabilities declared or updated
- [ ] Error, rate-limit, pagination, and attribution behavior covered
- [ ] Provider-specific fields do not leak into domain analytics
- [ ] Terms, retention, and attribution requirements documented

## Checklist

- [ ] The change is focused and uses a Conventional Commit message.
- [ ] No secrets, API keys, or sensitive provider payloads are included.
- [ ] Core analytics remain deterministic and usable with AI disabled.
