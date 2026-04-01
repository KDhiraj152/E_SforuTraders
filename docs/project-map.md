# Project map

If you are new to this repository, start here.

## Documentation map

- [Getting started](./getting-started.md): local setup and first run
- [Development guide](./development-guide.md): day-to-day coding workflow
- [Deployment guide](./deployment-guide.md): Docker and production rollout
- [Production readiness checklist](./production-readiness-checklist.md): launch gate
- [Architecture and refactor summary](./architecture-refactor-summary.md): what changed and why
- [Frontend guide](./frontend-guide.md): frontend runtime and conventions
- [Release guide](./release-guide.md): versioning and changelog workflow
- [Codebase audit (2026-04)](./codebase-audit-2026-04.md): current verified quality state

## Repository structure

```text
E_SforuTraders/
  docs/
  invoice-backend/
  invoice-frontend/
  docker-compose.yml
  README.md
```

## Backend structure

```text
invoice-backend/src/main/java/com/sfourtraders/
  api/               REST controllers, DTOs, API exception handlers
  config/            security, JWT, app-level config
  domain/            business rules and domain services
  infrastructure/    cross-cutting infra (logging, security adapters)
  model/             JPA entities
  repository/        data access interfaces
  service/           application services
  shared/            shared exception types and common utilities
```

## Frontend structure

```text
invoice-frontend/src/
  api/               axios client and API wrappers
  components/        reusable UI pieces
  contexts/          React context providers
  pages/             route-level page components
  App.jsx            app composition
  main.jsx           bootstrap
```

## Practical entry points

- Setup script: `setup.sh`
- Start script: `start.sh`
- Stop script: `stop.sh`
- Backend app start: `invoice-backend/src/main/java/com/sfourtraders/InvoiceBackendApplication.java`
- Backend auth config: `invoice-backend/src/main/java/com/sfourtraders/config/SecurityConfig.java`
- Frontend app shell: `invoice-frontend/src/App.jsx`
- Frontend API client: `invoice-frontend/src/api/client.js`

---

Edited by K Dhiraj ([k.dhiraj.srihari@gmail.com](mailto:k.dhiraj.srihari@gmail.com))  
GitHub: KDhiraj152
