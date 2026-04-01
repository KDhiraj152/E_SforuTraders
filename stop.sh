#!/usr/bin/env bash
# ============================================================================
# stop.sh - E_SforuTraders Development Server Stop Script
# ============================================================================
# Stops all development services:
# - Frontend (Vite)
# - Backend (Spring Boot)
# - PostgreSQL (Docker) - optional with -a flag
#
# Usage:
#   ./stop.sh       Stop services but keep database data
#   ./stop.sh -a    Stop services and remove database volumes
#   ./stop.sh -f    Force stop (kill processes even if PID files missing)
# ============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

ENV_FILE=".env.local"
COMPOSE_BASE=()

LOG_DIR="logs"

# Configuration
BACKEND_PORT=8080
FRONTEND_PORT=5173

# Flags
REMOVE_VOLUMES=false
FORCE_STOP=false

# Logging functions
log_info() { echo -e "${BLUE}[stop]${NC} $1"; }
log_success() { echo -e "${GREEN}[stop]${NC} ✓ $1"; }
log_warn() { echo -e "${YELLOW}[stop]${NC} ⚠ $1"; }
log_error() { echo -e "${RED}[stop]${NC} ✗ $1"; }

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

# Stop a process gracefully, then forcefully if needed
stop_process() {
    local pid=$1
    local name=$2
    local timeout=${3:-10}

    if ! kill -0 "$pid" 2>/dev/null; then
        log_info "$name process (PID: $pid) not running"
        return 0
    fi

    log_info "Stopping $name (PID: $pid)..."

    if [[ "$FORCE_STOP" == "true" ]]; then
        kill -9 "$pid" 2>/dev/null || true
        sleep 1
        if kill -0 "$pid" 2>/dev/null; then
            log_error "Failed to force stop $name (PID: $pid)"
            return 1
        fi
        log_success "$name force-stopped"
        return 0
    fi

    # First try SIGTERM
    kill "$pid" 2>/dev/null || true

    # Wait for graceful shutdown
    local count=0
    while kill -0 "$pid" 2>/dev/null && [[ $count -lt $timeout ]]; do
        sleep 1
        count=$((count + 1))
        echo -n "."
    done
    echo ""

    # Force kill if still running
    if kill -0 "$pid" 2>/dev/null; then
        log_warn "$name didn't stop gracefully, force killing..."
        kill -9 "$pid" 2>/dev/null || true
        sleep 1
    fi

    if kill -0 "$pid" 2>/dev/null; then
        log_error "Failed to stop $name (PID: $pid)"
        return 1
    fi

    log_success "$name stopped"
}

# Stop backend
stop_backend() {
    log_info "Stopping backend (Spring Boot)..."

    local backend_pid=""

    # Try PID file first
    if [[ -f "$LOG_DIR/backend.pid" ]]; then
        backend_pid=$(cat "$LOG_DIR/backend.pid")
        rm -f "$LOG_DIR/backend.pid"
    fi

    # If PID from file is not running or doesn't exist, check port
    if [[ -z "$backend_pid" ]] || ! kill -0 "$backend_pid" 2>/dev/null; then
        if is_port_in_use $BACKEND_PORT; then
            backend_pid=$(get_port_pid $BACKEND_PORT)
        fi
    fi

    if [[ -n "$backend_pid" ]]; then
        stop_process "$backend_pid" "Backend" 15
        
        # Also kill any child Java processes (Maven spawns the actual app)
        if is_port_in_use $BACKEND_PORT; then
            local actual_pid
            actual_pid=$(get_port_pid $BACKEND_PORT)
            if [[ -n "$actual_pid" ]]; then
                stop_process "$actual_pid" "Backend (child)" 10
            fi
        fi
    else
        log_info "Backend not running"
    fi
}

# Stop frontend
stop_frontend() {
    log_info "Stopping frontend (Vite)..."

    local frontend_pid=""

    # Try PID file first
    if [[ -f "$LOG_DIR/frontend.pid" ]]; then
        frontend_pid=$(cat "$LOG_DIR/frontend.pid")
        rm -f "$LOG_DIR/frontend.pid"
    fi

    # If PID from file is not running or doesn't exist, check port
    if [[ -z "$frontend_pid" ]] || ! kill -0 "$frontend_pid" 2>/dev/null; then
        if is_port_in_use $FRONTEND_PORT; then
            frontend_pid=$(get_port_pid $FRONTEND_PORT)
        fi
    fi

    if [[ -n "$frontend_pid" ]]; then
        stop_process "$frontend_pid" "Frontend" 10
        
        # Also kill any child Node processes
        if is_port_in_use $FRONTEND_PORT; then
            local actual_pid
            actual_pid=$(get_port_pid $FRONTEND_PORT)
            if [[ -n "$actual_pid" ]]; then
                stop_process "$actual_pid" "Frontend (child)" 5
            fi
        fi
    else
        log_info "Frontend not running"
    fi
}

# Stop Docker containers
stop_docker() {
    log_info "Stopping Docker containers..."

    if ! docker info >/dev/null 2>&1; then
        log_warn "Docker is not running"
        return 0
    fi

    if [[ "$REMOVE_VOLUMES" == "true" ]]; then
        log_warn "Removing containers AND volumes (data will be lost)..."
        compose_cmd down -v > "$LOG_DIR/docker-compose-down.log" 2>&1 || true
        log_success "Docker containers and volumes removed"
    else
        compose_cmd down > "$LOG_DIR/docker-compose-down.log" 2>&1 || true
        log_success "Docker containers stopped (volumes preserved)"
    fi
}

# Show final status
show_status() {
    echo ""
    echo "============================================================"
    echo "  Service Status"
    echo "============================================================"
    
    local all_stopped=true

    # Check PostgreSQL
    if compose_cmd ps postgres 2>/dev/null | grep -q "running"; then
        echo -e "  ${YELLOW}●${NC} PostgreSQL      : Still running"
        all_stopped=false
    else
        echo -e "  ${GREEN}○${NC} PostgreSQL      : Stopped"
    fi

    # Check Backend
    if is_port_in_use $BACKEND_PORT; then
        echo -e "  ${YELLOW}●${NC} Backend         : Still running on port $BACKEND_PORT"
        all_stopped=false
    else
        echo -e "  ${GREEN}○${NC} Backend         : Stopped"
    fi

    # Check Frontend
    if is_port_in_use $FRONTEND_PORT; then
        echo -e "  ${YELLOW}●${NC} Frontend        : Still running on port $FRONTEND_PORT"
        all_stopped=false
    else
        echo -e "  ${GREEN}○${NC} Frontend        : Stopped"
    fi

    echo ""
    
    if [[ "$all_stopped" == "true" ]]; then
        log_success "All services stopped successfully"
    else
        log_warn "Some services may still be running"
    fi
    
    echo ""
}

# Parse arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -a|--all)
                REMOVE_VOLUMES=true
                shift
                ;;
            -f|--force)
                FORCE_STOP=true
                shift
                ;;
            -h|--help)
                echo "Usage: ./stop.sh [options]"
                echo ""
                echo "Options:"
                echo "  -a, --all     Stop services and remove database volumes"
                echo "  -f, --force   Force stop even without PID files"
                echo "  -h, --help    Show this help message"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                echo "Use -h for help"
                exit 1
                ;;
        esac
    done
}

# Main function
main() {
    parse_args "$@"

    echo ""
    echo "============================================================"
    echo "  E_SforuTraders - Stopping Development Environment"
    echo "============================================================"
    echo ""

    if ! detect_compose; then
        exit 1
    fi

    # Stop in reverse order (frontend -> backend -> database)
    stop_frontend
    stop_backend
    stop_docker

    # Show final status
    show_status
}

# Run main function
main "$@"
