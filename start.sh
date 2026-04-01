#!/usr/bin/env bash
# ============================================================================
# start.sh - E_SforuTraders Development Server Start Script
# ============================================================================
# Starts all development services:
# - PostgreSQL (Docker)
# - Spring Boot Backend (port 8080)
# - Vite Frontend (port 5173)
# ============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

ENV_FILE=".env.local"
COMPOSE_BASE=()

LOG_DIR="logs"
mkdir -p "$LOG_DIR"

# Configuration
BACKEND_PORT=8080
FRONTEND_PORT=5173
POSTGRES_PORT=5432

# Logging functions
log_info() { echo -e "${BLUE}[start]${NC} $1"; }
log_success() { echo -e "${GREEN}[start]${NC} ✓ $1"; }
log_warn() { echo -e "${YELLOW}[start]${NC} ⚠ $1"; }
log_error() { echo -e "${RED}[start]${NC} ✗ $1"; }

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

load_env_file() {
    if [[ ! -f "$ENV_FILE" ]]; then
        log_warn "$ENV_FILE not found; using existing environment variables"
        return 0
    fi

    log_info "Loading environment from $ENV_FILE"
    while IFS='=' read -r key value; do
        [[ -z "$key" || "$key" == \#* ]] && continue
        if [[ "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
            value="${value%$'\r'}"
            export "$key=$value"
        fi
    done < "$ENV_FILE"
}

configure_test_credentials() {
    if [[ -z "${APP_USERNAME:-}" || -z "${APP_PASSWORD:-}" ]]; then
        log_error "APP_USERNAME and APP_PASSWORD must be set in environment or $ENV_FILE"
        log_info "Run ./setup.sh to create a secure .env.local, then retry ./start.sh"
        return 1
    fi
}

# Check if a port is in use
is_port_in_use() {
    local port=$1
    if command -v lsof >/dev/null 2>&1; then
        lsof -i ":$port" -sTCP:LISTEN >/dev/null 2>&1
        return
    fi
    if command -v ss >/dev/null 2>&1; then
        ss -ltn "sport = :$port" 2>/dev/null | grep -q LISTEN
        return
    fi
    if command -v netstat >/dev/null 2>&1; then
        netstat -an 2>/dev/null | grep -E "[\.:]$port[[:space:]]" | grep -q LISTEN
        return
    fi
    return 1
}

# Get PID of process using a port
get_port_pid() {
    local port=$1
    if command -v lsof >/dev/null 2>&1; then
        lsof -i ":$port" -sTCP:LISTEN -t 2>/dev/null | head -1
        return
    fi
    if command -v ss >/dev/null 2>&1; then
        ss -ltnp "sport = :$port" 2>/dev/null | awk 'match($0, /pid=([0-9]+)/, m) { print m[1]; exit }'
        return
    fi
}

can_probe_http() {
    command -v curl >/dev/null 2>&1 || command -v wget >/dev/null 2>&1
}

http_ok() {
    local url=$1
    if command -v curl >/dev/null 2>&1; then
        curl -fsS "$url" >/dev/null 2>&1
        return
    fi
    if command -v wget >/dev/null 2>&1; then
        wget -q -O /dev/null "$url" >/dev/null 2>&1
        return
    fi
    return 1
}

backend_ready() {
    if can_probe_http; then
        http_ok "http://localhost:$BACKEND_PORT/actuator/health" || http_ok "http://localhost:$BACKEND_PORT/api"
        return
    fi
    is_port_in_use "$BACKEND_PORT"
}

frontend_ready() {
    if can_probe_http; then
        http_ok "http://localhost:$FRONTEND_PORT"
        return
    fi
    is_port_in_use "$FRONTEND_PORT"
}

# Ensure Docker is running
ensure_docker_running() {
    if docker info >/dev/null 2>&1; then
        return 0
    fi

    if [[ "$OSTYPE" == "darwin"* ]]; then
        log_warn "Docker is not running. Starting Docker Desktop..."
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

# Start PostgreSQL container
start_postgres() {
    log_info "Starting PostgreSQL..."
    
    # Check if postgres container is already running
    if compose_cmd ps postgres 2>/dev/null | grep -q "running"; then
        log_info "PostgreSQL container already running"
    else
        compose_cmd up -d postgres > "$LOG_DIR/docker-compose.log" 2>&1
        log_success "PostgreSQL container started"
    fi

    # Wait for PostgreSQL to be ready
    log_info "Waiting for PostgreSQL to be ready..."
    local retries=30
    while ! compose_cmd exec -T postgres pg_isready -U postgres >/dev/null 2>&1; do
        sleep 1
        retries=$((retries - 1))
        if [[ $retries -le 0 ]]; then
            log_error "PostgreSQL failed to become ready"
            return 1
        fi
        echo -n "."
    done
    echo ""
    log_success "PostgreSQL is ready on port $POSTGRES_PORT"
}

# Start backend
start_backend() {
    log_info "Starting backend (Spring Boot)..."

    if is_port_in_use $BACKEND_PORT; then
        local existing_pid
        existing_pid=$(get_port_pid $BACKEND_PORT)
        log_warn "Port $BACKEND_PORT already in use (PID: $existing_pid)"
        log_info "Backend appears to be running already"
        return 0
    fi

    # Clean up stale PID file
    rm -f "$LOG_DIR/backend.pid"

    (
        cd invoice-backend
        nohup ./mvnw spring-boot:run \
            -Dspring-boot.run.jvmArguments="-Dserver.port=$BACKEND_PORT" \
            > "../$LOG_DIR/backend.log" 2>&1 &
        echo $! > "../$LOG_DIR/backend.pid"
    )

    local backend_pid
    backend_pid=$(cat "$LOG_DIR/backend.pid")
    log_success "Backend starting (PID: $backend_pid)"
    log_info "Backend log: $LOG_DIR/backend.log"

    # Wait for backend to be ready
    log_info "Waiting for backend to start..."
    local retries=60
        while ! backend_ready; do
        sleep 2
        retries=$((retries - 1))
        if [[ $retries -le 0 ]]; then
            log_warn "Backend may still be starting. Check $LOG_DIR/backend.log"
            return 0
        fi
        # Check if process is still running
        if ! kill -0 "$backend_pid" 2>/dev/null; then
            log_error "Backend process died. Check $LOG_DIR/backend.log"
            return 1
        fi
        echo -n "."
    done
    echo ""
    log_success "Backend is ready on port $BACKEND_PORT"
}

# Start frontend
start_frontend() {
    log_info "Starting frontend (Vite)..."

    if is_port_in_use $FRONTEND_PORT; then
        local existing_pid
        existing_pid=$(get_port_pid $FRONTEND_PORT)
        log_warn "Port $FRONTEND_PORT already in use (PID: $existing_pid)"
        log_info "Frontend appears to be running already"
        return 0
    fi

    # Clean up stale PID file
    rm -f "$LOG_DIR/frontend.pid"

    (
        cd invoice-frontend
        nohup npm run dev > "../$LOG_DIR/frontend.log" 2>&1 &
        echo $! > "../$LOG_DIR/frontend.pid"
    )

    local frontend_pid
    frontend_pid=$(cat "$LOG_DIR/frontend.pid")
    log_success "Frontend starting (PID: $frontend_pid)"
    log_info "Frontend log: $LOG_DIR/frontend.log"

    # Wait for frontend to be ready
    log_info "Waiting for frontend to start..."
    local retries=30
    while ! frontend_ready; do
        sleep 1
        retries=$((retries - 1))
        if [[ $retries -le 0 ]]; then
            log_warn "Frontend may still be starting. Check $LOG_DIR/frontend.log"
            return 0
        fi
        # Check if process is still running
        if ! kill -0 "$frontend_pid" 2>/dev/null; then
            log_error "Frontend process died. Check $LOG_DIR/frontend.log"
            return 1
        fi
        echo -n "."
    done
    echo ""
    log_success "Frontend is ready on port $FRONTEND_PORT"
}

# Show status of all services
show_status() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}                    Service Status                         ${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""

    # PostgreSQL status
    if compose_cmd ps postgres 2>/dev/null | grep -q "running"; then
        echo -e "  ${GREEN}●${NC} PostgreSQL      : Running (port $POSTGRES_PORT)"
    else
        echo -e "  ${RED}○${NC} PostgreSQL      : Not running"
    fi

    # Backend status
    if is_port_in_use $BACKEND_PORT; then
        local backend_pid
        backend_pid=$(get_port_pid $BACKEND_PORT)
        echo -e "  ${GREEN}●${NC} Backend (Java)  : Running (port $BACKEND_PORT, PID: $backend_pid)"
    else
        echo -e "  ${RED}○${NC} Backend (Java)  : Not running"
    fi

    # Frontend status
    if is_port_in_use $FRONTEND_PORT; then
        local frontend_pid
        frontend_pid=$(get_port_pid $FRONTEND_PORT)
        echo -e "  ${GREEN}●${NC} Frontend (Vite) : Running (port $FRONTEND_PORT, PID: $frontend_pid)"
    else
        echo -e "  ${RED}○${NC} Frontend (Vite) : Not running"
    fi

    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "  URLs:"
    echo "    Frontend:  http://localhost:$FRONTEND_PORT"
    echo "    Backend:   http://localhost:$BACKEND_PORT/api"
    echo "    Swagger:   http://localhost:$BACKEND_PORT/swagger-ui.html"
    echo ""
    echo "  Logs:"
    echo "    Backend:   $LOG_DIR/backend.log"
    echo "    Frontend:  $LOG_DIR/frontend.log"
    echo ""
    echo "  Commands:"
    echo "    ./stop.sh         - Stop all services"
    echo "    tail -f $LOG_DIR/backend.log   - Watch backend logs"
    echo "    tail -f $LOG_DIR/frontend.log  - Watch frontend logs"
    echo ""
    echo "  Test Login:"
    echo "    ID:       $APP_USERNAME"
    echo "    Password: $APP_PASSWORD"
    echo ""
}

# Main function
main() {
    echo ""

    local missing_tools=()
    require_cmd docker || missing_tools+=("docker")

    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        exit 1
    fi

    if ! detect_compose; then
        exit 1
    fi

    if ! can_probe_http; then
        log_warn "Neither curl nor wget found; readiness checks will use open-port detection"
    fi

    load_env_file
    configure_test_credentials
    echo "============================================================"
    echo "  E_SforuTraders - Starting Development Environment"
    echo "============================================================"
    echo ""

    # Check prerequisites
    ensure_docker_running || exit 1

    # Start services
    start_postgres || exit 1
    start_backend || exit 1
    start_frontend || exit 1

    # Show status
    show_status
}

# Run main function
main "$@"
