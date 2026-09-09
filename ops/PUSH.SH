#!/usr/bin/env bash
# =========================================================================
# ATEM WEB MANAGER - MACOS QUICK PUSH UTILITY (v2.05)
# =========================================================================
clear
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.." || exit

echo "================================================================="
echo "       ATEM WEB MANAGER - QUICK PUSH TO GITHUB (v2.05)"
echo "================================================================="

git status
echo ""
read -p "Enter your commit message: " COMMIT_MSG
COMMIT_MSG="${COMMIT_MSG:-fix: project update}"

echo "[*] Staging all changes..."
git add -A

echo "[*] Committing with message: '$COMMIT_MSG'..."
git commit -m "$COMMIT_MSG"

echo "[*] Pushing to GitHub (main branch)..."
git push origin main

echo "================================================================="
echo "   SUCCESSFULLY PUSHED TO GITHUB!"
echo "================================================================="