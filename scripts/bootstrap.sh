#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "[bootstrap] Starting local setup..."

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "[bootstrap] Missing required command: $1"
    exit 1
  fi
}

require_cmd docker
require_cmd java
require_cmd node
require_cmd npm

if ! docker compose version >/dev/null 2>&1; then
  echo "[bootstrap] Docker Compose is required (docker compose)."
  exit 1
fi

if [[ ! -f "$ROOT_DIR/.env.local" ]]; then
  cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env.local"
  echo "[bootstrap] Created .env.local from .env.example"
else
  echo "[bootstrap] .env.local already exists"
fi

if [[ ! -f "$ROOT_DIR/invoice-frontend/.env.local" && -f "$ROOT_DIR/invoice-frontend/.env.example" ]]; then
  cp "$ROOT_DIR/invoice-frontend/.env.example" "$ROOT_DIR/invoice-frontend/.env.local"
  echo "[bootstrap] Created invoice-frontend/.env.local from .env.example"
fi

echo "[bootstrap] Starting local postgres container..."
docker compose -f "$ROOT_DIR/docker-compose.yml" up -d postgres

echo "[bootstrap] Compiling backend..."
(
  cd "$ROOT_DIR/invoice-backend"
  ./mvnw -q -DskipTests compile
)

echo "[bootstrap] Installing frontend dependencies..."
(
  cd "$ROOT_DIR/invoice-frontend"
  npm ci
)

echo
echo "[bootstrap] Setup complete."
echo "[bootstrap] Next steps:"
echo "  1) cd invoice-backend && ./mvnw spring-boot:run"
echo "  2) cd invoice-frontend && npm run dev"
echo "  3) Open http://localhost:5173"