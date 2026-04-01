#!/usr/bin/env bash
# ============================================================================
# setup.sh - E_SforuTraders Development Environment Setup
# ============================================================================
# This script sets up the complete development environment including:
# - Checking and validating required tools
# - Creating environment configuration files
# - Starting the PostgreSQL database container
# - Installing backend and frontend dependencies
# ============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory (works even when called from different locations)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

ENV_FILE=".env.local"
COMPOSE_BASE=()

LOG_DIR="logs"
mkdir -p "$LOG_DIR"

# Logging functions
log_info() { echo -e "${BLUE}[setup]${NC} $1"; }
log_success() { echo -e "${GREEN}[setup]${NC} ✓ $1"; }
log_warn() { echo -e "${YELLOW}[setup]${NC} ⚠ $1"; }
log_error() { echo -e "${RED}[setup]${NC} ✗ $1"; }

# Check if a command exists
require_cmd() {
    if ! command -v "$1" >/dev/null 2>&1; then
        log_error "Required command not found: $1"
        return 1
    fi
    return 0
}

compose_cmd() {
    if [[ ${#COMPOSE_BASE[@]} -eq 0 ]]; then
        log_error "Docker Compose command is not initialized"
        return 1
    fi
    if [[ -f "$ENV_FILE" ]]; then
        "${COMPOSE_BASE[@]}" --env-file "$ENV_FILE" "$@"
    else
        "${COMPOSE_BASE[@]}" "$@"
    fi
}

detect_compose() {
    if docker compose version >/dev/null 2>&1; then
        COMPOSE_BASE=(docker compose)
        return 0
    fi
    if command -v docker-compose >/dev/null 2>&1; then
        COMPOSE_BASE=(docker-compose)
        return 0
    fi
    log_error "Docker Compose is required (docker compose plugin or docker-compose)"
    return 1
}

generate_secret() {
    if command -v openssl >/dev/null 2>&1; then
        openssl rand -base64 32
    else
        # Fallback for environments without OpenSSL.
        date +%s | shasum | awk '{print $1$1}' | cut -c1-44
    fi
}

create_root_env_local() {
    log_warn "Creating local development .env.local"
    cat > "$ENV_FILE" << EOF
# Local Development Configuration
DB_URL=jdbc:postgresql://localhost:5432/invoice_db
DB_USERNAME=postgres
DB_PASSWORD=postgres
JWT_SECRET=$(generate_secret)
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000
APP_USERNAME=admin
APP_PASSWORD=admin123
SPRING_PROFILES_ACTIVE=dev
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
APP_ENVIRONMENT=development
EOF
}

# Check Java version
check_java_version() {
    local java_version
    java_version=$(java -version 2>&1 | head -n1 | cut -d'"' -f2 | cut -d'.' -f1)
    if [[ "$java_version" -lt 17 ]]; then
        log_error "Java 17 or higher is required (found: $java_version)"
        return 1
    fi
    log_success "Java version $java_version detected"
}

# Check Node.js version
check_node_version() {
    local node_version
    node_version=$(node -v | sed 's/v//' | cut -d'.' -f1)
    if [[ "$node_version" -lt 18 ]]; then
        log_error "Node.js 18 or higher is required (found: v$node_version)"
        return 1
    fi
    log_success "Node.js v$node_version detected"
}

# Start Docker if not running (macOS only)
ensure_docker_running() {
    if docker info >/dev/null 2>&1; then
        log_success "Docker is running"
        return 0
    fi

    if [[ "$OSTYPE" == "darwin"* ]]; then
        log_warn "Docker is not running. Attempting to start Docker Desktop..."
        open --background -a Docker
        local retries=30
        while ! docker info >/dev/null 2>&1; do
            sleep 2
            retries=$((retries - 1))
            if [[ $retries -le 0 ]]; then
                log_error "Docker failed to start after 60 seconds"
                return 1
            fi
            echo -n "."
        done
        echo ""
        log_success "Docker Desktop started"
    else
        log_error "Docker is not running. Please start Docker and re-run this script."
        return 1
    fi
}

# Setup environment files
setup_env_files() {
    log_info "Setting up environment files..."

    # Root .env.local
    if [[ ! -f "$ENV_FILE" ]]; then
        create_root_env_local
        log_success "Created $ENV_FILE with development defaults"
    else
        log_info "$ENV_FILE already exists, skipping"
    fi

    # Frontend .env.local
    if [[ ! -f "invoice-frontend/.env.local" ]]; then
        if [[ -f "invoice-frontend/.env.example" ]]; then
            cp "invoice-frontend/.env.example" "invoice-frontend/.env.local"
            log_success "Created invoice-frontend/.env.local"
        fi
    else
        log_info "invoice-frontend/.env.local already exists, skipping"
    fi
}

# Main setup function
main() {
    echo ""
    echo "============================================================"
    echo "  E_SforuTraders - Development Environment Setup"
    echo "============================================================"
    echo ""

    # Check required tools
    log_info "Checking required tools..."
    local missing_tools=()

    require_cmd java || missing_tools+=("java (JDK 17+)")
    require_cmd node || missing_tools+=("node (v18+)")
    require_cmd npm || missing_tools+=("npm")
    require_cmd docker || missing_tools+=("docker")
    require_cmd git || missing_tools+=("git")

    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        log_error "Missing required tools:"
        for tool in "${missing_tools[@]}"; do
            echo "  - $tool"
        done
        echo ""
        echo "Please install the missing tools and re-run this script."
        exit 1
    fi

    # Check Docker Compose
    if ! detect_compose; then
        exit 1
    fi
    log_success "All required tools found"

    # Version checks
    check_java_version
    check_node_version

    # Ensure Docker is running
    ensure_docker_running

    # Setup environment files
    setup_env_files

    # Start PostgreSQL
    log_info "Starting PostgreSQL container..."
    if compose_cmd up -d postgres > "$LOG_DIR/docker-postgres.log" 2>&1; then
        log_success "PostgreSQL container started"
    else
        log_error "Failed to start PostgreSQL. Check $LOG_DIR/docker-postgres.log"
        exit 1
    fi

    # Wait for PostgreSQL to be healthy
    log_info "Waiting for PostgreSQL to be ready..."
    local retries=30
    while ! compose_cmd exec -T postgres pg_isready -U postgres >/dev/null 2>&1; do
        sleep 1
        retries=$((retries - 1))
        if [[ $retries -le 0 ]]; then
            log_error "PostgreSQL failed to become ready"
            exit 1
        fi
        echo -n "."
    done
    echo ""
    log_success "PostgreSQL is ready"

    # Install backend dependencies
    log_info "Installing backend dependencies..."
    (
        cd invoice-backend
        if ./mvnw -q clean compile -DskipTests > "../$LOG_DIR/backend-setup.log" 2>&1; then
            log_success "Backend dependencies installed"
        else
            log_error "Backend setup failed. Check $LOG_DIR/backend-setup.log"
            exit 1
        fi
    )

    # Install frontend dependencies
    log_info "Installing frontend dependencies..."
    (
        cd invoice-frontend
        if npm ci > "../$LOG_DIR/frontend-setup.log" 2>&1; then
            log_success "Frontend dependencies installed"
        else
            log_warn "npm ci failed, trying npm install..."
            if npm install > "../$LOG_DIR/frontend-setup.log" 2>&1; then
                log_success "Frontend dependencies installed"
            else
                log_error "Frontend setup failed. Check $LOG_DIR/frontend-setup.log"
                exit 1
            fi
        fi
    )

    # Summary
    echo ""
    echo "============================================================"
    log_success "Setup complete!"
    echo "============================================================"
    echo ""
    echo "Next steps:"
    echo "  1. Run ./start.sh to start all services"
    echo "  2. Open http://localhost:5173 in your browser"
    echo ""
    echo "Useful commands:"
    echo "  ./start.sh     - Start all services"
    echo "  ./stop.sh      - Stop all services"
    echo "  ./stop.sh -a   - Stop all services and remove volumes"
    echo ""
}

# Run main function
main "$@"
