@echo off
setlocal EnableDelayedExpansion
title ATEM WEB MANAGER - BOOTSTRAPPER (v2.24.0)

:: Hardcoded GitHub Repository Address
set "REPO_URL=https://github.com/robertmirt/ATEM_WEB_MANAGER.git"

:: 1. Smart Project Location & Auto-Cloning
set "PROJECT_ROOT=%~dp0\.."
if not exist "%PROJECT_ROOT%\package.json" (
    set "PROJECT_ROOT=%CD%"
)

if not exist "%PROJECT_ROOT%\package.json" (
    echo =========================================================================
    echo  ATEM WEB MANAGER - WORKSPACE NOT FOUND
    echo =========================================================================
    echo [INFO] You are running INIT outside of the project directory.
    echo.
    set /p INSTALL_DIR="Enter full path to install ATEM WEB MANAGER (e.g. C:\Users\robert.mirt\Desktop): "
    if "!INSTALL_DIR!"=="" (
        echo [ABORT] No directory provided.
        pause
        exit /b 1
    )
    if not exist "!INSTALL_DIR!" mkdir "!INSTALL_DIR!"
    cd /d "!INSTALL_DIR!"
    echo.
    
    :: Verify Git before cloning
    call git --version >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Git is not installed or not in PATH.
        echo Please install Git from https://git-scm.com/
        pause
        exit /b 1
    )

    echo [INFO] Cloning 'main' branch from !REPO_URL!...
    call git clone -b main !REPO_URL! ATEM_WEB_MANAGER
    set "PROJECT_ROOT=!INSTALL_DIR!\ATEM_WEB_MANAGER"
    cd /d "!PROJECT_ROOT!"
) else (
    cd /d "%PROJECT_ROOT%"
)

echo.
echo =========================================================================
echo  ATEM WEB MANAGER - INITIALIZING (v2.24.0)
echo =========================================================================
echo.

:: 2. Verify Node.js Environment (Using robust errorlevel check)
call node -v >nul 2>&1
if errorlevel 1 (
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
cd bridge
if not exist "node_modules\" (
    echo [INFO] Installing hardware bridge dependencies...
    call npm install
)
cd ..

:: 5. Terminate Any Lingering Bridge Processes on Port 8080
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080" ^| find "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>nul
)

:: 6. Launch Hardware Bridge COMPLETELY HIDDEN in Background with EXACT Working Directory
echo [INFO] Starting ATEM Hardware Bridge (Background Daemon)...
powershell -NoProfile -WindowStyle Hidden -Command "Start-Process node -ArgumentList 'server.js' -WorkingDirectory '%PROJECT_ROOT%\bridge' -WindowStyle Hidden"

:: 7. Launch Vite Development Server in Current Console
echo [INFO] Starting Vite UI Application...
echo.
call npm run dev

pause