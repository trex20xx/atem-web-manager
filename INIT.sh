#!/usr/bin/env bash
# =========================================================================
# ATEM WEB MANAGER - ONE-LINER FRESH MACHINE BOOTSTRAPPER (v1.88)
# =========================================================================
clear
echo "================================================================="
echo "       ATEM WEB MANAGER - BRAND NEW MACHINE BOOTSTRAPPER"
echo "================================================================="

GITHUB_REPO="https://github.com/trex20xx/atem-web-manager.git"
DEFAULT_DIR="/Users/$(whoami)/Downloads/VSCODE/PROGRAMMING/ATEM_WEB_MANAGER"

# 1. Prompt for installation directory
read -p "Enter target installation path [$DEFAULT_DIR]: " INSTALL_DIR
INSTALL_DIR="${INSTALL_DIR:-$DEFAULT_DIR}"

echo "[*] Setting up workspace at: $INSTALL_DIR"
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR" || exit

# 2. Fresh Machine Clone (Handles .git initialization automatically)
if [ ! -d ".git" ]; then
    echo "[*] Fresh machine detected. Cloning repository (including .git history)..."
    git clone "$GITHUB_REPO" .
else
    echo "[*] Repository already exists here. Pulling latest updates..."
    git pull origin main
fi

# 3. Check & Install Git (Crucial for fresh Macs)
if ! command -v git &> /dev/null; then
    echo "[!] Git is not installed. Installing Xcode Command Line Tools..."
    xcode-select --install
    echo "[!] Please complete the Xcode command line tools prompt, then re-run this script."
    exit 1
else
    echo "[✓] Git is ready."
fi

# 4. Check & Install Node.js & npm (Crucial for fresh Macs)
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    echo "[!] Node.js/npm not found. Installing Homebrew & Node.js..."
    if ! command -v brew &> /dev/null; then
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        # Add Homebrew to Apple Silicon / Intel path dynamically
        if [ -d "/opt/homebrew/bin" ]; then
            eval "$(/opt/homebrew/bin/brew shellenv)"
        elif [ -d "/usr/local/bin" ]; then
            eval "$(/usr/local/bin/brew shellenv)"
        fi
    fi
    brew install node
else
    echo "[✓] Node.js ($(node -v)) and npm are ready."
fi

# 5. Install Main App Dependencies
if [ -f "package.json" ]; then
    echo "[*] Installing frontend application dependencies..."
    npm install
else
    echo "[X] Error: package.json missing. Clone may have failed."
    exit 1
fi

# 6. Install Embedded ATEM Bridge Dependencies
if [ -d "bridge" ] && [ -f "bridge/package.json" ]; then
    echo "[*] Installing embedded ATEM hardware bridge dependencies..."
    cd bridge && npm install && cd ..
fi

echo "================================================================="
echo "   BOOTSTRAP COMPLETE! YOUR WORKSPACE IS FULLY CONFIGURED."
echo "   To start developing, run:"
echo "   cd $INSTALL_DIR && npm run dev"
echo "================================================================="