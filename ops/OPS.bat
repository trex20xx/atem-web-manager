@echo off
setlocal EnableDelayedExpansion
title ATEM WEB MANAGER - OPERATIONS SUITE (v2.43.0)

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
echo         ATEM WEB MANAGER - OPERATIONS SUITE (v2.43.0)                    
echo         Active Branch: [!CURRENT_BRANCH!]                                
echo =========================================================================
echo   [1] RUN ^& EVALUATE - Auto-export codebase, start bridge + UI, evaluate 
echo   [2] WIPE           - Secure token check ^& workspace erasure           
echo   [3] EXPORT         - Package full codebase into codebase.txt for AI   
echo   [4] EXIT                                                               
echo =========================================================================
set /p "CHOICE=Select an option [1-4]: "

if "%CHOICE%"=="1" goto DO_INIT
if "%CHOICE%"=="2" goto DO_WIPE
if "%CHOICE%"=="3" goto DO_EXPORT
if "%CHOICE%"=="4" exit /b 0
goto MENU

:DO_EXPORT_SILENT
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
exit /b 0

:DO_INIT
echo.
echo [INFO] Verifying workspace...

if not exist "%PROJECT_ROOT%\package.json" (
    echo [INFO] Project files not found in current directory.
    set /p "USER_DIR=Enter installation path: "
    if "!USER_DIR!"=="" set "USER_DIR=%CD%\ATEM_WEB_MANAGER"
    git clone -b main !REPO_URL! "!USER_DIR!"
    set "PROJECT_ROOT=!USER_DIR!"
    cd /d "!PROJECT_ROOT!"
)

set "NODE_EXE=node"
set "NPM_EXE=npm"
call node -v >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    if exist "%PROJECT_ROOT%\.atem_node_path" (
        set /p CUSTOM_NODE_PATH=<"%PROJECT_ROOT%\.atem_node_path"
    ) else (
        set /p CUSTOM_NODE_PATH="Enter portable Node.js directory path: "
        echo !CUSTOM_NODE_PATH!> "%PROJECT_ROOT%\.atem_node_path"
    )
    set "PATH=!CUSTOM_NODE_PATH!;!PATH!"
    set "NODE_EXE=!CUSTOM_NODE_PATH!\node.exe"
    set "NPM_EXE=!CUSTOM_NODE_PATH!\npm.cmd"
)

for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>nul

if not exist "node_modules\vite\" (
    echo [INFO] Installing frontend dependencies...
    call "!NPM_EXE!" install
)

cd bridge
if not exist "node_modules\ws\" (
    echo [INFO] Installing hardware bridge dependencies...
    call "!NPM_EXE!" install
)
cd ..

:: Auto-export codebase on every run
echo [INFO] Auto-exporting latest codebase to codebase.txt...
call :DO_EXPORT_SILENT

set "VBS_SCRIPT=%TEMP%\atem_bridge_launcher.vbs"
echo Set WshShell = CreateObject("WScript.Shell") > "!VBS_SCRIPT!"
echo WshShell.CurrentDirectory = "!PROJECT_ROOT!\bridge" >> "!VBS_SCRIPT!"
echo WshShell.Run """!NODE_EXE!"" server.js", 0, False >> "!VBS_SCRIPT!"
cscript //nologo "!VBS_SCRIPT!"

echo [INFO] Launching Vite UI (Auto-opening browser)...
echo [NOTE] Press Ctrl+C in this console when finished testing to open Evaluation Menu.
echo.
call "!NPM_EXE!" run dev

echo.
echo [INFO] Vite UI stopped. Terminating background bridge daemon...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>nul
echo [SUCCESS] Bridge daemon terminated cleanly.

:DO_EVALUATE
echo.
echo =========================================================================
echo                    ITERATION EVALUATION ^& NEXT STEPS                     
echo =========================================================================
echo   How did your changes look in the browser? Choose an action below:      
echo.
echo   [1] MERGE TO MAIN (Success - Feature Complete)
echo       -^> Stages and commits your work, switches to 'main', pulls latest,
echo          merges this branch into 'main', pushes to GitHub, and deletes
echo          the temporary feature branch. Use this when the feature is DONE.
echo.
echo   [2] PUSH TO BRANCH (Success - Work in Progress)
echo       -^> Stages, commits, and pushes your work to your current branch
echo          on GitHub without merging into 'main'. Use this to save progress.
echo.
echo   [3] REVERT ^& DISCARD (Failed - Scrap Changes)
echo       -^> Permanently undoes all modifications and deletes new untracked
echo          files, resetting your workspace back to the last clean commit.
echo          Use this when an experiment broke or you want to start over.
echo.
echo   [4] RETURN TO MENU (Keep Files As-Is)
echo       -^> Leaves your local files exactly as they are without committing,
echo          pushing, or reverting, and returns to the operations menu.
echo =========================================================================
set /p "EV_CHOICE=Choose an evaluation action [1-4]: "

if "%EV_CHOICE%"=="1" (
    for /f "tokens=*" %%b in ('git rev-parse --abbrev-ref HEAD') do set "CURRENT_BRANCH=%%b"
    set /p "COMMIT_DESC=Enter commit description: "
    if "!COMMIT_DESC!"=="" set "COMMIT_DESC=feat: update iteration changes"

    if "!CURRENT_BRANCH!"=="main" (
        git add -A
        git commit -m "!COMMIT_DESC!"
        git push origin main
        echo [SUCCESS] Pushed directly to main.
        pause
        goto MENU
    )

    git add -A
    git commit -m "!COMMIT_DESC!" >nul 2>nul
    git checkout main
    git pull origin main
    git merge !CURRENT_BRANCH! -m "merge: fold verified !CURRENT_BRANCH! into main"
    git push origin main
    git branch -d !CURRENT_BRANCH! >nul 2>nul
    git push origin --delete !CURRENT_BRANCH! >nul 2>nul
    echo [SUCCESS] Iteration complete! Main updated and branch pruned.
    pause
    goto MENU
)

if "%EV_CHOICE%"=="2" (
    set /p "COMMIT_MSG=Enter your commit message: "
    if "!COMMIT_MSG!"=="" set "COMMIT_MSG=chore: save progress"
    for /f "tokens=*" %%b in ('git rev-parse --abbrev-ref HEAD') do set "CURRENT_BRANCH=%%b"
    git add -A
    git commit -m "!COMMIT_MSG!"
    git push -u origin !CURRENT_BRANCH!
    echo [SUCCESS] Code pushed to origin/!CURRENT_BRANCH!.
    pause
    goto MENU
)

if "%EV_CHOICE%"=="3" (
    echo.
    set /p "REV_CONFIRM=Are you sure you want to DISCARD all changes and revert? [y/N]: "
    if /i "!REV_CONFIRM!"=="Y" (
        git reset --hard HEAD
        git clean -fd
        echo [SUCCESS] Workspace reverted to clean state.
    ) else (
        echo [ABORT] Revert cancelled.
    )
    pause
    goto MENU
)

if "%EV_CHOICE%"=="4" goto MENU
goto DO_EVALUATE

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
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>nul

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
call :DO_EXPORT_SILENT
echo [SUCCESS] Complete codebase saved to: codebase.txt
echo [INFO] Ready to upload directly to any AI chat session.
pause
goto MENU