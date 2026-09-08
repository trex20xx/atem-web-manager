#!/usr/bin/env bash
# =========================================================================
# ATEM WEB MANAGER - FULL FOLDER DESTRUCTION WIPE UTILITY (v1.95)
# =========================================================================
clear
echo "================================================================="
echo "       ATEM WEB MANAGER - FULL WORKSPACE ERASURE"
echo "================================================================="

TARGET_DIR="./ATEM_WEB_MANAGER"
SAFETY_TOKEN_FILE="$TARGET_DIR/.atem_workspace_token"
SECRET_KEY="ATEM_MANAGER_SECURE_WIPE_KEY_2026"

if [ ! -d "$TARGET_DIR" ]; then
    echo "[X] ERROR: Target folder '$TARGET_DIR' does not exist!"
    exit 1
fi

echo "[*] Verifying safety token inside $TARGET_DIR..."

if [ ! -f "$SAFETY_TOKEN_FILE" ]; then
    echo "[X] ERROR: Safety token missing in target folder! Aborting to protect system."
    exit 1
fi

TOKEN_CONTENT=$(cat "$SAFETY_TOKEN_FILE" | tr -d '[:space:]')
if [ "$TOKEN_CONTENT" != "$SECRET_KEY" ]; then
    echo "[X] ERROR: Safety token mismatch! Aborting."
    exit 1
fi

echo "[✓] Safety token verified."
echo "[!] WARNING: You are about to COMPLETELY DELETE the entire folder:"
echo "    $(cd "$TARGET_DIR" && pwd)"
read -p "Are you sure? This cannot be undone! (y/N): " CONFIRM

if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "[*] Erasing entire project directory..."
    
    # Forcefully and completely removes the folder and all its contents
    rm -rf "$TARGET_DIR"

    echo "================================================================="
    echo "   FOLDER DESTRUCTION COMPLETE."
    echo "   ATEM_WEB_MANAGER has been completely wiped from disk."
    echo "================================================================="
else
    echo "[*] Wipe aborted."
fi