#!/usr/bin/env bash
# =========================================================================
# ATEM WEB MANAGER - UNIVERSAL MACOS MASTER INIT SCRIPT (v1.85)
# =========================================================================
clear
echo "================================================================="
echo "       ATEM WEB MANAGER - MACOS AUTOMATED INSTALLER"
echo "================================================================="

# 1. Prompt for installation directory
DEFAULT_DIR="/Users/$(whoami)/Downloads/VSCODE/PROGRAMMING/ATEM_WEB_MANAGER"
read -p "Enter target installation path [$DEFAULT_DIR]: " INSTALL_DIR
INSTALL_DIR="${INSTALL_DIR:-$DEFAULT_DIR}"

echo "[*] Setting up workspace at: $INSTALL_DIR"
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR" || exit

# 2. Request sudo upfront for silent installs if tools are missing
echo "[*] Verifying administrative permissions (sudo password may be required)..."
sudo -v
while true; do sudo -n true; sleep 60; kill -0 "$$" || exit; done 2>/dev/null &

# 3. Check & Install Git
if ! command -v git &> /dev/null; then
    echo "[!] Git not found. Installing Xcode Command Line Tools..."
    xcode-select --install || echo "[*] Please complete the popup installation window."
else
    echo "[✓] Git is ready."
fi

# 4. Check & Install Node.js & npm
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    echo "[!] Node.js not found. Installing via Homebrew..."
    if ! command -v brew &> /dev/null; then
        echo "[*] Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    brew install node
else
    echo "[✓] Node.js ($(node -v)) and npm are ready."
fi

# 5. Repository Setup / Pull
if [ -d ".git" ]; then
    echo "[*] Existing Git repository detected. Pulling latest code..."
    git pull origin main || echo "[*] Offline or manual pull required."
else
    echo "[*] Initializing local repository..."
    git init
fi

# 6. Install Main App Dependencies
if [ -f "package.json" ]; then
    echo "[*] Installing main application packages..."
    npm install
else
    echo "[!] Warning: package.json missing in root. Ensure files are populated."
fi

# 7. Install ATEM Bridge Dependencies
if [ -d "bridge" ] && [ -f "bridge/package.json" ]; then
    echo "[*] Installing embedded ATEM hardware bridge packages..."
    cd bridge && npm install && cd ..
fi

echo "================================================================="
echo "   INSTALLATION SUCCESSFUL!"
echo "   To start the app and local bridge simultaneously, run:"
echo "   npm run dev"
echo "================================================================="