#!/bin/bash
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT" || exit

echo "========================================================================="
echo " ATEM WEB MANAGER - GITHUB AUTO PUSH (v2.22.0)"
echo "========================================================================="
echo ""
read -p "Enter your commit description: " desc

git add -A
git commit -m "$desc"
git push -u origin main

echo ""
echo "[SUCCESS] Code safely pushed to GitHub!"