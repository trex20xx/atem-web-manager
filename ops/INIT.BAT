@echo off
title ATEM WEB MANAGER - BOOTSTRAPPER (v2.17.0)
cd /d "%~dp0\.."

echo =========================================================================
echo  ATEM WEB MANAGER - INITIALIZING (v2.17.0)
echo =========================================================================
echo.

:: 1. Verify Node.js Environment
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: 2. Check and Install Root Dependencies
if not exist "node_modules\" (
    echo [INFO] Installing frontend dependencies...
    call npm install
)

:: 3. Check and Install Bridge Dependencies
if not exist "bridge\node_modules\" (
    echo [INFO] Installing hardware bridge dependencies...
    cd bridge
    call npm install
    cd ..
)

:: 4. Terminate Any Lingering Bridge Processes on Port 8080
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080" ^| find "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>nul
)

:: 5. Launch Hardware Bridge COMPLETELY HIDDEN in Background (No Second Window)
echo [INFO] Starting ATEM Hardware Bridge (Background Daemon)...
powershell -NoProfile -WindowStyle Hidden -Command "Start-Process node -ArgumentList 'bridge\server.js' -WindowStyle Hidden"

:: 6. Launch Vite Development Server in Current Console
echo [INFO] Starting Vite UI Application...
echo.
call npm run dev

pause