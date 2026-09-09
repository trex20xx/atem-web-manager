#!/bin/bash
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT" || exit

echo "========================================================================="
echo " ATEM WEB MANAGER - DEEP CLEAN WORKSPACE (v2.22.0)"
echo "========================================================================="
echo "[WARNING] This will safely delete all generated node_modules, cache,"
echo "and dist builds to fix dependency errors."
echo ""
echo "Your source code and .git repository will REMAIN SAFE."
echo ""
read -p "Press Enter to continue or Ctrl+C to abort..."

echo "[INFO] Wiping Root node_modules..."
rm -rf node_modules package-lock.json

echo "[INFO] Wiping Bridge node_modules..."
rm -rf bridge/node_modules bridge/package-lock.json

echo "[INFO] Wiping Dist builds..."
rm -rf dist

echo ""
echo "[SUCCESS] Workspace deep cleaned successfully! Run INIT.SH to rebuild."