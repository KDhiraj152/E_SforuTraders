# Release guide

This repository uses Semantic Versioning and a changelog-first release process.

## Versioning rules

- Major: backward-incompatible API or behavior changes
- Minor: backward-compatible feature additions
- Patch: backward-compatible fixes

Version format:

- `MAJOR.MINOR.PATCH` for stable releases
- `-SNAPSHOT` can be used during local development where needed

## Commit conventions

Release automation reads commit messages.

- `feat:` -> minor bump
- `fix:` -> patch bump
- `feat!:` or `BREAKING CHANGE:` -> major bump
- `docs:`, `chore:`, `refactor:`, `test:` -> included in release PR notes when relevant

## Changelog process

- Source of truth: [../CHANGELOG.md](../CHANGELOG.md)
- Keep unreleased work under the `Unreleased` section
- Move items into a version section during release PR merge

## Automated release flow

Workflow: [../.github/workflows/release.yml](../.github/workflows/release.yml)

1. Changes are merged into `main`.
2. Release automation opens or updates a release PR.
3. The release PR updates:
   - `CHANGELOG.md`
   - `.release-please-manifest.json`
4. Merging the release PR creates a Git tag and GitHub Release.

## Maintainer checklist

Before merging a release PR:

- [ ] CI is green
- [ ] Changelog entries are clear and user-facing
- [ ] Breaking changes are called out explicitly
- [ ] Migration notes are included when needed

After release:

- [ ] Confirm tag exists in GitHub Releases
- [ ] Spot-check deployment path if this release is going live
- [ ] Announce key changes in the project README or discussion thread

---

Edited by K Dhiraj (k.dhiraj.srihari@gmail.com)
GitHub: KDhiraj152
