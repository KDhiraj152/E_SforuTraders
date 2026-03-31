# Deployment Guide

This guide covers deployment strategies for the Invoice Management System.

## Table of Contents
1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Cloud Deployment (AWS)](#aws-deployment)
4. [Production Checklist](#production-checklist)

---

## Local Development

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL 12+
- Maven 3.8+
- Docker & Docker Compose (optional)

###  Setup

1. **Clone Repository**
```bash
git clone <repository-url>
cd E_SforuTraders
```

2. **Setup Environment**
```bash
# Copy example files
cp .env.example .env.local
cp invoice-frontend/.env.example invoice-frontend/.env.local
cp invoice-backend/.env.example invoice-backend/.env.local

# Edit .env files with your local settings
```

3. **Backend Setup**
```bash
cd invoice-backend

# Download dependencies
./mvnw clean install

# Run application
./mvnw spring-boot:run

# Verify: http://localhost:8080/swagger-ui.html
```

4. **Frontend Setup**
```bash
cd invoice-frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Access: http://localhost:5173
```

---

## Docker Deployment

### Quick Start with Docker Compose

```bash
# From project root

# Set environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Build and start all services
docker-compose up --build

# Services:
# - Backend: http://localhost:8080
# - Frontend: http://localhost
# - Database: localhost:5432
```

### Build Individual Images

```bash
# Backend image
docker build -f invoice-backend/Dockerfile -t invoice-backend:1.0.0 .

# Frontend image
docker build -f invoice-frontend/Dockerfile -t invoice-frontend:1.0.0 .

# Run Backend
docker run \
  -e DB_URL=jdbc:postgresql://host.docker.internal:5432/invoice_db \
  -e JWT_SECRET=your-secret \
  -p 8080:8080 \
  invoice-backend:1.0.0

# Run Frontend
docker run -p 80:80 invoice-frontend:1.0.0
```

### Docker Registry Push

```bash
# Tag images
docker tag invoice-backend:1.0.0 your-registry/invoice-backend:1.0.0
docker tag invoice-frontend:1.0.0 your-registry/invoice-frontend:1.0.0

# Push
docker push your-registry/invoice-backend:1.0.0
docker push your-registry/invoice-frontend:1.0.0
```

---

## AWS Deployment

### Option 1: ECS (Elastic Container Service)

#### Prerequisites
- AWS Account
- ECR (Elastic Container Registry) repository
- RDS PostgreSQL database
- ECS Cluster

#### Steps

1. **Create RDS Database**
```bash
aws rds create-db-instance \
  --db-instance-identifier invoice-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password <strong-password> \
  --allocated-storage 20 \
  --publicly-accessible false
```

2. **Push Images to ECR**
```bash
# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Tag and push backend
docker tag invoice-backend:1.0.0 <account-id>.dkr.ecr.us-east-1.amazonaws.com/invoice-backend:1.0.0
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/invoice-backend:1.0.0

# Tag and push frontend
docker tag invoice-frontend:1.0.0 <account-id>.dkr.ecr.us-east-1.amazonaws.com/invoice-frontend:1.0.0
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/invoice-frontend:1.0.0
```

3. **Create ECS Task Definitions**

Create `backend-task.json`:
```json
{
  "family": "invoice-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "invoice-backend",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/invoice-backend:1.0.0",
      "portMappings": [{"containerPort": 8080}],
      "environment": [
        {"name": "DB_URL", "value": "jdbc:postgresql://invoice-db.xxx.us-east-1.rds.amazonaws.com:5432/invoice_db"},
        {"name": "DB_USERNAME", "value": "admin"},
        {"name": "SPRING_PROFILES_ACTIVE", "value": "prod"}
      ],
      "secrets": [
        {"name": "DB_PASSWORD", "valueFrom": "arn:aws:secretsmanager:..."},
        {"name": "JWT_SECRET", "valueFrom": "arn:aws:secretsmanager:..."}
      ]
    }
  ]
}
```

4. **Register and Run**
```bash
aws ecs register-task-definition --cli-input-json file://backend-task.json
aws ecs run-task --cluster invoice-cluster --task-definition invoice-backend
```

###  Option 2: Elastic Beanstalk

1. **Create Beanstalk Application**
```bash
eb init -p "Docker running on 64bit Amazon Linux 2" invoice-app
eb create invoice-env --instance-type t3.micro --envvars RDS_HOSTNAME=...,JWT_SECRET=...
```

2. **Deploy**
```bash
# Build Docker images
docker-compose build

# Deploy
eb deploy
```

### Option 3: EKS (Kubernetes)

Requires Kubernetes manifests (not covered here - consult Kubernetes documentation).

---

## Production Checklist

Before deploying to production, ensure:

### Security
- [ ] JWT_SECRET generated with `openssl rand -base64 32`
- [ ] Database password changed from default
- [ ] Admin credentials updated
- [ ] SSL/TLS certificate configured
- [ ] CORS origins restricted to production domain
- [ ] Security headers configured (HSTS, CSP, etc.)

### Performance
- [ ] Database indexed properly
- [ ] Caching configured
- [ ] Connection pooling tuned
- [ ] Static assets compressed (gzip)
- [ ] CDN configured for frontend assets

### Reliability
- [ ] Database backups scheduled
- [ ] Application monitoring enabled (CloudWatch, Datadog, etc.)
- [ ] Log aggregation configured
- [ ] Health checks configured
- [ ] Auto-scaling configured
- [ ] Disaster recovery plan documented

### Compliance
- [ ] GDPR compliance verified (if applicable)
- [ ] PCI DSS compliance verified (if processing payments)
- [ ] Audit logging enabled
- [ ] Data retention policy implemented

### Operational
- [ ] CI/CD pipeline configured
- [ ] Deployment documentation updated
- [ ] Team trained on deployment procedures
- [ ] Rollback plan documented
- [ ] Incident response plan in place

---

## Monitoring & Logging

### CloudWatch (AWS)

Enable CloudWatch logging:
```bash
aws logs create-log-group --log-group-name /ecs/invoice-backend
aws logs put-retention-policy --log-group-name /ecs/invoice-backend --retention-in-days 30
```

### Application Monitoring

Configure alerts for:
- High error rate (>5%)
- Slow responses (>5s)
- Database connection pool exhaustion
- Disk space low
- Memory usage high

---

## Rollback Procedure

If deployment fails:

1. **Immediate Rollback**:
```bash
# ECS
aws ecs update-service --cluster invoice-cluster --service invoice-backend --force-new-deployment

# Elastic Beanstalk
eb abort
eb deploy --version <previous-version>
```

2. **Manual Verification**:
- Check application logs
- Verify database integrity
- Test critical workflows

3. **Communication**:
- Notify stakeholders
- Document incident
- Schedule post-mortem

---

## Cost Optimization

- Use Spot instances for non-critical workloads
- Schedule auto-scaling policies
- Review unused resources monthly
- Use Reserved Instances for stable workloads

---

## Support

For issues, contact: devops@sfourtraders.com
