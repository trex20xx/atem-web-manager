#!/usr/bin/env bash
# =========================================================================
# ATEM WEB MANAGER - EXTERNAL SAFE WIPE UTILITY (v1.94)
# =========================================================================
clear
echo "================================================================="
echo "       ATEM WEB MANAGER - EXTERNAL WORKSPACE WIPE"
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
echo "[!] WARNING: You are about to completely wipe: $(cd "$TARGET_DIR" && pwd)"
read -p "Are you sure? (y/N): " CONFIRM

if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "[*] Wiping target contents..."
    
    # Deletes everything inside ATEM_WEB_MANAGER except the token file and .git folder 
    # (so Git history remains intact and it doesn't throw directory-already-exists errors)
    find "$TARGET_DIR" -mindepth 1 ! -name ".atem_workspace_token" ! -path "$TARGET_DIR/.git*" -exec rm -rf {} + 2>/dev/null

    echo "================================================================="
    echo "   WIPE COMPLETE. Run 'git pull origin main' inside the folder "
    echo "   to instantly restore everything fresh from GitHub!"
    echo "================================================================="
else
    echo "[*] Wipe aborted."
fi