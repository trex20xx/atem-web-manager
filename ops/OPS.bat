@echo off
setlocal EnableDelayedExpansion
title ATEM WEB MANAGER - OPERATIONS SUITE (v2.36.0)

set "REPO_URL=https://github.com/trex20xx/atem-web-manager.git"
set "EXPECTED_KEY=ATEM_MANAGER_SECURE_WIPE_KEY_2026"

set "PROJECT_ROOT=%~dp0\.."
if not exist "%PROJECT_ROOT%\package.json" set "PROJECT_ROOT=%CD%"
cd /d "%PROJECT_ROOT%"

:MENU
cls
for /f "tokens=*" %%b in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set "CURRENT_BRANCH=%%b"
if "!CURRENT_BRANCH!"=="" set "CURRENT_BRANCH=not-cloned"

echo =========================================================================
echo         ATEM WEB MANAGER - OPERATIONS SUITE (v2.36.0)                    
echo         Active Branch: [!CURRENT_BRANCH!]                                
echo =========================================================================
echo   [1] INIT    - Install dependencies, start bridge, and launch UI        
echo   [2] STOP    - Terminate background ATEM bridge daemon (Port 8080)      
echo   [3] PUSH    - Stage all files, commit, and push to active branch       
echo   [4] PULL    - Pull latest changes from remote for active branch        
echo   [5] BRANCH  - Create and switch to a new Git branch                    
echo   [6] MERGE   - Merge a specified branch into your current branch        
echo   [7] WIPE    - Secure token check ^& complete project directory erasure 
echo   [8] EXPORT  - Package full codebase into codebase.txt for AI sessions  
echo   [9] EXIT                                                               
echo =========================================================================
set /p "CHOICE=Select an option [1-9]: "

if "%CHOICE%"=="1" goto DO_INIT
if "%CHOICE%"=="2" goto DO_STOP
if "%CHOICE%"=="3" goto DO_PUSH
if "%CHOICE%"=="4" goto DO_PULL
if "%CHOICE%"=="5" goto DO_BRANCH
if "%CHOICE%"=="6" goto DO_MERGE
if "%CHOICE%"=="7" goto DO_WIPE
if "%CHOICE%"=="8" goto DO_EXPORT
if "%CHOICE%"=="9" exit /b 0
goto MENU

:DO_INIT
echo.
echo [INFO] Verifying workspace...

:: Auto-clone if missing
if not exist "%PROJECT_ROOT%\package.json" (
    echo [INFO] Project files not found in current directory.
    set /p "USER_DIR=Enter installation path: "
    if "!USER_DIR!"=="" set "USER_DIR=%CD%\ATEM_WEB_MANAGER"
    git clone -b main !REPO_URL! "!USER_DIR!"
    set "PROJECT_ROOT=!USER_DIR!"
    cd /d "!PROJECT_ROOT!"
)

:: Portable Node check
set "NODE_EXE=node"
set "NPM_EXE=npm"
call node -v >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    if exist "%PROJECT_ROOT%\.atem_node_path" (
        set /p CUSTOM_NODE_PATH=<"%PROJECT_ROOT%\.atem_node_path"
        set "NODE_EXE=!CUSTOM_NODE_PATH!\node.exe"
        set "NPM_EXE=!CUSTOM_NODE_PATH!\npm.cmd"
    ) else (
        set /p CUSTOM_NODE_PATH="Enter portable Node.js directory path: "
        set "NODE_EXE=!CUSTOM_NODE_PATH!\node.exe"
        set "NPM_EXE=!CUSTOM_NODE_PATH!\npm.cmd"
        echo !CUSTOM_NODE_PATH!> "%PROJECT_ROOT%\.atem_node_path"
    )
)

if not exist "node_modules\" call "!NPM_EXE!" install
cd bridge
if not exist "node_modules\" call "!NPM_EXE!" install
cd ..

:: Clean lingering bridge port
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>nul

:: Launch hidden VBS daemon
set "VBS_SCRIPT=%TEMP%\atem_bridge_launcher.vbs"
echo Set WshShell = CreateObject("WScript.Shell") > "!VBS_SCRIPT!"
echo WshShell.CurrentDirectory = "!PROJECT_ROOT!\bridge" >> "!VBS_SCRIPT!"
echo WshShell.Run """!NODE_EXE!"" server.js", 0, False >> "!VBS_SCRIPT!"
cscript //nologo "!VBS_SCRIPT!"

:: Launch Vite UI
call "!NPM_EXE!" run dev

:: Automatic Bridge Termination on Vite Exit
echo.
echo [INFO] Vite UI stopped. Terminating background bridge daemon...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>nul
echo [SUCCESS] Bridge daemon terminated cleanly.
pause
goto MENU

:DO_STOP
echo.
echo [INFO] Stopping background daemon on Port 8080...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>nul
echo [SUCCESS] Daemon stopped.
pause
goto MENU

:DO_PUSH
echo.
set /p "COMMIT_MSG=Enter your commit message: "
if "!COMMIT_MSG!"=="" (
    echo [ABORT] Commit message required.
    pause
    goto MENU
)
for /f "tokens=*" %%b in ('git rev-parse --abbrev-ref HEAD') do set "CURRENT_BRANCH=%%b"
git add -A
git commit -m "!COMMIT_MSG!"
git push -u origin !CURRENT_BRANCH!
echo [SUCCESS] Code pushed to origin/!CURRENT_BRANCH!.
pause
goto MENU

:DO_PULL
echo.
for /f "tokens=*" %%b in ('git rev-parse --abbrev-ref HEAD') do set "CURRENT_BRANCH=%%b"
git pull origin !CURRENT_BRANCH!
pause
goto MENU

:DO_BRANCH
echo.
set /p "NEW_BRANCH=Enter new branch name: "
if "!NEW_BRANCH!"=="" goto MENU
git checkout -b !NEW_BRANCH!
pause
goto MENU

:DO_MERGE
echo.
for /f "tokens=*" %%b in ('git rev-parse --abbrev-ref HEAD') do set "CURRENT_BRANCH=%%b"
echo Available branches:
git branch -a
echo.
set /p "SRC_BRANCH=Enter branch to merge INTO !CURRENT_BRANCH!: "
if "!SRC_BRANCH!"=="" goto MENU
git merge !SRC_BRANCH!
pause
goto MENU

:DO_WIPE
echo.
set "TOKEN_FILE=%PROJECT_ROOT%\.atem_workspace_token"
if not exist "%TOKEN_FILE%" (
    echo [ERROR] Security token '%TOKEN_FILE%' not found. Aborted.
    pause
    goto MENU
)
set /p FILE_KEY=<"%TOKEN_FILE%"
if "!FILE_KEY!" NEQ "%EXPECTED_KEY%" (
    echo [ERROR] Token mismatch! Aborted.
    pause
    goto MENU
)
set /p "CONFIRM=Type 'DELETE' to permanently erase the entire workspace: "
if "!CONFIRM!" NEQ "DELETE" (
    echo [ABORT] Wipe cancelled.
    pause
    goto MENU
)

for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>nul

set "GHOST=%TEMP%\atem_wiper.bat"
echo @echo off > "%GHOST%"
echo timeout /t 3 /nobreak ^>nul >> "%GHOST%"
echo rmdir /s /q "%PROJECT_ROOT%" >> "%GHOST%"
echo echo [SUCCESS] Entire workspace deleted from drive. >> "%GHOST%"
echo pause >> "%GHOST%"
echo del "%%~f0" >> "%GHOST%"
start "" "%GHOST%"
exit

:DO_EXPORT
echo.
echo [INFO] Packaging complete codebase into codebase.txt...
set "OUT_FILE=%PROJECT_ROOT%\codebase.txt"
break > "%OUT_FILE%"

for %%F in (index.html vite.config.js package.json bridge\package.json bridge\server.js) do (
    if exist "%PROJECT_ROOT%\%%F" (
        echo === FILE: %%F === >> "%OUT_FILE%"
        type "%PROJECT_ROOT%\%%F" >> "%OUT_FILE%"
        echo. >> "%OUT_FILE%"
        echo. >> "%OUT_FILE%"
    )
)

for /r "%PROJECT_ROOT%\src" %%F in (*.js *.jsx *.css) do (
    set "FULL_PATH=%%F"
    set "REL_PATH=!FULL_PATH:%PROJECT_ROOT%\=!"
    echo === FILE: !REL_PATH! === >> "%OUT_FILE%"
    type "%%F" >> "%OUT_FILE%"
    echo. >> "%OUT_FILE%"
    echo. >> "%OUT_FILE%"
)

echo [SUCCESS] Complete codebase saved to: codebase.txt
echo [INFO] Ready to upload directly to any AI chat session.
pause
goto MENU