@echo off
:: =========================================================================
:: ATEM WEB MANAGER - UNIVERSAL WINDOWS MASTER INIT SCRIPT (v1.85)
:: =========================================================================
TITLE ATEM Web Manager Installer
color 0A
cls
echo ================================================================
echo        ATEM WEB MANAGER - WINDOWS AUTOMATED INSTALLER
echo ================================================================

:: 1. Prompt for installation folder
set "DEFAULT_DIR=C:\ATEM_WEB_MANAGER"
set /p "INSTALL_DIR=Enter target installation path [%DEFAULT_DIR%]: "
if "%INSTALL_DIR%"=="" set "INSTALL_DIR=%DEFAULT_DIR%"

echo [*] Creating and moving to workspace: %INSTALL_DIR%
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"
cd /d "%INSTALL_DIR%"

:: 2. Check for Administrator privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Note: Not running as Administrator. Some auto-installs may prompt for elevation.
)

:: 3. Check & Install Git
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Git not found. Downloading Git for Windows installer...
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/git-for-windows/git/releases/download/v2.44.0.windows.1/Git-2.44.0-64-bit.exe' -OutFile 'git_installer.exe'"
    echo [*] Running Git installer... Please complete setup steps.
    start /wait git_installer.exe /VERYSILENT /NORESTART
    del git_installer.exe
) else (
    echo [✓] Git is ready.
)

:: 4. Check & Install Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Node.js not found. Downloading Node.js LTS MSI installer...
    powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi' -OutFile 'node_installer.msi'"
    echo [*] Running Node.js installer... Please complete setup steps.
    start /wait msiexec.exe /i node_installer.msi /quiet /norestart
    del node_installer.msi
    :: Refresh environment variables for current session
    refreshenv >nul 2>&1
) else (
    echo [✓] Node.js is ready.
)

:: 5. Install Main App Dependencies
if exist package.json (
    echo [*] Installing main application packages...
    call npm install
)

:: 6. Install Bridge Server Dependencies
if exist bridge\package.json (
    echo [*] Installing embedded ATEM hardware bridge packages...
    cd bridge
    call npm install
    cd ..
)

echo ================================================================
echo    INSTALLATION SUCCESSFUL!
echo    You can now run 'npm run dev' to launch your workspace.
echo ================================================================
pause