#!/usr/bin/env bash
# Scar Alpha Frontend — build + run with PM2
#
# On VPS:
#   cd /home/web/front
#   cp .env.production.example .env.production   # set API URL
#   chmod +x start-frontend-pm2.sh
#   ./start-frontend-pm2.sh
#
# Commands:
#   ./start-frontend-pm2.sh           # build + start/restart
#   ./start-frontend-pm2.sh restart   # restart only (no rebuild)
#   ./start-frontend-pm2.sh stop
#   ./start-frontend-pm2.sh delete
#   ./start-frontend-pm2.sh logs
#   ./start-frontend-pm2.sh status
#   ./start-frontend-pm2.sh build

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

APP_NAME="scaralpha-front"
LOG_DIR="$ROOT/logs"
FRONT_PORT="${FRONT_PORT:-4173}"

die() { echo "ERROR: $*" >&2; exit 1; }
info() { echo "==> $*"; }
ok() { echo "OK: $*"; }
need() { command -v "$1" >/dev/null 2>&1; }

ensure_node() {
  need node || die "node missing — install Node 20 first"
  need npm || die "npm missing — install Node 20 first"
}

ensure_pm2() {
  if need pm2; then
    return 0
  fi
  info "Installing PM2 globally..."
  npm install -g pm2
  need pm2 || die "pm2 install failed"
}

load_api_base() {
  # Prefer .env.production for Vite build
  if [[ -f "$ROOT/.env.production" ]]; then
    info "Using $ROOT/.env.production for build"
    # Export VITE_* for the build process (Vite also reads the file itself)
    set -a
    # shellcheck disable=SC1091
    source "$ROOT/.env.production"
    set +a
  elif [[ -f "$ROOT/.env" ]]; then
    info "Using $ROOT/.env for build"
    set -a
    # shellcheck disable=SC1091
    source "$ROOT/.env"
    set +a
  fi

  if [[ -z "${VITE_API_BASE_URL:-}" ]]; then
    echo "WARN: VITE_API_BASE_URL empty — production build may fail or use wrong API host."
    echo "      Set it in .env.production e.g. VITE_API_BASE_URL=https://www.scaralphaai.com"
  else
    ok "VITE_API_BASE_URL=${VITE_API_BASE_URL}"
  fi

  export FRONT_PORT
}

install_deps() {
  info "npm install..."
  npm install
  # Static server for dist
  if ! npm ls serve >/dev/null 2>&1; then
    npm install --save-dev serve
  fi
}

build_front() {
  ensure_node
  mkdir -p "$LOG_DIR"
  install_deps
  info "Building frontend (vite)..."
  npm run build
  [[ -d "$ROOT/dist" ]] || die "dist/ missing after build"
  ok "Build done → $ROOT/dist"
}

pm2_start_or_restart() {
  ensure_pm2
  mkdir -p "$LOG_DIR"
  export FRONT_PORT

  if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
    info "Recreating PM2 app: $APP_NAME"
    pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
  fi

  info "Starting PM2 app: $APP_NAME on 0.0.0.0:${FRONT_PORT}"
  pm2 start "$ROOT/ecosystem.config.cjs" --update-env
  pm2 save
  ok "Frontend PM2 running"
  sleep 1
  if curl -fsS "http://127.0.0.1:${FRONT_PORT}/" >/dev/null 2>&1; then
    ok "Frontend OK → http://127.0.0.1:${FRONT_PORT}/"
  else
    echo "WARN: frontend not responding yet — check: pm2 logs $APP_NAME"
  fi
}

main() {
  local cmd="${1:-start}"
  load_api_base

  case "$cmd" in
    start|"")
      build_front
      pm2_start_or_restart
      echo ""
      echo "Frontend: http://0.0.0.0:${FRONT_PORT}/"
      echo "API base: ${VITE_API_BASE_URL:-'(empty / same-origin)'}"
      echo "Logs:     pm2 logs $APP_NAME"
      ;;
    restart)
      ensure_pm2
      export FRONT_PORT
      if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
        pm2 restart "$APP_NAME" --update-env
      else
        build_front
        pm2_start_or_restart
      fi
      ;;
    stop)
      ensure_pm2
      pm2 stop "$APP_NAME" || true
      ;;
    delete|rm)
      ensure_pm2
      pm2 delete "$APP_NAME" || true
      pm2 save || true
      ;;
    logs)
      ensure_pm2
      pm2 logs "$APP_NAME"
      ;;
    status|list)
      ensure_pm2
      pm2 status
      curl -fsSI "http://127.0.0.1:${FRONT_PORT}/" | head -n 5 || echo "front: down"
      ;;
    build)
      build_front
      ;;
    help|-h|--help)
      sed -n '1,20p' "$0"
      ;;
    *)
      die "Unknown command: $cmd (start|restart|stop|logs|status|build)"
      ;;
  esac
}

main "${1:-start}"
