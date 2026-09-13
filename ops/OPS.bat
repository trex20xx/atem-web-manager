@echo off
setlocal EnableExtensions
cd /d "%~dp0\.."

:: 1. Explicit Portable Node.js Path Registration & Fallback
set "DEFAULT_PORTABLE_NODE=C:\Users\robert.mirt\Downloads\APPS\INSTALLED\node-v24.20.0-win-x64"

if exist ".atem_node_path" (
    set /p CUSTOM_NODE_PATH=<.atem_node_path
) else if exist "%DEFAULT_PORTABLE_NODE%\node.exe" (
    set "CUSTOM_NODE_PATH=%DEFAULT_PORTABLE_NODE%"
    echo %DEFAULT_PORTABLE_NODE%>.atem_node_path
)

if not "%CUSTOM_NODE_PATH%"=="" (
    set "PATH=%CUSTOM_NODE_PATH%;%PATH%"
)

set "NODE_EXE=node"
if not "%CUSTOM_NODE_PATH%"=="" if exist "%CUSTOM_NODE_PATH%\node.exe" set "NODE_EXE=%CUSTOM_NODE_PATH%\node.exe"

call "%NODE_EXE%" -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Node.js executable not responding.
    set /p NEW_NODE_PATH="Enter the absolute directory path containing node.exe: "
    goto SAVE_NODE_PATH
)
goto START_PYTHON

:SAVE_NODE_PATH
echo %NEW_NODE_PATH%>.atem_node_path
set "CUSTOM_NODE_PATH=%NEW_NODE_PATH%"
set "PATH=%CUSTOM_NODE_PATH%;%PATH%"
set "NODE_EXE=%CUSTOM_NODE_PATH%\node.exe"

:START_PYTHON
if exist "public" (
    echo [OPS] Starting Python static server for /public on Port 8000...
    powershell -WindowStyle Hidden -Command "Start-Process python -ArgumentList '-m', 'http.server', '8000', '--directory', 'public' -WindowStyle Hidden"
)

:MENU
cls
echo =========================================================================
echo ATEM WEB MANAGER - OPERATIONS SUITE (v3.17)
echo =========================================================================
echo [1] RUN ^& EVALUATE  - Launch Vite Frontend ^& Node Bridge Daemon
echo [2] MERGE TO MAIN   - Merge this feature branch into 'main',
echo                       push to GitHub, and delete feature branch.
echo [3] WIPE            - Securely clear caches, node_modules, and dist
echo [4] EXPORT          - Serialize codebase to codebase.txt
echo [5] EXIT            - Terminate
echo =========================================================================
set /p choice="Select an option (1-5): "

if "%choice%"=="1" goto RUN_EVAL
if "%choice%"=="2" goto MERGE_MAIN
if "%choice%"=="3" goto WIPE
if "%choice%"=="4" goto EXPORT
if "%choice%"=="5" goto QUIT

goto MENU

:CHECK_DEPENDENCIES
if not exist "node_modules\vite\" (
    echo.
    echo =================================================================
    echo      FRESH CLONE DETECTED - INSTALLING FRONTEND DEPENDENCIES     
    echo =================================================================
    call npm install
)
if not exist "bridge\node_modules\" (
    echo.
    echo =================================================================
    echo      INSTALLING ATEM BRIDGE BACKEND DEPENDENCIES                
    echo =================================================================
    cd /d "bridge"
    call npm install
    cd /d "%~dp0\.."
)
goto :eof

:SYNC_CHANGELOG
if not exist "ops\CHANGELOG" goto :eof
powershell -NoProfile -ExecutionPolicy Bypass -Command "$m='ops\CHANGELOG.MD'; if (-not (Test-Path $m)) { Set-Content -Path $m -Value '# ATEM WEB MANAGER - Complete Version History' -Encoding UTF8 }; $files=Get-ChildItem -Path 'ops\CHANGELOG\*.md' -ErrorAction SilentlyContinue; if ($files) { $mt=Get-Content $m -Raw; foreach ($f in $files) { $c=(Get-Content $f.FullName -Raw).Trim(); if ($c -match '\[v[0-9]+(\.[0-9]+)*\]') { $tag=$matches[0]; if ($mt -notmatch [regex]::Escape($tag)) { Write-Host ('[OPS] Merging ' + $tag + ' into ' + $m + '...'); $lines=Get-Content $m; $header=$lines[0]; $rest=if ($lines.Count -gt 1) { $lines[1..($lines.Count - 1)] } else { @() }; @($header, '', $c, '') + $rest | Set-Content -Path $m -Encoding UTF8; $mt=Get-Content $m -Raw } } } }"
goto :eof

:CLEANUP_PORTS
powershell -NoProfile -ExecutionPolicy Bypass -Command "8080, 3000, 8000 | ForEach-Object { $p = (Get-NetTCPConnection -LocalPort $_ -State Listen -ErrorAction SilentlyContinue).OwningProcess; if ($p) { Stop-Process -Id $p -Force -ErrorAction SilentlyContinue } }"
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
echo.
call :CHECK_DEPENDENCIES
call :SYNC_CHANGELOG
call :CLEANUP_PORTS
call :EXPORT_CODEBASE

if exist "bridge\server.js" (
    echo ^>^>^> Starting ATEM Hardware Bridge Daemon on Port 8080 in background...
    powershell -NoProfile -WindowStyle Hidden -Command "Start-Process -FilePath '%NODE_EXE%' -ArgumentList 'server.js' -WorkingDirectory '%~dp0\..\bridge' -WindowStyle Hidden"
)

echo ^>^>^> Starting Frontend Server on Port 3000 with auto-launch...
call npm run dev

call :CLEANUP_PORTS

for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD') do set "CURRENT_BRANCH=%%b"
echo.
echo =================================================================
echo                   EVALUATION / REVERT PIPELINE                   
echo =================================================================
echo  Active Branch: %CURRENT_BRANCH%
echo -----------------------------------------------------------------
echo   [1] MERGE TO MAIN   - Merge this feature branch into 'main',
echo                         push to GitHub, and preserve branch.
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
echo.
set /p CMSG=" Enter iteration description / commit message: "
if "%CMSG%"=="" set "CMSG=feat: iteration update"

:: Exclude large files and remove from tracking before commit/merge
git rm --cached public/Top.mp4 2>nul
echo public/Top.mp4 >> .gitignore

for /f "delims=" %%I in ('git branch --show-current') do set "CURRENT_BRANCH=%%I"
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
    git checkout %CURRENT_BRANCH%
    echo ^>^>^> Feature branch successfully merged into main (branch preserved). ^<^<^<
)
pause
goto MENU

:PUSH_BRANCH
echo.
set /p CMSG=" Enter commit message: "
if "%CMSG%"=="" set "CMSG=wip: evaluation checkpoint"
git rm --cached public/Top.mp4 2>nul
echo public/Top.mp4 >> .gitignore
git add -A
git commit -m "%CMSG%"
for /f "delims=" %%I in ('git branch --show-current') do set "CURRENT_BRANCH=%%I"
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
set "TOKEN_FILE=.atem_workspace_token"
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
    rmdir /S /Q "atem-web-manager"
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