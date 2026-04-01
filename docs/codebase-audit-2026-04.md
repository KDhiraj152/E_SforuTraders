# Codebase audit (2026-04)

This audit is evidence-based and reflects repository state verified on 2026-04-01.

## Executive verdict

Classification: Needs Improvement.

The repository is buildable and has improved operational scripts, but it is not yet production-grade across all quality gates because frontend lint quality is currently red, automated tests are still backend-heavy with no frontend tests, and a few reliability/security hardening items remain policy-level rather than enforced by tests.

## Verified strengths

- Local lifecycle scripts are available and now support deterministic setup/start/stop flow.
- Backend tests are passing (`./mvnw test`), including invoice number collision retry tests.
- Frontend production build is passing (`npm run build`).
- Security and dependency automation files exist:
  - `.github/workflows/security.yml`
  - `.github/dependabot.yml`

## Critical issues

No currently verified critical correctness/security outages were found in the latest scan.

## Major issues

1. Frontend lint gate is failing.
- Evidence: `npm run lint` fails with 8 errors (Fast Refresh rule violations, no-unused-vars, and vite config no-undef issue).
- Impact: CI quality signal is reduced; regressions can pass without consistent style/static guarantees.

2. Frontend automated tests are missing.
- Evidence: frontend package scripts include `dev`, `build`, `lint`, but no test script.
- Impact: UI/API integration regressions are likely to be caught late.

3. Script portability still depends on host tools.
- Evidence: lifecycle scripts require `lsof`, `curl`, `docker`, and compose plugin availability.
- Impact: setup/start/stop remains host-dependent without fallback alternatives.

## Minor issues

1. Documentation still has mixed command style and local-vs-production nuance in some pages.
- Updated in this cycle for main setup/development/deployment pages.

2. Frontend lint issues include unused imports/variables in pages, indicating maintainability debt.

## Validation evidence

Commands executed during this audit:

- `bash -n setup.sh && bash -n start.sh && bash -n stop.sh` (syntax pass)
- `./stop.sh -h` (argument parsing pass)
- `cd invoice-backend && ./mvnw test` (pass)
- `cd invoice-frontend && npm run build` (pass)
- `cd invoice-frontend && npm run lint` (fail, tracked as major issue)

## Remediation roadmap

1. Fix frontend lint baseline to green and enforce in CI.
2. Add frontend tests for login, invoice list, create/update, export workflows.
3. Add cross-platform fallbacks for script process/port detection where possible.
4. Add an end-to-end smoke test job in CI for auth + invoice workflow.

## Files touched in this audit cycle

- `setup.sh`
- `start.sh`
- `stop.sh`
- `README.md`
- `docs/README.md`
- `docs/project-map.md`
- `docs/getting-started.md`
- `docs/development-guide.md`
- `docs/deployment-guide.md`
- `docs/production-readiness-checklist.md`
- `docs/architecture-refactor-summary.md`
- `docs/codebase-audit-2026-04.md`
