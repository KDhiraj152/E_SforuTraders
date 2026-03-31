# Development guide

This document covers local workflow, coding expectations, and common tasks.

## Local workflow

```bash
# backend
cd invoice-backend
./mvnw spring-boot:run

# frontend
cd invoice-frontend
npm run dev
```

## Backend conventions

- Keep controllers thin.
- Put business rules in domain or service classes.
- Use DTOs for request/response boundaries.
- Throw typed exceptions and let global handlers format API errors.
- Keep repository methods focused and explicit.

## Frontend conventions

- Keep API calls inside `src/api/client.js` wrappers.
- Use context providers for shared app state.
- Keep route-level logic in `src/pages` and shared UI in `src/components`.
- Handle API failures visibly, not silently.

## Branch and commit model

```bash
git checkout -b feature/<short-name>
```

Commit style:

```text
feat(auth): add token refresh endpoint
fix(invoice): handle null tax rates in totals
docs(docs): update deployment notes for compose
```

## Backend testing

```bash
cd invoice-backend
./mvnw test
./mvnw test -Dtest=InvoiceServiceTest
```

## Frontend quality checks

```bash
cd invoice-frontend
npm run lint
npm run build
```

## API test flow

1. Login with `/api/auth/login`.
2. Reuse bearer token for invoice endpoints.
3. Validate pagination and edge cases.
4. Validate error responses for malformed payloads.

## Common development tasks

- Add endpoint:
1. Create request/response DTOs.
2. Add service logic and validations.
3. Add controller route.
4. Add tests.

- Add frontend feature:
1. Add API wrapper call.
2. Add or adjust context state only if shared.
3. Implement page or component UI.
4. Validate loading and error states.

---

Edited by K Dhiraj ([k.dhiraj.srihari@gmail.com](mailto:k.dhiraj.srihari@gmail.com))  
GitHub: KDhiraj152
