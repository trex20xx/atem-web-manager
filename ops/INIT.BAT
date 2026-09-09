@echo off
setlocal EnableDelayedExpansion
title ATEM WEB MANAGER - BOOTSTRAPPER (v2.22.0)

:: 1. Smart Project Location & Auto-Cloning
set "PROJECT_ROOT=%~dp0\.."
if not exist "%PROJECT_ROOT%\package.json" (
    set "PROJECT_ROOT=%CD%"
)

if not exist "%PROJECT_ROOT%\package.json" (
    echo =========================================================================
    echo  ATEM WEB MANAGER - WORKSPACE NOT FOUND
    echo =========================================================================
    echo [INFO] The ATEM_WEB_MANAGER project was not found in this directory.
    set /p REPO_URL="Paste your GitHub repository URL to clone it now (or leave blank to cancel): "
    if "!REPO_URL!"=="" (
        echo [ABORT] No URL provided.
        pause
        exit /b 1
    )
    echo [INFO] Cloning repository...
    git clone !REPO_URL! ATEM_WEB_MANAGER
    set "PROJECT_ROOT=%CD%\ATEM_WEB_MANAGER"
)

cd /d "%PROJECT_ROOT%"

echo =========================================================================
echo  ATEM WEB MANAGER - INITIALIZING (v2.22.0)
echo =========================================================================
echo.

:: 2. Verify Node.js Environment
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: 3. Check and Install Root Dependencies
if not exist "node_modules\" (
    echo [INFO] Installing frontend dependencies...
    call npm install
)

:: 4. Check and Install Bridge Dependencies
if not exist "bridge\node_modules\" (
    echo [INFO] Installing hardware bridge dependencies...
    cd bridge
    call npm install
    cd ..
)

:: 5. Terminate Any Lingering Bridge Processes on Port 8080
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080" ^| find "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>nul
)

:: 6. Launch Hardware Bridge COMPLETELY HIDDEN in Background
echo [INFO] Starting ATEM Hardware Bridge (Background Daemon)...
powershell -NoProfile -WindowStyle Hidden -Command "Start-Process node -ArgumentList 'bridge\server.js' -WindowStyle Hidden"

:: 7. Launch Vite Development Server in Current Console
echo [INFO] Starting Vite UI Application...
echo.
call npm run dev

pause