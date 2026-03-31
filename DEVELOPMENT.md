# Development Guide

This guide provides information for developers working on the Invoice Management System.

## Local Setup

### Quick Start

```bash
# 1. Clone repo
git clone <url>
cd E_SforuTraders

# 2. Setup environment files
cp .env.example .env.local
cp invoice-backend/.env.example invoice-backend/.env.local
cp invoice-frontend/.env.example invoice-frontend/.env.local

# 3. Install dependencies
cd invoice-backend && ./mvnw clean install && cd ..
cd invoice-frontend && npm install && cd ..

# 4. Start services (Terminal 1 & 2)
# Terminal 1:
cd invoice-backend && ./mvnw spring-boot:run

# Terminal 2:
cd invoice-frontend && npm run dev

# 5. Access application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8080/api
# Swagger UI: http://localhost:8080/swagger-ui.html
```

---

## Code Structure

### Backend

```
src/main/java/com/sfourtraders/
├── api/                      # API Layer
│   ├── controller/          # REST endpoints
│   ├── dto/                 # Data Transfer Objects
│   │   ├── auth/
│   │   ├── invoice/
│   │   └── common/
│   └── exception/           # Global exception handler
├── domain/                  # Domain Layer
│   ├── auth/               # Auth domain services
│   └── invoice/            # Invoice domain services
├── service/                # Application Services
├── repository/             # Data Access Layer
├── model/                  # JPA Entities
├── config/                 # Configurations
├── infrastructure/         # Infrastructure
│   ├── security/          # Security config
│   └── logging/           # Logging utilities
└── shared/                # Shared utilities
    ├── exception/         # Custom exceptions
    └── types/            # Common types
```

### Frontend

```
src/
├── api/                     # API client
│   └── client.js           # Axios instance + endpoints
├── contexts/               # React Context
│   └── AuthContext.jsx     # Auth state
├── components/             # Reusable components
│   ├── Common.jsx          # Common UI components
│   ├── ErrorBoundary.jsx   # Error handling
│   └── Loading.css         # Styles
├── pages/                  # Page components
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── InvoiceForm.jsx
│   ├── InvoiceList.jsx
│   └── ExcelExport.jsx
├── App.jsx                 # Root app
└── main.jsx               # Entry point
```

---

## Development Workflow

### Creating a Feature

1. **Create branch**:
```bash
git checkout -b feature/my-feature
```

2. **Make changes**:
   - Backend: Add endpoint in controller, implement service logic
   - Frontend: Add component, integrate with API

3. **Test**:
```bash
# Backend
cd invoice-backend && ./mvnw test

# Frontend (TODO - setup Jest/Vitest)
cd invoice-frontend && npm test
```

4. **Commit with standard messages**:
```bash
git commit -m "feat: add invoice search functionality"
```

5. **Push and create PR**:
```bash
git push origin feature/my-feature
```

### Commit Message Convention

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: feat, fix, docs, style, refactor, perf, test, chore

**Example**:
```
feat(invoice): add search by party name

- Implement backend search endpoint
- Add frontend search UI component
- Add unit tests for search service

Closes #123
```

---

## Testing

### Backend Tests

```bash
cd invoice-backend

# Run all tests
./mvnw test

# Run specific test
./mvnw test -Dtest=InvoiceServiceTest

# Run with coverage
./mvnw test jacoco:report
# View report: target/site/jacoco/index.html
```

### Frontend Tests

```bash
cd invoice-frontend

# TODO: Setup test framework
# npm test
```

### Manual Testing

```bash
# Login
POST http://localhost:8080/api/auth/login
Body: {"username":"admin","password":"sfour2024"}

# Create Invoice
POST http://localhost:8080/api/invoices
Headers: {"Authorization":"Bearer <token>"}
Body: {...}
```

---

## Common Tasks

### Adding New API Endpoint

1. **Create DTO**:
```java
// src/api/dto/invoice/MyDataRequest.java
@Data
public class MyDataRequest {
    @NotBlank
    private String field;
}
```

2. **Add to Service**:
```java
// src/service/InvoiceService.java
public void myMethod(MyDataRequest request) {
    // Business logic
}
```

3. **Add Controller Endpoint**:
```java
// src/api/controller/InvoiceController.java
@PostMapping("/my-endpoint")
public ResponseEntity<?> myEndpoint(@Valid @RequestBody MyDataRequest request) {
    // Call service
}
```

4. **Test via Swagger**: http://localhost:8080/swagger-ui.html

### Adding New React Component

1. **Create component**:
```jsx
// src/components/MyComponent.jsx
export function MyComponent({ prop1 }) {
  return <div>{prop1}</div>;
}
```

2. **Use in page**:
```jsx
import { MyComponent } from '../components/MyComponent';

export function MyPage() {
  return <MyComponent prop1="value" />;
}
```

3. **Add styles**:
```css
/* src/components/MyComponent.css */
.my-component {
  /* styles */
}
```

---

## Debugging

### Backend Debugging

1. **Set breakpoint** in IDE
2. **Run in debug mode**:
```bash
./mvnw spring-boot:run -Drun.arguments="--debug"
```
3. **Attach debugger** in IDE (port 5005)

### Frontend Debugging

1. **Open DevTools**: F12 or Cmd+Option+I
2. **Check Console** for errors
3. **Check Network** tab for API calls
4. **Set breakpoints** in Sources

### Database Debugging

```bash
# Connect to DB
psql -U postgres -d invoice_db

# Common queries
SELECT * FROM invoices LIMIT 10;
SELECT COUNT(*) FROM invoices;
```

---

## Performance Optimization

### Backend

- Use pagination for large datasets
- Add database indexes
- Cache frequently accessed data
- Use connection pooling
- Profile with JFR (Java Flight Recorder)

### Frontend

- Lazy load components
- Minimize bundle size
- Use React.memo for expensive renders
- Optimize images
- Enable gzip compression

---

## Security Best Practices

1. **Never commit secrets** - Use environment variables
2. **Validate all inputs** - Server and client side
3. **Use HTTPS** - Always in production
4. **Keep dependencies updated** - Regular `npm audit`, dependency scanning
5. **Review security advisories** - Check for CVEs

---

## Useful Commands

```bash
# Backend
./mvnw clean package          # Build
./mvnw spring-boot:run        # Run
./mvnw test                   # Test
./mvnw dependency:tree        # View dependencies

# Frontend
npm install                   # Install deps
npm run dev                   # Start dev server
npm run build                 # Build for production
npm run lint                  # Lint/format
npm run lint:fix              # Auto-fix linting issues
```

---

## Troubleshooting

### Backend won't start
- Check if port 8080 is in use
- Verify PostgreSQL is running
- Check `.env.local` configuration
- Review application logs

### Frontend won't load
- Check `.env.local` API_URL
- Verify backend is running
- Check browser console for errors
- Clear npm cache: `npm cache clean --force`

### Database connection error
- Verify PostgreSQL running: `psql -U postgres`
- Check connection string format
- Test credentials independently

---

## Resources

- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [React Docs](https://react.dev)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [REST API Best Practices](https://restfulapi.net/)

---

**Last Updated**: March 2026
