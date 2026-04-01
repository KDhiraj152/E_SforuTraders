# Getting started

This guide gets the full stack running locally with the fewest moving parts.

Recommended workflow:

```bash
./setup.sh
./start.sh
```

Quality checks:

```bash
cd invoice-frontend && npm run lint && npm run test
cd ../invoice-backend && ./mvnw test
```

Stop services:

```bash
./stop.sh
./stop.sh --all
```

Manual fallback flow (if you do not use root scripts) is documented below.

## Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 18+
- Docker Desktop (recommended)

## 1. Configure environment

At repository root, create `.env.local`:

```bash
DB_NAME=invoice_db
DB_USERNAME=postgres
DB_PASSWORD=postgres
JWT_SECRET=replace-with-32-byte-secret
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
ACTIVE_PROFILE=dev
```

Use a strong JWT secret:

```bash
openssl rand -base64 32
```

## 2. Start database

```bash
docker compose --env-file .env.local up -d postgres
```

## 3. Start backend

```bash
cd invoice-backend
./mvnw clean install -DskipTests
./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

Backend endpoints:

- API: `http://localhost:8080/api`
- Swagger: `http://localhost:8080/swagger-ui.html`
- Health: `http://localhost:8080/api/auth/health`

## 4. Start frontend

```bash
cd invoice-frontend
npm install
npm run dev
```

Frontend URL:

- App: `http://localhost:5173`

## 5. Quick verification

```bash
curl http://localhost:8080/api/auth/health
```

You should get a healthy response from the backend.

## Troubleshooting

- If port 8080 is busy: `lsof -i :8080`
- If DB fails to connect: `docker compose --env-file .env.local logs postgres`
- If frontend cannot reach backend: check `VITE_API_URL` in frontend env
- Script compatibility fallbacks now supported:
	- `setup.sh`, `start.sh`, and `stop.sh` use `docker compose` and fall back to `docker-compose` automatically.
	- Port detection uses `lsof` and falls back to `ss` or `netstat` if needed.
	- Readiness checks use `curl` and fall back to `wget`; if neither exists, scripts use port-open checks.

## Next steps

- Continue with [Development guide](./development-guide.md)
- For production setup, see [Deployment guide](./deployment-guide.md)
- For release flow, see [Release guide](./release-guide.md)

---

Edited by K Dhiraj  
([k.dhiraj.srihari@gmail.com](mailto:k.dhiraj.srihari@gmail.com))  
GitHub: KDhiraj152
