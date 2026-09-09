#!/usr/bin/env bash
# =========================================================================
# ATEM WEB MANAGER - MACOS SECURE WORKSPACE WIPE UTILITY (v2.05)
# =========================================================================
clear
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

SAFETY_TOKEN_FILE="$PROJECT_ROOT/.atem_workspace_token"
SECRET_KEY="ATEM_MANAGER_SECURE_WIPE_KEY_2026"

echo "================================================================="
echo "       ATEM WEB MANAGER - SECURE WORKSPACE ERASURE (v2.05)"
echo "================================================================="
echo "[*] Verifying safety token in: $PROJECT_ROOT"

if [ ! -f "$SAFETY_TOKEN_FILE" ]; then
    echo "[X] ERROR: Safety token missing in $PROJECT_ROOT! Aborting."
    exit 1
fi

TOKEN_CONTENT=$(tr -d '[:space:]' < "$SAFETY_TOKEN_FILE")
if [ "$TOKEN_CONTENT" != "$SECRET_KEY" ]; then
    echo "[X] ERROR: Safety token mismatch! Aborting."
    exit 1
fi

echo "[✓] Safety token verified."
echo "[!] WARNING: You are about to COMPLETELY DELETE the project folder:"
echo "    $PROJECT_ROOT"
read -p "Are you sure? This cannot be undone! (y/N): " CONFIRM

if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "[*] Erasing project directory..."
    cd "$PROJECT_ROOT/.." || exit
    rm -rf "$PROJECT_ROOT"
    echo "================================================================="
    echo "   FOLDER DESTRUCTION COMPLETE. Project successfully erased."
    echo "================================================================="
else
    echo "[*] Wipe aborted."
fi