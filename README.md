# Invoice Management System - Production Ready

A modern, secure, and scalable invoice management system built with Spring Boot 3 (Java 17) backend and React 19 frontend.

## 🚀 Quick Start

### Prerequisites

- **Backend**: Java 17+, Maven 3.8+, PostgreSQL 12+
- **Frontend**: Node.js 18+, npm/yarn
- **Database**: PostgreSQL 12 or higher

### Environment Setup

#### Backend Configuration

1. **Create `.env.local` file in project root:**

```bash
# Database
DB_URL=jdbc:postgresql://localhost:5432/invoice_db
DB_USERNAME=postgres
DB_PASSWORD=your-secure-password

# JWT (Generate with: openssl rand -base64 32)
JWT_SECRET=your-256-bit-secret-key
JWT_EXPIRATION=86400000

# CORS Origins
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# App Profile
SPRING_PROFILES_ACTIVE=dev
```

2. **Database Setup (PostgreSQL):**

```bash
# Create database
createdb invoice_db

# Connect and run migrations (auto-handled by Hibernate)
psql -U postgres -d invoice_db
```

3. **Build and Run Backend:**

```bash
cd invoice-backend

# Build
./mvnw clean package

# Run development server
./mvnw spring-boot:run

# API available at: http://localhost:8080/api
# Swagger UI: http://localhost:8080/swagger-ui.html
```

#### Frontend Configuration

1. **Create `.env.local` file:**

```bash
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=Invoice Management System
VITE_ENV=development
```

2. **Install and Run:**

```bash
cd invoice-frontend

# Install dependencies
npm install

# Development server
npm run dev

# Available at: http://localhost:5173
```

---

## 🏗️ Architecture

### Backend Architecture

Follows **Domain-Driven Design (DDD)** principles with clean architecture layers:

```
src/main/java/com/sfourtraders/
├── api/                          # REST API Layer
│   ├── controller/               # REST endpoints
│   ├── dto/                      # Data Transfer Objects
│   └── exception/                # Error handling
├── domain/                       # Domain Layer (Business Logic)
│   ├── auth/                     # Authentication services
│   └── invoice/                  # Invoice domain services
├── service/                      # Application Services
├── repository/                   # Data Access Layer
├── model/                        # JPA Entities
├── config/                       # Configuration
├── infrastructure/               # Infrastructure services
│   ├── security/                 # Security configuration
│   └── logging/                  # Application logging
└── shared/                       # Shared utilities
    ├── exception/                # Custom exceptions
    └── types/                    # Common types
```

### Key Features

✅ **Security First**
- JWT-based authentication with configurable expiration
- Bcrypt password hashing (strength 12)
- CORS properly configured
- No hard-coded credentials

✅ **Data Validation**
- Request DTO validation with Jakarta Validation
- Global exception handler for consistent error responses
- Business rule validation in domain services

✅ **Logging**
- Structured logging with SLF4J
- Request/response logging
- Business event tracking

✅ **Database Layer**
- Spring Data JPA with pagination support
- PreparedStatement protection against SQL injection
- Transaction management with ACID guarantees

### API Endpoints

All endpoints require `Authorization: Bearer <jwt-token>` header (except `/auth/login`).

#### Authentication
- `POST /api/auth/login` - Login with credentials
- `GET /api/auth/health` - Health check

#### Invoices
- `GET /api/invoices?page=0&size=20` - List invoices with pagination
- `GET /api/invoices/{id}` - Get invoice by ID
- `GET /api/invoices/meta/next-number` - Get next invoice number
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices/{id}` - Update invoice
- `DELETE `/api/invoices/{id}` - Delete invoice
- `GET /api/invoices/{id}/pdf` - Download invoice as PDF
- `GET /api/invoices/export/excel` - Export to Excel

---

## 🔐 Security Configuration

###  Environment Variables (Never commit `.env` file!)

**Production Required Variables:**
- `DB_URL` - Database connection URL
- `DB_USERNAME` - Database user
- `DB_PASSWORD` - Database password (use strong, generated password)
- `JWT_SECRET` - 256-bit secret (generate: `openssl rand -base64 32`)
- `ALLOWED_ORIGINS` - Comma-separated CORS origins

### JWT Configuration

- **Algorithm**: HS256
- **Expiration**: 24 hours (configurable)
- **Refresh Token**: 7 days (optional)

**Generate secure JWT secret:**
```bash
openssl rand -base64 32
```

### Password Security

- Uses BCrypt with strength 12
- Admin password stored as hash (not plaintext)
- Install passwords via environment variables only

---

## 🧪 Testing

### Run Tests

```bash
cd invoice-backend

# All tests
./mvnw test

# Specific test class
./mvnw test -Dtest=InvoiceServiceTest

# With coverage
./mvnw test jacoco:report
```

### Test Structure

```
src/test/java/com/sfourtraders/
├── api/
│   └── controller/              # API endpoint tests
├── domain/
│   └── service/                 # Domain logic tests
└── integration/                 # Integration tests
```

---

## 🐳 Docker Deployment

### Build Docker Image

```bash
cd invoice-backend

# Build image
docker build -t invoice-backend:latest .

# Run container
docker run -e DB_URL=... -e JWT_SECRET=... -p 8080:8080 invoice-backend:latest
```

### Docker Compose

```bash
docker-compose up -d
```

See `docker-compose.yml` for full configuration.

---

## 📦 Frontend Features

### State Management
- React Context API for authentication
- Local state for form and page navigation
- Toast notifications for user feedback

### Components
- `Login` - Secure login form
- `Dashboard` - Statistics overview
- `InvoiceForm` - Create/edit invoices
- `InvoiceList` - Paginated invoice list
- `ExcelExport` - Date-range based export

### Error Handling
- Global error boundary
- API client with automatic error handling
- User-friendly error messages

### Responsive Design
- Mobile-friendly layout
- Tablet-optimized navigation
- Desktop-optimized tables

---

## 🔄 CI/CD Pipeline

### GitHub Actions (`.github/workflows/`)

- **Build**: Compile Java and React
- **Test**: Run test suites
- **Security Scan**: OWASP dependency check
- **Deploy**: Auto-deploy to production on main branch

### Deployment Checklist

- [ ] All tests passing
- [ ] No security vulnerabilities
- [ ] Production environment variables set
- [ ] Database migrations applied
- [ ] SSL/TLS certificate configured
- [ ] Backup strategy verified

---

## 📋 Project Structure

```
E_SforuTraders/
├── invoice-backend/               # Spring Boot backend
│   ├── pom.xml
│   ├── src/
│   ├── Dockerfile
│   └── docker-compose.yml
├── invoice-frontend/              # React frontend
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.local
│   └── src/
├── .env.example                   # Example environment file
├── .gitignore
├── docker-compose.yml
└── README.md
```

---

## 🛠️ Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/invoice-search

# Make changes
# Commit with Conventional Commits
git commit -m "feat: add invoice search by party name"

# Push and create PR
git push origin feature/invoice-search
```

### 2. Running Locally

**Terminal 1 - Backend:**
```bash
cd invoice-backend
./mvnw spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd invoice-frontend
npm run dev
```

**Visit:** http://localhost:5173

### 3. Default Credentials (Development Only)

- **Username:** admin
- **Password:** change-me-in-production

> **⚠️ CRITICAL: Change credentials in production!**

---

## 📈 Performance Optimization

### Database
- Connection pooling (HikariCP)
- Query optimization with indexes
- Batch processing for bulk operations

### Caching
- HTTP caching headers
- Database query caching
- Pagination to limit dataset size

### Frontend
- Code splitting with Vite
- Lazy loading of components
- Minification and compression

---

## 📞 Troubleshooting

### Backend Issues

**Port 8080 already in use:**
```bash
# Kill process
lsof -i :8080 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or run on different port
./mvnw spring-boot:run -Dspring-boot.run.arguments="--server.port=8081"
```

**JWT Token Expired:**
- Increase `JWT_EXPIRATION` (in milliseconds)
- Default: 86400000 ms = 24 hours

**Database Connection Error:**
- Verify PostgreSQL is running: `psql -U postgres`
- Check connection string format
- Verify credentials in `.env.local`

### Frontend Issues

**Cannot connect to API:**
- Verify backend is running on correct port
- Check `VITE_API_URL` in `.env.local`
- Check CORS configuration in backend

**Blank page on startup:**
- Check browser console for errors
- Verify node_modules are installed: `npm install`
- Clear cache: `npm cache clean --force && npm install`

---

## 📚 Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [OWASP Security Guidelines](https://owasp.org)

---

## 📋 License

Proprietary - S Four Traders

---

## ✅ Post-Refactor Checklist

- [x] Security vulnerabilities fixed
- [x] Environment-based configuration
- [x] Password hashing implemented
- [x] DTO validation layer added
- [x] Global error handling
- [x] Comprehensive logging
- [x] Pagination support
- [x] API documentation (Swagger)
- [x] Frontend state management
- [x] Error boundaries
- [x] Docker configuration
- [x] Production documentation

**Status: Production Ready** ✅
