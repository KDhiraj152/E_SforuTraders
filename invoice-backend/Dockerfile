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
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy jar from build stage
COPY --from=builder /app/target/invoice-backend-*.jar app.jar

# Create non-root user
RUN addgroup -g 1001 -S appuser && adduser -u 1001 -S appuser -G appuser
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD java -cp app.jar org.springframework.boot.loader.launch.HealthCheckLauncher || exit 1

# Expose port
EXPOSE 8080

# Run application
ENTRYPOINT ["dumb-init", "--"]
CMD ["java", "-Xmx512m", "-Xms256m", "-XX:+UseG1GC", "-jar", "app.jar"]
