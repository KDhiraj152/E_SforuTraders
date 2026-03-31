# Getting started

This guide gets the full stack running locally with the fewest moving parts.

If you want the fastest setup path, run:

```bash
bash scripts/bootstrap.sh
```

Then continue from "3. Start backend".

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
docker-compose up -d postgres
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
- If DB fails to connect: `docker-compose logs postgres`
- If frontend cannot reach backend: check `VITE_API_URL` in frontend env

## Next steps

- Continue with [Development guide](./development-guide.md)
- For production setup, see [Deployment guide](./deployment-guide.md)
- For release flow, see [Release guide](./release-guide.md)

---

Edited by K Dhiraj  
([k.dhiraj.srihari@gmail.com](mailto:k.dhiraj.srihari@gmail.com))  
GitHub: KDhiraj152
