@echo off
setlocal

:: =============================================================================
:: ATEM WEB MANAGER - UNIFIED MASTER OPERATIONS SUITE (Windows) (v2.57)
:: =============================================================================

:: Establish Project Root context
set "SCRIPT_DIR=%~dp0"
if "%SCRIPT_DIR:~-1%"=="\" set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"
for %%I in ("%SCRIPT_DIR%") do (
    if /I "%%~nxI"=="ops" (
        set "PROJECT_ROOT=%%~dpI"
    ) else (
        set "PROJECT_ROOT=%SCRIPT_DIR%"
    )
)
if "%PROJECT_ROOT:~-1%"=="\" set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"
cd /d "%PROJECT_ROOT%"

:MENU
cls
echo =================================================================
echo           ATEM WEB MANAGER - MASTER OPERATIONS CLI (v2.57)       
echo =================================================================
echo   [1] RUN ^& EVALUATE  (Vite + Daemon, Auto-Export ^& Evaluation)
echo   [2] WIPE            (Token-Verified Complete Directory Erasure)
echo   [3] EXPORT          (Serialize workspace to codebase.txt)
echo   [4] EXIT
echo =================================================================
set /p CHOICE=" Select action (1-4): "

if "%CHOICE%"=="1" goto RUN_EVAL
if "%CHOICE%"=="2" goto WIPE
if "%CHOICE%"=="3" goto EXPORT
if "%CHOICE%"=="4" goto QUIT
goto MENU

:SETUP_NODE_ENV
call node -v >nul 2>&1
if %ERRORLEVEL% equ 0 (
    set "NODE_CMD=node"
    set "NPM_CMD=npm"
    goto :eof
)

if not exist "%PROJECT_ROOT%\.atem_node_path" goto PROMPT_NODE_PATH
set /p CACHED_NODE_DIR=<"%PROJECT_ROOT%\.atem_node_path"
if exist "%CACHED_NODE_DIR%\node.exe" (
    set "PATH=%CACHED_NODE_DIR%;%PATH%"
    set "NODE_CMD=%CACHED_NODE_DIR%\node.exe"
    set "NPM_CMD=%CACHED_NODE_DIR%\npm.cmd"
    goto :eof
)

:PROMPT_NODE_PATH
echo.
echo =================================================================
echo                 NODE.JS ENVIRONMENT REQUIRED
echo =================================================================
echo  'node' and 'npm' were not detected in your global system PATH.
echo  Please enter the full folder path containing node.exe and npm.cmd
echo  (e.g. C:\Tools\Node or C:\Users\user\Downloads\node-v20-win-x64):
echo =================================================================
set "USER_NODE_DIR="
set /p USER_NODE_DIR=" Enter path: "
if "%USER_NODE_DIR%"=="" goto MENU
set "USER_NODE_DIR=%USER_NODE_DIR:"=%"

if not exist "%USER_NODE_DIR%\node.exe" (
    echo [ERROR] node.exe was not found in: "%USER_NODE_DIR%"
    pause
    goto MENU
)

echo %USER_NODE_DIR%>"%PROJECT_ROOT%\.atem_node_path"
set "PATH=%USER_NODE_DIR%;%PATH%"
set "NODE_CMD=%USER_NODE_DIR%\node.exe"
set "NPM_CMD=%USER_NODE_DIR%\npm.cmd"
echo [OK] Node.js path saved to .atem_node_path
goto :eof

:SYNC_CHANGELOG
if not exist "ops\CHANGELOG" goto :eof
powershell -NoProfile -ExecutionPolicy Bypass -Command "$m='ops\CHANGELOG.MD'; if (-not (Test-Path $m)) { Set-Content -Path $m -Value '# ATEM WEB MANAGER - Complete Version History' -Encoding UTF8 }; $files=Get-ChildItem -Path 'ops\CHANGELOG\*.md' -ErrorAction SilentlyContinue; if ($files) { $mt=Get-Content $m -Raw; foreach ($f in $files) { $c=(Get-Content $f.FullName -Raw).Trim(); if ($c -match '\[v[0-9]+(\.[0-9]+)*\]') { $tag=$matches[0]; if ($mt -notmatch [regex]::Escape($tag)) { Write-Host ('[OPS] Merging ' + $tag + ' into ' + $m + '...'); $lines=Get-Content $m; $header=$lines[0]; $rest=if ($lines.Count -gt 1) { $lines[1..($lines.Count - 1)] } else { @() }; @($header, '', $c, '') + $rest | Set-Content -Path $m -Encoding UTF8; $mt=Get-Content $m -Raw } } } }"
goto :eof

:CLEANUP_PORTS
powershell -NoProfile -ExecutionPolicy Bypass -Command "8080, 3000 | ForEach-Object { $p = (Get-NetTCPConnection -LocalPort $_ -State Listen -ErrorAction SilentlyContinue).OwningProcess; if ($p) { Stop-Process -Id $p -Force -ErrorAction SilentlyContinue } }"
goto :eof

:EXPORT_CODEBASE
echo.
echo =================================================================
echo        SERIALIZING CODEBASE FOR AI HANDOVER (codebase.txt)       
echo =================================================================
powershell -NoProfile -ExecutionPolicy Bypass -Command "$out='codebase.txt'; $all=@(); @('index.html','vite.config.js','package.json') | ForEach-Object { if (Test-Path $_) { $all += ('=== FILE: ' + $_ + ' === '); $all += (Get-Content $_ -Raw); $all += ' ' } }; if (Test-Path 'bridge') { Get-ChildItem -Path 'bridge' -File | Where-Object { $_.Name -ne 'package-lock.json' } | ForEach-Object { $all += ('=== FILE: bridge/' + $_.Name + ' === '); $all += (Get-Content $_.FullName -Raw); $all += ' ' } }; if (Test-Path 'src') { $baseLen=(Get-Location).Path.Length + 1; Get-ChildItem -Path 'src' -Recurse -File | Where-Object { $_.Extension -match '^\.(js|jsx|css)$' } | ForEach-Object { $rel=$_.FullName.Substring($baseLen).Replace('\', '/'); $all += ('=== FILE: ' + $rel + ' === '); $all += (Get-Content $_.FullName -Raw); $all += ' ' } }; [System.IO.File]::WriteAllLines((Join-Path (Get-Location) $out), $all, [System.Text.Encoding]::UTF8);"
echo ^>^>^> Successfully serialized workspace to codebase.txt ^<^<^<
goto :eof

:RUN_EVAL
call :SETUP_NODE_ENV
call :SYNC_CHANGELOG
call :CLEANUP_PORTS
call :EXPORT_CODEBASE

if exist "bridge\server.js" (
    echo ^>^>^> Starting ATEM Hardware Bridge Daemon on Port 8080 in background...
    powershell -NoProfile -WindowStyle Hidden -Command "Start-Process '%NODE_CMD%' -ArgumentList 'server.js' -WorkingDirectory '%PROJECT_ROOT%\bridge' -WindowStyle Hidden"
)

echo ^>^>^> Starting Frontend Server on Port 3000 with auto-launch...
call "%NPM_CMD%" run dev

call :CLEANUP_PORTS

for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD') do set "CURRENT_BRANCH=%%b"
echo.
echo =================================================================
echo                   EVALUATION / REVERT PIPELINE                   
echo =================================================================
echo  Active Branch: %CURRENT_BRANCH%
echo -----------------------------------------------------------------
echo   [1] MERGE TO MAIN   - Merge this feature branch into 'main',
echo                         push to GitHub, and delete feature branch.
echo.
echo   [2] PUSH TO BRANCH  - Keep working on this branch. Commit and
echo                         push progress to GitHub without merging.
echo.
echo   [3] REVERT ^& DISCARD- Experiment failed. Reset codebase back to
echo                         clean HEAD state (git reset --hard ^& clean).
echo.
echo   [4] RETURN TO MENU  - Leave all files exactly as they are without
echo                         committing or reverting.
echo =================================================================
set /p EVAL_CHOICE=" Select post-run action (1-4): "

if "%EVAL_CHOICE%"=="1" goto MERGE_MAIN
if "%EVAL_CHOICE%"=="2" goto PUSH_BRANCH
if "%EVAL_CHOICE%"=="3" goto REVERT_DISCARD
goto MENU

:MERGE_MAIN
set "CMSG="
set /p CMSG=" Enter iteration description / commit message: "
if "%CMSG%"=="" set "CMSG=feat: iteration update"

if "%CURRENT_BRANCH%"=="main" (
    git add -A
    git commit -m "%CMSG%"
    git push origin main
    echo ^>^>^> Main branch updated and pushed. ^<^<^<
) else (
    git add -A
    git commit -m "%CMSG%"
    git push origin %CURRENT_BRANCH%
    git checkout main
    git pull origin main
    git merge %CURRENT_BRANCH% --no-edit
    git push origin main
    git branch -d %CURRENT_BRANCH%
    git push origin --delete %CURRENT_BRANCH% 2>nul
    echo ^>^>^> Feature branch successfully merged into main and pruned. ^<^<^<
)
pause
goto MENU

:PUSH_BRANCH
git add -A
set "CMSG="
set /p CMSG=" Enter commit message: "
if "%CMSG%"=="" set "CMSG=wip: evaluation checkpoint"
git commit -m "%CMSG%"
git push origin %CURRENT_BRANCH%
echo ^>^>^> Committed and pushed to %CURRENT_BRANCH%. ^<^<^<
pause
goto MENU

:REVERT_DISCARD
echo ^>^>^> Discarding all uncommitted changes and cleaning workspace...
git reset --hard HEAD
git clean -fd
echo ^>^>^> Workspace clean and reverted. ^<^<^<
pause
goto MENU

:WIPE
echo.
echo =================================================================
echo                   SECURE WORKSPACE WIPE PROTOCOL                 
echo =================================================================
set "TOKEN_FILE=%PROJECT_ROOT%\.atem_workspace_token"
set "REQUIRED_KEY=ATEM_MANAGER_SECURE_WIPE_KEY_2026"

if not exist "%TOKEN_FILE%" (
    echo [ABORT] Security token missing: .atem_workspace_token not found.
    pause
    goto MENU
)
set /p FOUND_KEY=<"%TOKEN_FILE%"
if not "%FOUND_KEY%"=="%REQUIRED_KEY%" (
    echo [ABORT] Invalid security key inside .atem_workspace_token.
    pause
    goto MENU
)

set /p CONFIRM=" Type 'WIPE' to completely destroy this project directory: "
if "%CONFIRM%"=="WIPE" (
    call :CLEANUP_PORTS
    cd ..
    rmdir /S /Q "%PROJECT_ROOT%"
    echo ^>^>^> Project workspace successfully erased. ^<^<^<
    exit /b 0
)
echo ^>^>^> Wipe aborted. ^<^<^<
pause
goto MENU

:EXPORT
call :EXPORT_CODEBASE
pause
goto MENU

:QUIT
call :CLEANUP_PORTS
echo ^>^>^> Exiting master CLI. Goodbye! ^<^<^<
exit /b 0