#!/bin/bash
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT" || exit

echo "========================================================================="
echo " ATEM WEB MANAGER - SECURE WORKSPACE WIPE (v2.23.0)"
echo "========================================================================="
echo ""

TOKEN_FILE=".atem_workspace_token"
EXPECTED_KEY="ATEM_MANAGER_SECURE_WIPE_KEY_2026"

# 1. Verify Token Existence
if [ ! -f "$TOKEN_FILE" ]; then
    echo "[ERROR] Security token file '$TOKEN_FILE' not found! Aborting to protect drive."
    exit 1
fi

# 2. Verify Token Contents
FILE_KEY=$(cat "$TOKEN_FILE")
if [ "$FILE_KEY" != "$EXPECTED_KEY" ]; then
    echo "[ERROR] Token mismatch! Secure wipe aborted."
    exit 1
fi

echo "[WARNING] Security token verified."
echo "The ENTIRE project folder will be PERMANENTLY DELETED."
echo "Target: $PROJECT_ROOT"
echo ""
read -p "Press Enter to execute or Ctrl+C to abort..."

echo "[INFO] Terminating active processes..."
PIDS=$(lsof -t -i:8080 -i:5173)
if [ ! -z "$PIDS" ]; then kill -9 $PIDS; fi

echo "[INFO] Deleting $PROJECT_ROOT..."
# Jump to temp to prevent "Device or resource busy"
cd /tmp || exit
rm -rf "$PROJECT_ROOT"

echo "[SUCCESS] Secure wipe complete. ATEM_WEB_MANAGER has been deleted."