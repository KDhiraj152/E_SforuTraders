# Multi-stage build for React application

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY invoice-frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY invoice-frontend/src src/
COPY invoice-frontend/index.html .
COPY invoice-frontend/vite.config.js .
COPY invoice-frontend/.env.production .

# Build
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY invoice-frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
