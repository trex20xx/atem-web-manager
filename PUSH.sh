#!/usr/bin/env bash
# =========================================================================
# ATEM WEB MANAGER - INSTANT GIT PUSH UTILITY (v1.92)
# =========================================================================
clear
echo "================================================================="
echo "       ATEM WEB MANAGER - QUICK PUSH TO GITHUB"
echo "================================================================="

# Show current git status so you know what files changed
git status

echo ""
read -p "Enter your commit message: " COMMIT_MSG

if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="fix: rapid troubleshooting update"
fi

echo "[*] Staging all changes..."
git add -A

echo "[*] Committing with message: '$COMMIT_MSG'..."
git commit -m "$COMMIT_MSG"

echo "[*] Pushing to GitHub (main branch)..."
git push origin main

echo "================================================================="
echo "   SUCCESSFULLY PUSHED TO GITHUB!"
echo "================================================================="