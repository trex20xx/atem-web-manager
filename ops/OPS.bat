@echo off
setlocal

:: =============================================================================
:: ATEM WEB MANAGER - UNIFIED MASTER OPERATIONS SUITE (Windows) (v3.35)
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
echo           ATEM WEB MANAGER - MASTER OPERATIONS CLI (v3.35)       
echo =================================================================
echo   [1] RUN ^& EVALUATE     (Vite + Daemon, Auto-Export ^& Evaluation)
echo   [2] GITHUB OPERATIONS  (Merge, Push Branch, Revert, Sync)
echo   [3] WIPE               (Token-Verified Complete Directory Erasure)
echo   [4] EXPORT             (Serialize workspace to codebase.txt)
echo   [5] EXIT
echo =================================================================
set /p CHOICE=" Select action (1-5): "

if "%CHOICE%"=="1" goto RUN_EVAL
if "%CHOICE%"=="2" goto GITHUB_OPS
if "%CHOICE%"=="3" goto WIPE
if "%CHOICE%"=="4" goto EXPORT
if "%CHOICE%"=="5" goto QUIT
goto MENU

:SETUP_NODE_ENV
set "LOCAL_NODE_DIR=%PROJECT_ROOT%\bin\node"
set "NODE_CMD=%LOCAL_NODE_DIR%\node.exe"
set "NPM_CMD=%LOCAL_NODE_DIR%\npm.cmd"

if exist "%NODE_CMD%" (
    set "PATH=%LOCAL_NODE_DIR%;%PATH%"
    goto :eof
)

if exist "%PROJECT_ROOT%\.atem_node_path" (
    set /p CACHED_DIR=<"%PROJECT_ROOT%\.atem_node_path"
    if exist "%CACHED_DIR%\node.exe" (
        set "PATH=%CACHED_DIR%;%PATH%"
        set "NODE_CMD=%CACHED_DIR%\node.exe"
        set "NPM_CMD=%CACHED_DIR%\npm.cmd"
        goto :eof
    )
)

call node -v >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [INFO] Global Node.js detected.
    set "NODE_CMD=node"
    set "NPM_CMD=npm"
    goto :eof
)

echo.
echo =================================================================
echo             PORTABLE NODE.JS BOOTSTRAPPER (v3.35)                
echo =================================================================
echo  Node.js was not found on your system or in bin\node.
echo  Downloading official portable Node.js LTS (v20.18.0 x64)...
echo =================================================================

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$ProgressPreference = 'SilentlyContinue';" ^
    "$url = 'https://nodejs.org/dist/v20.18.0/node-v20.18.0-win-x64.zip';" ^
    "$zip = Join-Path $env:TEMP 'node_portable.zip';" ^
    "$ext = Join-Path $env:TEMP 'node_temp_extract';" ^
    "$dest = '%LOCAL_NODE_DIR%';" ^
    "Write-Host '[1/3] Downloading Node.js runtime archive...';" ^
    "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;" ^
    "Invoke-WebRequest -Uri $url -OutFile $zip;" ^
    "Write-Host '[2/3] Extracting binaries into project folder bin\node...';" ^
    "Expand-Archive -Path $zip -DestinationPath $ext -Force;" ^
    "$inner = (Get-ChildItem -Path $ext -Directory | Select-Object -First 1).FullName;" ^
    "if (!(Test-Path $dest)) { New-Item -ItemType Directory -Path $dest -Force | Out-Null };" ^
    "Copy-Item -Path (Join-Path $inner '*') -Destination $dest -Recurse -Force;" ^
    "Write-Host '[3/3] Cleaning up temporary files...';" ^
    "Remove-Item -Path $zip, $ext -Recurse -Force;" ^
    "Write-Host '>>> Portable Node.js successfully initialized in bin\node! <<<';"

if exist "%NODE_CMD%" (
    set "PATH=%LOCAL_NODE_DIR%;%PATH%"
    goto :eof
)

echo [ERROR] Automatic portable Node.js setup failed.
echo Please enter the folder path containing node.exe manually:
set /p USER_NODE_DIR=" Enter path: "
if "%USER_NODE_DIR%"=="" goto MENU
set "USER_NODE_DIR=%USER_NODE_DIR:"=%"
if not exist "%USER_NODE_DIR%\node.exe" (
    echo [ERROR] node.exe not found in "%USER_NODE_DIR%".
    pause
    goto MENU
)
echo %USER_NODE_DIR%>"%PROJECT_ROOT%\.atem_node_path"
set "PATH=%USER_NODE_DIR%;%PATH%"
set "NODE_CMD=%USER_NODE_DIR%\node.exe"
set "NPM_CMD=%USER_NODE_DIR%\npm.cmd"
goto :eof

:CHECK_DEPENDENCIES
if not exist "%PROJECT_ROOT%\node_modules\vite\" (
    echo.
    echo =================================================================
    echo      FRESH CLONE DETECTED - INSTALLING FRONTEND DEPENDENCIES     
    echo =================================================================
    call "%NPM_CMD%" install
)
if not exist "%PROJECT_ROOT%\bridge\node_modules\" (
    echo.
    echo =================================================================
    echo      INSTALLING ATEM BRIDGE BACKEND DEPENDENCIES                
    echo =================================================================
    cd /d "%PROJECT_ROOT%\bridge"
    call "%NPM_CMD%" install
    cd /d "%PROJECT_ROOT%"
)
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
call :CHECK_DEPENDENCIES
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
goto GITHUB_OPS

:GITHUB_OPS
call :CLEANUP_PORTS
for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set "CURRENT_BRANCH=%%b"
if "%CURRENT_BRANCH%"=="" set "CURRENT_BRANCH=unknown"

cls
echo =================================================================
echo                        GITHUB OPERATIONS                         
echo =================================================================
echo  Active Branch: %CURRENT_BRANCH%
echo -----------------------------------------------------------------
echo   [1] MERGE TO MAIN   - Merge this feature branch into 'main'
echo                         (preserves branch history on local/remote).
echo.
echo   [2] PUSH TO BRANCH  - Keep working on this branch. Commit and
echo                         push progress to GitHub without merging.
echo.
echo   [3] REVERT ^& DISCARD- Experiment failed. Reset codebase back to
echo                         clean HEAD state (git reset --hard ^& clean).
echo.
echo   [4] RETURN TO MENU  - Return to main menu without changes.
echo =================================================================
set /p EVAL_CHOICE=" Select Git action (1-4): "

if "%EVAL_CHOICE%"=="1" goto MERGE_MAIN
if "%EVAL_CHOICE%"=="2" goto PUSH_BRANCH
if "%EVAL_CHOICE%"=="3" goto REVERT_DISCARD
if "%EVAL_CHOICE%"=="4" goto MENU
goto GITHUB_OPS

:MERGE_MAIN
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$msg = Read-Host 'Enter iteration description / commit message'; if ([string]::IsNullOrWhiteSpace($msg)) { $msg = 'feat: iteration update' }; [System.IO.File]::WriteAllText((Join-Path $env:TEMP 'atem_commit_msg.txt'), $msg, [System.Text.Encoding]::UTF8)"

git rm --cached public/Top.mp4 2>nul
git add -A
git commit -F "%TEMP%\atem_commit_msg.txt"
del "%TEMP%\atem_commit_msg.txt" 2>nul

if "%CURRENT_BRANCH%"=="main" goto MERGE_MAIN_DIRECT

git push origin %CURRENT_BRANCH%
git checkout main
git pull origin main
git merge %CURRENT_BRANCH% --no-edit
git push origin main
git checkout %CURRENT_BRANCH%
echo ^>^>^> Feature successfully merged into main (branch preserved). ^<^<^<
pause
goto MENU

:MERGE_MAIN_DIRECT
git push origin main
echo ^>^>^> Main branch updated and pushed. ^<^<^<
pause
goto MENU

:PUSH_BRANCH
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$msg = Read-Host 'Enter commit message'; if ([string]::IsNullOrWhiteSpace($msg)) { $msg = 'wip: evaluation checkpoint' }; [System.IO.File]::WriteAllText((Join-Path $env:TEMP 'atem_commit_msg.txt'), $msg, [System.Text.Encoding]::UTF8)"

git rm --cached public/Top.mp4 2>nul
git add -A
git commit -F "%TEMP%\atem_commit_msg.txt"
del "%TEMP%\atem_commit_msg.txt" 2>nul

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