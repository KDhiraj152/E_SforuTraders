# Architecture and refactor summary

This project started as a functional prototype and moved toward a production setup with stricter boundaries and safer defaults.

## Security hardening

- Credentials moved out of source into environment configuration.
- JWT handling centralized with explicit config.
- Password hashing standardized with BCrypt.
- CORS moved to controlled allow-lists.

## API boundary cleanup

- Request and response DTO usage expanded.
- Validation moved to API edge with typed responses.
- Error handling centralized through a global exception handler.

## Domain and service cleanup

- Invoice calculation logic moved into dedicated domain services.
- Controller responsibilities trimmed to routing and input or output concerns.
- Repository access kept in service layer, not controllers.

## Frontend improvements

- Authentication state managed with context.
- API communication centralized through a single client wrapper.
- Reusable error and loading components added for consistency.

## Deployment and docs

- Multi-stage Dockerfiles used for smaller runtime images.
- Compose flow documented for local multi-service runs.
- Documentation consolidated under `docs/` with consistent naming.

## Why this matters

This setup does not magically remove all risk, but it does make the codebase easier to maintain, safer to deploy, and simpler to reason about when debugging production issues.

---

Edited by K Dhiraj ([k.dhiraj.srihari@gmail.com](mailto:k.dhiraj.srihari@gmail.com))  
GitHub: KDhiraj152
