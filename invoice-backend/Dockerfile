# Multi-stage build for Spring Boot application

# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy pom.xml and download dependencies
COPY invoice-backend/pom.xml .
RUN mvn dependency:go-offline

# Copy source code
COPY invoice-backend/src src/

# Build application
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:17-jre

WORKDIR /app

# Install curl for health check
RUN apt-get update && apt-get install -y --no-install-recommends curl dumb-init && rm -rf /var/lib/apt/lists/*

# Copy jar from build stage
COPY --from=builder /app/target/invoice-backend-*.jar app.jar

# Create non-root user
RUN groupadd -g 1001 appuser && useradd -u 1001 -g appuser appuser
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -fsS http://localhost:8080/api/auth/health || exit 1

# Expose port
EXPOSE 8080

# Run application
ENTRYPOINT ["dumb-init", "--"]
CMD ["java", "-Xmx512m", "-Xms256m", "-XX:+UseG1GC", "-jar", "app.jar"]
