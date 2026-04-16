# Testing Guide

The test strategy is split into three layers:

- Unit tests for backend services and frontend components.
- Integration tests for authenticated API flows and business rules.
- End-to-end browser tests for the installable web app shell and key journeys.

## Commands

- `npm run test:unit`
- `npm run test:integration`
- `npm run test:e2e`
- `npm run test`

`apps/web/scripts/e2e.mjs` can also target an already-running production server by setting `E2E_BASE_URL`, which is useful in constrained local environments.

## Coverage Focus

- Registration, login, refresh, and protected-route behavior.
- Matching logic and search aggregation.
- Project task lifecycle and study group collaboration flows.
- Dashboard and authentication page rendering.
- PWA manifest availability and installable shell behavior.
