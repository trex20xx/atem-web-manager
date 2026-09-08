#!/usr/bin/env bash
# =========================================================================
# ATEM WEB MANAGER - MACOS AUTOMATED BOOTSTRAPPER & LAUNCHER (v1.95)
# =========================================================================
clear
echo "================================================================="
echo "       ATEM WEB MANAGER - BRAND NEW MACHINE BOOTSTRAPPER"
echo "================================================================="

GITHUB_REPO="https://github.com/trex20xx/atem-web-manager.git"
DEFAULT_DIR="/Users/$(whoami)/Downloads/VSCODE/PROGRAMMING/ATEM_WEB_MANAGER"

read -p "Enter target installation path [$DEFAULT_DIR]: " INSTALL_DIR
INSTALL_DIR="${INSTALL_DIR:-$DEFAULT_DIR}"

echo "[*] Setting up workspace at: $INSTALL_DIR"
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR" || exit

# If folder already exists but is missing package.json or git configuration, clean it so git clone works
if [ -d ".git" ]; then
    echo "[*] Existing repository found. Pulling latest updates..."
    git pull origin main
else
    # Folder exists (might be empty from a prior mkdir) but isn't a git repo yet
    if [ "$(ls -A "$INSTALL_DIR")" ]; then
        echo "[!] Directory is not empty. Cleaning contents for a fresh clone..."
        rm -rf ./* ./.[!.]* .??* 2>/dev/null
    fi
    
    echo "[*] Cloning repository from GitHub..."
    git clone "$GITHUB_REPO" .
fi

# Check for Git
if ! command -v git &> /dev/null; then
    echo "[!] Git is not installed. Installing Xcode Command Line Tools..."
    xcode-select --install
    exit 1
else
    echo "[✓] Git is ready."
fi

# Check for Node.js & npm
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    echo "[!] Node.js/npm not found. Installing Homebrew & Node.js..."
    if ! command -v brew &> /dev/null; then
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
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

# Install Frontend Dependencies
if [ -f "package.json" ]; then
    echo "[*] Installing frontend application dependencies..."
    npm install
else
    echo "[X] Error: package.json missing."
    exit 1
fi

# Install Embedded ATEM Bridge Dependencies
if [ -d "bridge" ] && [ -f "bridge/package.json" ]; then
    echo "[*] Installing embedded ATEM hardware bridge dependencies..."
    cd bridge && npm install && cd ..
fi

echo "================================================================="
echo "   BOOTSTRAP COMPLETE! LAUNCHING DEVELOPMENT SERVER..."
echo "================================================================="

npm run dev