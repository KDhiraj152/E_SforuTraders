# Quick Start Guide - Invoice Management System

**Version**: 1.0.0  
**Last Updated**: March 31, 2026

---

## ⚡ 5-Minute Setup

### Terminal Window 1: Start Database
```bash
cd /Users/kdhiraj/Downloads/E_SforuTraders

# Create .env.local (if not exists)
cat > .env.local << 'EOF'
DB_NAME=invoice_db
DB_USERNAME=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key-min-32-chars-base64-encoded-1234567890
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
ACTIVE_PROFILE=dev
EOF

# Start PostgreSQL with Docker
docker-compose up -d postgres
```

### Terminal Window 2: Start Backend
```bash
cd invoice-backend

# Setup (first time only)
./mvnw clean install -DskipTests

# Run
./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"

# Should see: "Started InvoiceBackendApplication in X.XXX seconds"
```

### Terminal Window 3: Start Frontend
```bash
cd invoice-frontend

# Setup (first time only)
npm install

# Run
npm run dev

# Visit: http://localhost:5173
```

### Verify Setup
```bash
# Health check
curl http://localhost:8080/api/auth/health

# Swagger UI
open http://localhost:8080/swagger-ui.html

# Frontend
open http://localhost:5173
```

---

## 🔑 Default Credentials (Development Only)

```
Username: admin
Password: sfour2024
```

⚠️ **CHANGE IN PRODUCTION** - Set via environment variables

---

## 📁 Key Files Reference

| File | Purpose |
|------|---------|
| `pom.xml` | Maven dependencies & build |
| `.env.local` | Development secrets |
| `application-dev.properties` | Dev configuration |
| `docker-compose.yml` | Local services |
| `DEPLOYMENT.md` | Production deployment |
| `README.md` | Full documentation |

---

## 🐛 Common Issues & Fixes

### Issue: PostgreSQL connection failed
```bash
# Check if running
docker-compose ps

# Start database
docker-compose up -d postgres

# Check logs
docker-compose logs postgres
```

### Issue: Port 8080 already in use
```bash
# Find process using port
lsof -i :8080

# Kill process or change port in application-dev.properties
server.port=8081
```

### Issue: Frontend can't reach API
```bash
# Check .env.local has correct backend URL
cat .env.local | grep VITE_API

# Should be: http://localhost:8080
# Restart frontend: npm run dev
```

### Issue: JWT token expired
```
# Delete localStorage token
# Refresh browser and login again
```

---

## 🧪 Testing Backend

```bash
cd invoice-backend

# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=InvoiceServiceTest

# Run with coverage
./mvnw jacoco:report
```

---

## 📦 Build for Production

### Backend
```bash
cd invoice-backend
./mvnw clean package -DskipTests

# JAR location: target/invoice-backend-1.0.0.jar
```

### Frontend
```bash
cd invoice-frontend
npm run build

# Output: dist/ folder ready for deployment
```

### Docker
```bash
docker-compose build

# Or build individual images
docker build -t invoice-backend invoice-backend/
docker build -t invoice-frontend invoice-frontend/
```

---

## 📊 API Endpoints Quick Reference

### Authentication
```
POST   /api/auth/login                 # Login (username/password)
GET    /api/auth/health                # Health check
```

### Invoices
```
GET    /api/invoices                   # List (paginated)
GET    /api/invoices/{id}              # Get one
GET    /api/invoices/meta/next-number  # Next invoice number
POST   /api/invoices                   # Create
PUT    /api/invoices/{id}              # Update
DELETE /api/invoices/{id}              # Delete
GET    /api/invoices/{id}/pdf          # Download PDF
GET    /api/invoices/export/excel      # Export Excel
```

### Testing with curl
```bash
# Login
TOKEN=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"sfour2024"}' \
  | jq -r '.token')

# Get invoices with token
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/invoices?page=0&size=20
```

---

## 🔐 Security Checklist Before Going Live

- [ ] Change admin password from default
- [ ] Set JWT_SECRET to random 32+ character string
- [ ] Update ALLOWED_ORIGINS to production domain
- [ ] Enable HTTPS/TLS
- [ ] Setup database backup automation
- [ ] Configure monitoring/alerting
- [ ] Review DEPLOYMENT.md production section
- [ ] Run security audit

```bash
# Generate strong JWT secret
openssl rand -base64 32
```

---

## 🚀 Deploy to Production

See `DEPLOYMENT.md` for detailed instructions:
- Local Docker deployment
- AWS ECS deployment
- AWS Elastic Beanstalk deployment
- Database migration
- Backup strategy

---

## 📞 Need Help?

1. **Setup Issues**: See `DEVELOPMENT.md`
2. **API Issues**: Check Swagger UI at `/swagger-ui.html`
3. **Deployment Issues**: See `DEPLOYMENT.md`
4. **Architecture Questions**: See `README.md`
5. **Security Questions**: See `REFACTORING_SUMMARY.md`

---

## 🎯 Next Steps

1. ✅ Setup local environment (5 min)
2. ✅ Run backend & frontend (2 min)
3. ✅ Login and test API (3 min)
4. ✅ Review architecture (DEVELOPMENT.md)
5. ⏳ Build frontend pages (see component stubs)
6. ⏳ Write unit tests (see test infrastructure)
7. ⏳ Setup CI/CD (see DEPLOYMENT.md)
8. ⏳ Deploy to production

---

## 📝 Environment Variables

### Backend (.env)
```bash
# Database
DB_URL=jdbc:postgresql://localhost:5432/invoice_db
DB_USERNAME=postgres
DB_PASSWORD=your-password

# JWT
JWT_SECRET=your-secret-min-32-chars-required

# CORS
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com

# Spring
ACTIVE_PROFILE=dev  # or prod
```

### Frontend (.env.local)
```bash
VITE_API_BASE_URL=http://localhost:8080
```

---

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Remove volumes (warning: data loss)
docker-compose down -v

# Rebuild images
docker-compose build
```

---

## 📱 Browser DevTools Tips

### Check Authentication
```javascript
// In browser console
localStorage.getItem('authToken')  // Check token
localStorage.getItem('user')       // Check user info
```

### Export API Response
```javascript
// In browser console (requires apiClient imported)
import { invoiceApi } from './api/client'
invoiceApi.getAll(0, 10).then(console.log)
```

---

## ✅ Verification Checklist

After setup, verify:

- [x] Backend runs: http://localhost:8080/api/auth/health
- [x] Swagger available: http://localhost:8080/swagger-ui.html
- [x] Frontend runs: http://localhost:5173
- [x] Can login: admin / sfour2024
- [x] Can create invoice
- [x] Can list invoices
- [x] Can download PDF
- [x] Can export Excel

---

## 🎓 Learning Path

### Day 1: Setup & Architecture
- [ ] Read README.md (15 min)
- [ ] Complete 5-minute setup (5 min)
- [ ] Explore Swagger UI (10 min)
- [ ] Read DEVELOPMENT.md (20 min)

### Day 2: API Testing
- [ ] Test endpoints with curl (20 min)
- [ ] Review error handling (10 min)
- [ ] Check backend logging (10 min)
- [ ] Review database schema (10 min)

### Day 3: Frontend Integration
- [ ] Review AuthContext code (15 min)
- [ ] Review API client setup (15 min)
- [ ] Test login flow (10 min)
- [ ] Review component structure (10 min)

### Day 4+: Development
- [ ] Implement frontend pages
- [ ] Add backend tests
- [ ] Setup CI/CD
- [ ] Deploy to staging

---

**Ready? Let's go!** 🚀

Start with: `docker-compose up -d && cd invoice-backend && ./mvnw spring-boot:run`

