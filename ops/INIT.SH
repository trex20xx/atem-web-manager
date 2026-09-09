#!/usr/bin/env bash
# =========================================================================
# ATEM WEB MANAGER - MACOS AUTOMATED BOOTSTRAPPER & LAUNCHER (v2.05)
# =========================================================================
clear
echo "================================================================="
echo "       ATEM WEB MANAGER - MACOS BOOTSTRAPPER (v2.05)"
echo "================================================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR/.."
cd "$PROJECT_ROOT" || exit

# 1. Verify Git
if ! command -v git &> /dev/null; then
    echo "[!] Git is not installed. Triggering Xcode Command Line Tools..."
    xcode-select --install
    exit 1
else
    echo "[✓] Git is ready: $(git --version)"
fi

# 2. Verify Node.js & npm
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    echo "[!] Node.js/npm not found. Installing via Homebrew..."
    if ! command -v brew &> /dev/null; then
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        [ -d "/opt/homebrew/bin" ] && eval "$(/opt/homebrew/bin/brew shellenv)"
        [ -d "/usr/local/bin" ] && eval "$(/usr/local/bin/brew shellenv)"
    fi
    brew install node
else
    echo "[✓] Node.js ($(node -v)) and npm ($(npm -v)) are ready."
fi

# 3. Install Frontend Dependencies
if [ -f "package.json" ]; then
    echo "[*] Installing frontend application dependencies..."
    npm install
else
    echo "[X] Error: package.json missing in project root."
    exit 1
fi

# 4. Install Embedded Bridge Dependencies
if [ -d "bridge" ] && [ -f "bridge/package.json" ]; then
    echo "[*] Installing ATEM hardware bridge dependencies..."
    cd bridge && npm install && cd "$PROJECT_ROOT" || exit
fi

echo "================================================================="
echo "   LAUNCHING ATEM BRIDGE & FRONTEND DEVELOPMENT SERVER..."
echo "================================================================="

# 5. Launch ATEM Bridge Daemon in background (matching Windows start)
if [ -f "bridge/server.js" ]; then
    echo "[*] Starting ATEM Hardware Bridge daemon on ws://localhost:8080..."
    node bridge/server.js &
    BRIDGE_PID=$!
    trap 'kill $BRIDGE_PID 2>/dev/null' EXIT
fi

# 6. Launch Vite Development Server
npm run dev