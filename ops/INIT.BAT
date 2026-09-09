@echo off
:: =========================================================================
:: ATEM WEB MANAGER - WINDOWS AUTOMATED BOOTSTRAPPER & LAUNCHER (v2.05)
:: =========================================================================
TITLE ATEM Web Manager - Windows Bootstrapper
color 0A
cls

set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."
cd /d "%PROJECT_ROOT%"

where node >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\Users\robert.mirt\Downloads\APPS\INSTALLED\node-v24.20.0-win-x64" (
        set "PATH=%PATH%;C:\Users\robert.mirt\Downloads\APPS\INSTALLED\node-v24.20.0-win-x64"
        echo [*] Attached portable Node.js to session PATH.
    )
)

echo ================================================================
echo        ATEM WEB MANAGER - WINDOWS BOOTSTRAPPER (v2.05)
echo ================================================================

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Git is not recognized on this system.
    pause
    exit /b 1
) else (
    echo [✓] Git is ready.
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Node.js is not recognized on this system.
    pause
    exit /b 1
) else (
    echo [✓] Node.js is ready.
)

if exist package.json (
    echo [*] Installing frontend application dependencies...
    call npm install
) else (
    echo [X] Error: package.json missing in project root.
    pause
    exit /b 1
)

if exist bridge\package.json (
    echo [*] Installing ATEM hardware bridge dependencies...
    cd bridge
    call npm install
    cd ..
)

echo ================================================================
echo    LAUNCHING ATEM BRIDGE & FRONTEND DEVELOPMENT SERVER...
echo ================================================================

if exist bridge\server.js (
    echo [*] Starting ATEM Hardware Bridge daemon on ws://localhost:8080...
    start "ATEM Hardware Bridge Server (Port 8080)" cmd /k "cd /d "%PROJECT_ROOT%\bridge" && node server.js"
)

call npm run dev
pause