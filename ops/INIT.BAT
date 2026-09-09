@echo off
setlocal EnableDelayedExpansion
title ATEM WEB MANAGER - BOOTSTRAPPER (v2.27.0)

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
    if !ERRORLEVEL! NEQ 0 (
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
echo  ATEM WEB MANAGER - INITIALIZING (v2.27.0)
echo =========================================================================
echo.

:: 2. Verify Node.js Environment & Setup Explicit Portable Paths
set "NODE_EXE=node"
set "NPM_EXE=npm"

call node -v >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    if exist "%PROJECT_ROOT%\.atem_node_path" (
        set /p CUSTOM_NODE_PATH=<"%PROJECT_ROOT%\.atem_node_path"
    ) else (
        echo [WARNING] Node.js is not globally installed in your system PATH.
        echo If you are using a portable version, please provide the folder path.
        echo ^(e.g., C:\Users\robert.mirt\Downloads\APPS\INSTALLED\node-v24.20.0-win-x64^)
        echo.
        set /p CUSTOM_NODE_PATH="Portable Node.js Folder Path: "
        
        if "!CUSTOM_NODE_PATH!"=="" (
            echo [ERROR] No path provided. Aborting.
            pause
            exit /b 1
        )
        echo !CUSTOM_NODE_PATH!> "%PROJECT_ROOT%\.atem_node_path"
    )
    
    set "NODE_EXE=!CUSTOM_NODE_PATH!\node.exe"
    set "NPM_EXE=!CUSTOM_NODE_PATH!\npm.cmd"
    
    if not exist "!NODE_EXE!" (
        echo [ERROR] node.exe was not found in "!CUSTOM_NODE_PATH!".
        pause
        exit /b 1
    )
)

:: 3. Check and Install Root Dependencies
if not exist "node_modules\" (
    echo [INFO] Installing frontend dependencies...
    call "!NPM_EXE!" install
)

:: 4. Check and Install Bridge Dependencies
cd bridge
if not exist "node_modules\" (
    echo [INFO] Installing hardware bridge dependencies...
    call "!NPM_EXE!" install
)
cd ..

:: 5. Terminate Any Lingering Bridge Processes on Port 8080
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080" ^| find "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>nul
)

:: 6. Launch Hardware Bridge COMPLETELY HIDDEN in Background via VBScript
echo [INFO] Starting ATEM Hardware Bridge (Background Daemon)...
set "VBS_SCRIPT=%TEMP%\atem_bridge_launcher.vbs"
echo Set WshShell = CreateObject("WScript.Shell") > "!VBS_SCRIPT!"
echo WshShell.CurrentDirectory = "!PROJECT_ROOT!\bridge" >> "!VBS_SCRIPT!"
echo WshShell.Run """!NODE_EXE!"" server.js", 0, False >> "!VBS_SCRIPT!"
cscript //nologo "!VBS_SCRIPT!"

:: 7. Launch Vite Development Server in Current Console
echo [INFO] Starting Vite UI Application...
echo.
call "!NPM_EXE!" run dev

pause