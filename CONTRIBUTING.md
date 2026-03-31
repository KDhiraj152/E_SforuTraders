# Contributing guide

Thanks for considering a contribution.
This project is open to bug fixes, feature improvements, refactors,
tests, and documentation updates.

## Before you start

1. Read [docs/getting-started.md](docs/getting-started.md).
2. Check existing issues to avoid duplicate work.
3. For larger changes, open an issue first so we can align on scope.

## Local setup

1. Backend:
   - `cd invoice-backend`
   - `./mvnw spring-boot:run`
2. Frontend:
   - `cd invoice-frontend`
   - `npm install`
   - `npm run dev`

## Branch naming

Use descriptive branch names:
- `feat/<short-description>`
- `fix/<short-description>`
- `docs/<short-description>`
- `chore/<short-description>`

## Commit style

Use clear commit messages:
- `feat: add invoice search filters`
- `fix: handle null customer email in response`
- `docs: clarify docker startup sequence`

For release automation, follow Conventional Commits:
- `feat:` triggers a minor release
- `fix:` triggers a patch release
- `feat!:` or `BREAKING CHANGE:` triggers a major release

See [docs/release-guide.md](docs/release-guide.md) for the full release process.

## Pull request checklist

- [ ] The change is focused and scoped.
- [ ] I ran backend tests (`./mvnw test`) in `invoice-backend`.
- [ ] I ran frontend lint/build (`npm run lint && npm run build`) in `invoice-frontend`.
- [ ] I updated docs when behavior changed.
- [ ] I added or updated tests where reasonable.

## Coding expectations

- Keep API contracts backward compatible where possible.
- Avoid hard-coded secrets; use environment variables.
- Prefer small, reviewable pull requests.
- Write code that is easy to debug and maintain.

## Reporting bugs

When opening a bug report, include:
- Expected vs actual behavior
- Steps to reproduce
- Environment details (OS, Java version, Node version)
- Logs or screenshots if available

## Suggesting features

Open a feature request with:
- The problem statement
- Proposed solution
- Alternatives considered
- Impact on existing behavior

---

Edited by K Dhiraj ([k.dhiraj.srihari@gmail.com](mailto:k.dhiraj.srihari@gmail.com))
GitHub: KDhiraj152
