@echo off
:: =========================================================================
:: ATEM WEB MANAGER - WINDOWS AUTOMATED BOOTSTRAPPER & LAUNCHER (v1.90)
:: =========================================================================
TITLE ATEM Web Manager Installer & Launcher
color 0A
cls
echo ================================================================
echo        ATEM WEB MANAGER - WINDOWS AUTOMATED BOOTSTRAPPER
echo ================================================================

set "GITHUB_REPO=https://github.com/trex20xx/atem-web-manager.git"
set "DEFAULT_DIR=C:\ATEM_WEB_MANAGER"

set /p "INSTALL_DIR=Enter target installation path [%DEFAULT_DIR%]: "
if "%INSTALL_DIR%"=="" set "INSTALL_DIR=%DEFAULT_DIR%"

echo [*] Setting up workspace at: %INSTALL_DIR%
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"
cd /d "%INSTALL_DIR%"

:: Check for Git repository clone
if not exist ".git" (
    echo [*] Cloning repository from GitHub...
    git clone "%GITHUB_REPO%" .
) else (
    echo [*] Pulling latest updates from GitHub...
    git pull origin main
)

:: Check for Git
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Git not found. Please install Git for Windows.
    pause
    exit /b 1
) else (
    echo [✓] Git is ready.
)

:: Check for Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Node.js not found. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
) else (
    echo [✓] Node.js is ready.
)

:: Install Frontend Dependencies
if exist package.json (
    echo [*] Installing frontend application dependencies...
    call npm install
)

:: Install Bridge Dependencies
if exist bridge\package.json (
    echo [*] Installing ATEM hardware bridge dependencies...
    cd bridge
    call npm install
    cd ..
)

echo ================================================================
echo    BOOTSTRAP COMPLETE! LAUNCHING DEVELOPMENT SERVER...
echo ================================================================

:: Automatically launch the dev server
npm run dev
pause