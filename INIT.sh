#!/usr/bin/env bash
# =========================================================================
# ATEM WEB MANAGER - MACOS AUTOMATED BOOTSTRAPPER & LAUNCHER (v1.91)
# =========================================================================
clear
echo "================================================================="
echo "       ATEM WEB MANAGER - MACOS AUTOMATED BOOTSTRAPPER"
echo "================================================================="

GITHUB_REPO="https://github.com/trex20xx/atem-web-manager.git"
DEFAULT_DIR="/Users/$(whoami)/Downloads/VSCODE/PROGRAMMING/ATEM_WEB_MANAGER"

read -p "Enter target installation path [$DEFAULT_DIR]: " INSTALL_DIR
INSTALL_DIR="${INSTALL_DIR:-$DEFAULT_DIR}"

echo "[*] Setting up workspace at: $INSTALL_DIR"
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR" || exit

# If package.json doesn't exist, we need to pull code down
if [ ! -f "package.json" ]; then
    echo "[*] Project source files missing. Downloading from GitHub..."
    
    # Temporarily move INIT.sh out of the folder so git clone can use '.'
    if [ -f "INIT.sh" ]; then
        mv INIT.sh ../_INIT_TEMP.sh
    fi
    
    # Clone repository into current directory
    git clone "$GITHUB_REPO" .
    
    # Move INIT.sh back into the workspace
    if [ -f "../_INIT_TEMP.sh" ]; then
        mv ../_INIT_TEMP.sh ./INIT.sh
        chmod +x INIT.sh
    fi
else
    echo "[*] Existing project found. Pulling latest updates..."
    git pull origin main
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
    echo "[X] Error: package.json still missing."
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