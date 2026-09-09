#!/bin/bash
echo "========================================================================="
echo " ATEM WEB MANAGER - STOPPING BACKGROUND SERVICES (v2.22.0)"
echo "========================================================================="
echo ""

echo "[INFO] Hunting for hidden ATEM Bridge processes on Port 8080..."
PIDS=$(lsof -t -i:8080)

if [ -z "$PIDS" ]; then
    echo "[INFO] No hidden bridge server was found running."
else
    kill -9 $PIDS
    echo "[SUCCESS] Hidden background bridge server has been terminated."
fi