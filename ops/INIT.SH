#!/bin/bash
echo "========================================================================="
echo " ATEM WEB MANAGER - INITIALIZING (v2.30.0)"
echo "========================================================================="

# Hardcoded GitHub Repository Address
REPO_URL="https://github.com/robertmirt/ATEM_WEB_MANAGER.git"

# 1. Smart Project Location & Auto-Cloning
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ ! -f "$PROJECT_ROOT/package.json" ]; then
    PROJECT_ROOT="$(pwd)"
    if [ ! -f "$PROJECT_ROOT/package.json" ]; then
        echo "[INFO] The ATEM_WEB_MANAGER project was not found in this directory."
        read -p "Enter full path to install ATEM WEB MANAGER (e.g. ~/Desktop): " INSTALL_DIR
        if [ -z "$INSTALL_DIR" ]; then
            echo "[ABORT] No directory provided."
            exit 1
        fi
        
        # Verify Git
        if ! command -v git &> /dev/null; then
            echo "[ERROR] Git is not installed or not in PATH."
            exit 1
        fi

        eval INSTALL_DIR="$INSTALL_DIR" # Resolve tilde (~) to home directory
        mkdir -p "$INSTALL_DIR"
        cd "$INSTALL_DIR" || exit
        echo "[INFO] Cloning 'main' branch from $REPO_URL..."
        git clone -b main "$REPO_URL" ATEM_WEB_MANAGER
        PROJECT_ROOT="$(pwd)/ATEM_WEB_MANAGER"
    fi
fi

# 2. Check and Install Root Dependencies
cd "$PROJECT_ROOT" || exit

if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed or not in PATH."
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "[INFO] Installing frontend dependencies..."
    npm install
fi

# 3. Check and Install Bridge Dependencies
cd "$PROJECT_ROOT/bridge" || exit
if [ ! -d "node_modules" ]; then
    echo "[INFO] Installing hardware bridge dependencies..."
    npm install
fi

# 4. Terminate Lingering Bridge Processes on Port 8080
echo "[INFO] Cleaning up lingering bridge services..."
PIDS=$(lsof -t -i:8080)
if [ ! -z "$PIDS" ]; then
    kill -9 $PIDS
fi

# 5. Launch Hardware Bridge in Background (from absolute bridge directory)
echo "[INFO] Starting ATEM Hardware Bridge (Background Daemon)..."
cd "$PROJECT_ROOT/bridge" || exit
nohup node server.js > /dev/null 2>&1 &

# 6. Launch Vite UI (from absolute project root)
cd "$PROJECT_ROOT" || exit
echo "[INFO] Starting Vite UI Application..."
npm run dev