#!/bin/bash
echo "========================================================================="
echo " ATEM WEB MANAGER - INITIALIZING (v2.22.0)"
echo "========================================================================="

# 1. Smart Project Location & Auto-Cloning
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ ! -f "$PROJECT_ROOT/package.json" ]; then
    PROJECT_ROOT="$(pwd)"
    if [ ! -f "$PROJECT_ROOT/package.json" ]; then
        echo "[INFO] The ATEM_WEB_MANAGER project was not found in this directory."
        read -p "Paste your GitHub repository URL to clone it now (or leave blank to cancel): " REPO_URL
        if [ -z "$REPO_URL" ]; then
            echo "[ABORT] No URL provided."
            exit 1
        fi
        echo "[INFO] Cloning repository..."
        git clone "$REPO_URL" ATEM_WEB_MANAGER
        PROJECT_ROOT="$(pwd)/ATEM_WEB_MANAGER"
    fi
fi

cd "$PROJECT_ROOT" || exit

# 2. Check and Install Dependencies
if [ ! -d "node_modules" ]; then
    echo "[INFO] Installing frontend dependencies..."
    npm install
fi

if [ ! -d "bridge/node_modules" ]; then
    echo "[INFO] Installing hardware bridge dependencies..."
    cd bridge || exit
    npm install
    cd ..
fi

# 3. Terminate Lingering Bridge Processes on Port 8080
echo "[INFO] Cleaning up lingering bridge services..."
PIDS=$(lsof -t -i:8080)
if [ ! -z "$PIDS" ]; then
    kill -9 $PIDS
fi

# 4. Launch Hardware Bridge in Background
echo "[INFO] Starting ATEM Hardware Bridge (Background Daemon)..."
nohup node bridge/server.js > /dev/null 2>&1 &

# 5. Launch Vite UI
echo "[INFO] Starting Vite UI Application..."
npm run dev