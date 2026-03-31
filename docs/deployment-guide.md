# Deployment guide

This guide covers local container deployment and a production baseline.

## Docker Compose (recommended)

From repository root:

```bash
docker-compose up --build
```

Services:

- Postgres: `localhost:5432`
- Backend: `localhost:8080`
- Frontend (Nginx): `localhost`

## Build images manually

```bash
# backend
docker build -f invoice-backend/Dockerfile -t invoice-backend:1.0.0 .

# frontend
docker build -f invoice-frontend/Dockerfile -t invoice-frontend:1.0.0 .
```

## Production environment requirements

Set these at deployment time (not in git):

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `ALLOWED_ORIGINS`
- `SPRING_PROFILES_ACTIVE=prod`

## Production rollout checklist

1. Build and push tagged images.
2. Inject secrets via secret manager.
3. Run DB migration and verify schema.
4. Start backend and confirm `/api/auth/health`.
5. Route frontend traffic through TLS.
6. Confirm CORS only allows known origins.
7. Run smoke tests (auth, create invoice, list invoice, export).

## Rollback plan

- Keep previous stable image tags.
- Roll back backend and frontend independently.
- Restore DB from last known good backup only when data integrity requires it.

## Monitoring baseline

- Backend health checks
- Container restart alerts
- API error rate
- Latency on login and invoice list endpoints

---

Edited by K Dhiraj ([k.dhiraj.srihari@gmail.com](mailto:k.dhiraj.srihari@gmail.com))  
GitHub: KDhiraj152
