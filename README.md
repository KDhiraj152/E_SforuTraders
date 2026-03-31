# E_SforuTraders

Invoice management platform with a Spring Boot backend and React frontend.

## Why this project exists

This started as a personal project and is now maintained as a public-ready codebase so anyone can run it, evaluate it, and contribute improvements.

## Documentation

All project documents are now consolidated under [docs/](docs/README.md).

- [Documentation index](docs/README.md)
- [Project map](docs/project-map.md)
- [Getting started](docs/getting-started.md)
- [Development guide](docs/development-guide.md)
- [Deployment guide](docs/deployment-guide.md)
- [Production readiness checklist](docs/production-readiness-checklist.md)
- [Architecture and refactor summary](docs/architecture-refactor-summary.md)
- [Frontend guide](docs/frontend-guide.md)
- [Release guide](docs/release-guide.md)

## Community and project standards

- [Contributing guide](CONTRIBUTING.md)
- [Code of conduct](CODE_OF_CONDUCT.md)
- [Security policy](SECURITY.md)
- [License](LICENSE)

## Quick run

```bash
# terminal 1
docker-compose up -d postgres

# terminal 2
cd invoice-backend && ./mvnw spring-boot:run

# terminal 3
cd invoice-frontend && npm install && npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:8080/api`

## One-command bootstrap

For first-time setup, you can initialize local prerequisites, local env files, backend compile, frontend dependencies, and local postgres with one command:

```bash
bash scripts/bootstrap.sh
```

## Versioning and releases

This repository uses Semantic Versioning and a changelog-based release flow.

- Changelog: [CHANGELOG.md](CHANGELOG.md)
- Release process: [docs/release-guide.md](docs/release-guide.md)
- Automated release PR/tag workflow: [.github/workflows/release.yml](.github/workflows/release.yml)

## Dependency and security automation

- Dependency update automation: [.github/dependabot.yml](.github/dependabot.yml)
- Security scanning workflow: [.github/workflows/security.yml](.github/workflows/security.yml)

---

Edited by K Dhiraj ([k.dhiraj.srihari@gmail.com](mailto:k.dhiraj.srihari@gmail.com))  
GitHub: KDhiraj152
