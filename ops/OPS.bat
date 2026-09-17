@echo off
setlocal

:: =============================================================================
:: ATEM WEB MANAGER - UNIFIED MASTER OPERATIONS SUITE (Windows) (v3.74)
:: =============================================================================
:: This CLI manages the end-to-end development lifecycle:
:: 1. Self-contained portable Node.js runtime resolution and integrity verification.
:: 2. Dual-package dependency installations and local Roboto font bootstrapping.
:: 3. Background hardware bridge daemon management with automated port cleanup.
:: 4. Consolidated GitHub Operations menu via Trunk-Based Development.
:: 5. Standard interactive text prompts with Enter submission and empty-Enter cancellation.
:: 6. Token-guarded workspace cleaning and silent scratch re-cloning via ghost scripts.
:: 7. Clean terminal exit logic.
:: =============================================================================

chcp 65001 >nul
taskkill /f /fi "WINDOWTITLE eq ATEM_GHOST_WIPER*" >nul 2>&1

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
echo -----------------------------------------------------------------
echo           ATEM WEB MANAGER - MASTER OPERATIONS CLI (v3.74)       
echo -----------------------------------------------------------------
echo   [1] RUN ^& EVALUATE     (Vite + Daemon, Auto-Export ^& Evaluation)
echo   [2] GITHUB OPERATIONS  (Merge to Main, Push Branch, Switch)
echo   [3] WIPE ^& RE-CLONE    (Token-Verified Total Scratch Re-Clone)
echo   [4] EXPORT CODEBASE    (Serialize workspace to codebase.txt)
echo   [5] EXIT               (Terminate session)
echo -----------------------------------------------------------------
set "CHOICE="
set /p CHOICE=" Select action (1-5, or press Enter/0 to exit): "

if "%CHOICE%"=="" goto QUIT
if "%CHOICE%"=="0" goto QUIT
if /I "%CHOICE%"=="q" goto QUIT
if "%CHOICE%"=="1" goto RUN_EVAL
if "%CHOICE%"=="2" goto GITHUB_OPS
if "%CHOICE%"=="3" goto WIPE_RECLONE
if "%CHOICE%"=="4" goto EXPORT
if "%CHOICE%"=="5" goto QUIT
goto MENU

:VERIFY_TOKEN
set "TOKEN_FILE=%PROJECT_ROOT%\.atem_workspace_token"
set "REQUIRED_KEY=ATEM_MANAGER_SECURE_WIPE_KEY_2026"

if not exist "%TOKEN_FILE%" (
    echo.
    echo -----------------------------------------------------------------
    echo  [SECURITY ABORT] Missing token: .atem_workspace_token not found!
    echo  Wipe refused to prevent deleting unintended drive directories.
    echo -----------------------------------------------------------------
    pause
    exit /b 1
)

set "FOUND_KEY="
set /p FOUND_KEY=<"%TOKEN_FILE%"
if not "%FOUND_KEY%"=="%REQUIRED_KEY%" (
    echo.
    echo -----------------------------------------------------------------
    echo  [SECURITY ABORT] Invalid security key inside .atem_workspace_token!
    echo  Wipe refused to prevent deleting unintended drive directories.
    echo -----------------------------------------------------------------
    pause
    exit /b 1
)

if "%PROJECT_ROOT%"=="" (
    echo [SECURITY ABORT] PROJECT_ROOT variable is empty.
    pause
    exit /b 1
)
if "%PROJECT_ROOT:~1,2%"==":\" if "%PROJECT_ROOT:~3%"=="" (
    echo [SECURITY ABORT] Dangerous target: PROJECT_ROOT is a drive root.
    pause
    exit /b 1
)

exit /b 0

:SETUP_NODE_ENV
set "LOCAL_NODE_DIR=%PROJECT_ROOT%\bin\node"
set "NODE_CMD=%LOCAL_NODE_DIR%\node.exe"
set "NPM_CMD=%LOCAL_NODE_DIR%\npm.cmd"

if not exist "%PROJECT_ROOT%\bin" mkdir "%PROJECT_ROOT%\bin"

if exist "%NODE_CMD%" if exist "%LOCAL_NODE_DIR%\node_modules\npm\bin\npm-cli.js" (
    set "PATH=%LOCAL_NODE_DIR%;%PATH%"
    goto :eof
)

if exist "%LOCAL_NODE_DIR%" (
    echo [REPAIR] Incomplete portable Node.js runtime detected. Cleaning up...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Remove-Item -LiteralPath '%LOCAL_NODE_DIR%' -Recurse -Force -ErrorAction SilentlyContinue"
)

if exist "%PROJECT_ROOT%\.atem_node_path" (
    set /p CACHED_DIR=<"%PROJECT_ROOT%\.atem_node_path"
    if exist "%CACHED_DIR%\node.exe" if exist "%CACHED_DIR%\node_modules\npm\bin\npm-cli.js" (
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
echo -----------------------------------------------------------------
echo             PORTABLE NODE.JS BOOTSTRAPPER (v3.74)                
echo -----------------------------------------------------------------
echo  Node.js was not found on your system or in bin\node.
echo  Downloading official portable Node.js LTS (v20.18.0 x64)...
echo -----------------------------------------------------------------

set "DL_ZIP=%PROJECT_ROOT%\bin\node_setup.zip"
set "EXT_DIR=%PROJECT_ROOT%\bin\node_setup_ext"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$url = 'https://nodejs.org/dist/v20.18.0/node-v20.18.0-win-x64.zip';" ^
    "$zip = '%DL_ZIP%';" ^
    "$ext = '%EXT_DIR%';" ^
    "$dest = '%LOCAL_NODE_DIR%';" ^
    "Write-Host '[1/3] Downloading Node.js runtime archive...';" ^
    "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;" ^
    "$ProgressPreference = 'SilentlyContinue';" ^
    "Invoke-WebRequest -Uri $url -OutFile $zip;" ^
    "Write-Host '[2/3] Extracting complete binaries and npm modules...';" ^
    "if (Test-Path -LiteralPath $ext) { Remove-Item -LiteralPath $ext -Recurse -Force -ErrorAction SilentlyContinue };" ^
    "Expand-Archive -LiteralPath $zip -DestinationPath $ext -Force;" ^
    "$inner = (Get-ChildItem -LiteralPath $ext -Directory | Select-Object -First 1).FullName;" ^
    "Move-Item -LiteralPath $inner -Destination $dest -Force;" ^
    "Write-Host '[3/3] Cleaning up temporary archive files...';" ^
    "Remove-Item -LiteralPath $zip -Force -ErrorAction SilentlyContinue;" ^
    "Remove-Item -LiteralPath $ext -Recurse -Force -ErrorAction SilentlyContinue;" ^
    "Write-Host '>>> Portable Node.js successfully initialized in bin\node! <<<';"

if exist "%NODE_CMD%" if exist "%LOCAL_NODE_DIR%\node_modules\npm\bin\npm-cli.js" (
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
    echo -----------------------------------------------------------------
    echo      FRESH CLONE DETECTED - INSTALLING FRONTEND DEPENDENCIES     
    echo -----------------------------------------------------------------
    call "%NPM_CMD%" install
)
if not exist "%PROJECT_ROOT%\bridge\node_modules\" (
    echo.
    echo -----------------------------------------------------------------
    echo      INSTALLING ATEM BRIDGE BACKEND DEPENDENCIES                
    echo -----------------------------------------------------------------
    cd /d "%PROJECT_ROOT%\bridge"
    call "%NPM_CMD%" install
    cd /d "%PROJECT_ROOT%"
)

if not exist "%PROJECT_ROOT%\public\fonts\roboto-400.woff2" (
    echo.
    echo -----------------------------------------------------------------
    echo     DOWNLOADING EMBEDDED ROBOTO FONTS INTO PROJECT (OFFLINE USE)  
    echo -----------------------------------------------------------------
    if not exist "%PROJECT_ROOT%\public\fonts" mkdir "%PROJECT_ROOT%\public\fonts"
    powershell -NoProfile -ExecutionPolicy Bypass -Command ^
        "$dest = '%PROJECT_ROOT%\public\fonts';" ^
        "$fonts = @(" ^
        "    @{ name='roboto-400.woff2'; url='https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2' }," ^
        "    @{ name='roboto-500.woff2'; url='https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fBBc4.woff2' }," ^
        "    @{ name='roboto-700.woff2'; url='https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc4.woff2' }," ^
        "    @{ name='roboto-900.woff2'; url='https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmYUtfBBc4.woff2' }" ^
        ");" ^
        "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;" ^
        "$ProgressPreference = 'SilentlyContinue';" ^
        "foreach ($f in $fonts) {" ^
        "    $target = Join-Path $dest $f.name;" ^
        "    Write-Host ('  [*] Downloading ' + $f.name + '...');" ^
        "    Invoke-WebRequest -Uri $f.url -OutFile $target -UseBasicParsing;" ^
        "};" ^
        "Write-Host '  [DONE] Embedded Roboto webfonts downloaded successfully.';"
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
echo -----------------------------------------------------------------
echo        SERIALIZING CODEBASE FOR AI HANDOVER (codebase.txt)       
echo -----------------------------------------------------------------
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$out='codebase.txt'; $all=@();" ^
    "Write-Host -NoNewline '  [*] Serializing project modules...';" ^
    "@('index.html','vite.config.js','package.json') | ForEach-Object { if (Test-Path $_) { $all += ('=== FILE: ' + $_ + ' === '); $all += (Get-Content $_ -Raw); $all += ' ' } };" ^
    "if (Test-Path 'bridge') { Get-ChildItem -Path 'bridge' -File | Where-Object { $_.Name -ne 'package-lock.json' } | ForEach-Object { $all += ('=== FILE: bridge/' + $_.Name + ' === '); $all += (Get-Content $_.FullName -Raw); $all += ' ' } };" ^
    "if (Test-Path 'src') { $baseLen=(Get-Location).Path.Length + 1; Get-ChildItem -Path 'src' -Recurse -File | Where-Object { $_.Extension -match '^\.(js|jsx|css)$' } | ForEach-Object { $rel=$_.FullName.Substring($baseLen).Replace('\', '/'); $all += ('=== FILE: ' + $rel + ' === '); $all += (Get-Content $_.FullName -Raw); $all += ' ' } };" ^
    "[System.IO.File]::WriteAllLines((Join-Path (Get-Location) $out), $all, [System.Text.Encoding]::UTF8);" ^
    "Write-Host '  [DONE] Serialized workspace to codebase.txt';"
goto :eof

:RESOLVE_COMMIT_MSG
set "COMMIT_TMP=%PROJECT_ROOT%\bin\.commit_msg.txt"
set "DESC_FILE=%PROJECT_ROOT%\ops\DESCRIPTOR.txt"

set "DETECTED_VER="
for /f "tokens=2 delims='" %%v in ('powershell -NoProfile -Command "Select-String -Path 'src\version.js' -Pattern 'v[0-9]+\.[0-9]+' | ForEach-Object { $_.Matches.Value }"' ) do set "DETECTED_VER=%%v"
if "%DETECTED_VER%"=="" set "DETECTED_VER=v3.74"

if not exist "%DESC_FILE%" goto MANUAL_PROMPT

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$lines = Get-Content -LiteralPath '%DESC_FILE%' -Encoding UTF8;" ^
    "$fileVer = if ($lines.Count -ge 1) { $lines[0].Trim() } else { '' };" ^
    "$fileMsg = if ($lines.Count -ge 2) { ($lines[1..($lines.Count - 1)] -join [Environment]::NewLine).Trim() } else { '' };" ^
    "if ($fileVer -eq '%DETECTED_VER%' -and -not [string]::IsNullOrWhiteSpace($fileMsg)) {" ^
    "    [System.IO.File]::WriteAllText('%COMMIT_TMP%', $fileMsg, [System.Text.Encoding]::UTF8);" ^
    "    Write-Host ('[DESCRIPTOR VERIFIED] Ingested message for ' + $fileVer + ':');" ^
    "    Write-Host ('\"' + $fileMsg + '\"');" ^
    "    exit 0;" ^
    "} else {" ^
    "    Write-Host ('[VERSION MISMATCH] DESCRIPTOR.txt (' + $fileVer + ') does not match version.js (' + '%DETECTED_VER%' + ')');" ^
    "    exit 2;" ^
    "}"

if %ERRORLEVEL% equ 0 exit /b 0

echo.
echo -----------------------------------------------------------------
echo  [WARNING] Descriptor file version does not match src/version.js!
echo  src/version.js:      %DETECTED_VER%
echo -----------------------------------------------------------------
echo  [1] Enter commit description manually
echo  [2] Abort to download/replace ops\DESCRIPTOR.txt
echo -----------------------------------------------------------------
set "MISMATCH_CHOICE="
set /p MISMATCH_CHOICE=" Select (1-2, or Enter to abort): "
if "%MISMATCH_CHOICE%"=="1" goto MANUAL_PROMPT
exit /b 1

:MANUAL_PROMPT
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$msg = Read-Host 'Enter iteration description / commit message'; if ([string]::IsNullOrWhiteSpace($msg)) { $msg = 'feat: iteration update (' + '%DETECTED_VER%' + ')' }; [System.IO.File]::WriteAllText('%COMMIT_TMP%', $msg, [System.Text.Encoding]::UTF8)"
exit /b 0

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
echo -----------------------------------------------------------------
echo                      GITHUB OPERATIONS                          
echo -----------------------------------------------------------------
echo  Active Branch: %CURRENT_BRANCH%
echo -----------------------------------------------------------------
echo   [1] MERGE TO MAIN     (Publish branch, tag, and merge into main)
echo   [2] PUSH TO BRANCH    (Checkpoint progress on active branch)
echo   [3] SWITCH BRANCH     (View branch history and checkout version)
echo   [4] CREATE NEW BRANCH (Create and checkout new feature branch)
echo   [5] WIPE ^& RE-CLONE   (Token-Verified Total Scratch Re-Clone)
echo   [6] REVERT ^& DISCARD  (Discard uncommitted changes and clean)
echo   [7] RETURN TO MENU    (Return to main operations menu)
echo -----------------------------------------------------------------
set "GCHOICE="
set /p GCHOICE=" Select Git action (1-7, or press Enter/0 to return): "

if "%GCHOICE%"=="" goto MENU
if "%GCHOICE%"=="0" goto MENU
if /I "%GCHOICE%"=="q" goto MENU
if "%GCHOICE%"=="1" goto MERGE_MAIN
if "%GCHOICE%"=="2" goto PUSH_BRANCH
if "%GCHOICE%"=="3" goto SWITCH_BRANCH
if "%GCHOICE%"=="4" goto CREATE_BRANCH
if "%GCHOICE%"=="5" goto WIPE_RECLONE
if "%GCHOICE%"=="6" goto REVERT_DISCARD
if "%GCHOICE%"=="7" goto MENU
goto GITHUB_OPS

:MERGE_MAIN
echo.
call :RESOLVE_COMMIT_MSG
if %ERRORLEVEL% neq 0 goto GITHUB_OPS

git rm --cached public/Top.mp4 2>nul
git rm --cached bin/.commit_msg.txt 2>nul

if /I "%CURRENT_BRANCH%"=="main" (
    git add -A
    git commit -F "%COMMIT_TMP%"
    del "%COMMIT_TMP%" 2>nul
    echo [BRANCHING] Spawning marker branch '%DETECTED_VER%'...
    git branch "%DETECTED_VER%" 2>nul
    echo [TAGGING] Tagging release '%DETECTED_VER%'...
    git tag -a "%DETECTED_VER%" -m "Release %DETECTED_VER%" 2>nul
    echo [PUSHING] Pushing main, branch, and tags to GitHub...
    git push -u origin main
    git push origin "%DETECTED_VER%"
    git push origin --tags 2>nul
    echo.
    echo -----------------------------------------------------------------
    echo  Iteration successfully published:
    echo  - Commits saved and pushed directly to 'main'.
    echo  - Marker branch '%DETECTED_VER%' published.
    echo  - Release tag '%DETECTED_VER%' published.
    echo  - Active working branch remains 'main'.
    echo -----------------------------------------------------------------
    pause
    goto GITHUB_OPS
)

git add -A
git commit -F "%COMMIT_TMP%"
del "%COMMIT_TMP%" 2>nul
echo [PUSHING] Publishing '%CURRENT_BRANCH%' to GitHub...
git push -u origin "%CURRENT_BRANCH%"
echo [MERGING] Folding '%CURRENT_BRANCH%' into main...
git checkout main
git pull origin main 2>nul
git merge "%CURRENT_BRANCH%" --no-edit
git push origin main
echo [TAGGING] Tagging release '%DETECTED_VER%'...
git tag -a "%DETECTED_VER%" -m "Release %DETECTED_VER%" 2>nul
git push origin --tags 2>nul
echo [RETURNING] Switching back to feature branch '%CURRENT_BRANCH%'...
git checkout "%CURRENT_BRANCH%"
echo.
echo -----------------------------------------------------------------
echo  Iteration successfully published:
echo  - Feature branch '%CURRENT_BRANCH%' updated and pushed.
echo  - Changes merged into 'main' and pushed.
echo  - Release tag '%DETECTED_VER%' published.
echo  - Active working branch returned to '%CURRENT_BRANCH%'.
echo -----------------------------------------------------------------
pause
goto GITHUB_OPS

:PUSH_BRANCH
echo.
call :RESOLVE_COMMIT_MSG
if %ERRORLEVEL% neq 0 goto GITHUB_OPS

git rm --cached public/Top.mp4 2>nul
git rm --cached bin/.commit_msg.txt 2>nul
git add -A
git commit -F "%COMMIT_TMP%"
del "%COMMIT_TMP%" 2>nul

git push -u origin "%CURRENT_BRANCH%"
echo ^>^>^> Committed and pushed to branch '%CURRENT_BRANCH%'. ^<^<^<
pause
goto GITHUB_OPS

:SWITCH_BRANCH
cls
echo -----------------------------------------------------------------
echo                    AVAILABLE BRANCHES ^& HISTORY                  
echo -----------------------------------------------------------------
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "Write-Host -NoNewline '  [*] Fetching latest branch telemetry from GitHub...';" ^
    "git fetch --all --prune --tags > $null 2>&1;" ^
    "Write-Host '';" ^
    "$bRefs = git for-each-ref --sort=-committerdate refs/heads/ refs/remotes/origin/ --format='%%(refname:short)|%%(subject)|%%(committerdate:relative)';" ^
    "$seen = @{};" ^
    "foreach ($r in $bRefs) {" ^
    "    if ($r -match 'HEAD' -or $r -match '^origin$') { continue };" ^
    "    $parts = $r.Split('|');" ^
    "    $rawName = $parts[0];" ^
    "    $name = $rawName.Replace('origin/', '');" ^
    "    if ($seen.ContainsKey($name)) { continue };" ^
    "    $seen[$name] = $true;" ^
    "    $subj = if ($parts.Count -gt 1) { $parts[1] } else { '' };" ^
    "    $date = if ($parts.Count -gt 2) { $parts[2] } else { '' };" ^
    "    Write-Host ('  [branch] ' + $name.PadRight(12) + ' :: ' + $subj + ' (' + $date + ')');" ^
    "};" ^
    "$tRefs = git for-each-ref --sort=-*creatordate refs/tags/ --format='%%(refname:short)|%%(subject)|%%(*committerdate:relative)';" ^
    "foreach ($r in $tRefs) {" ^
    "    $parts = $r.Split('|');" ^
    "    $name = $parts[0];" ^
    "    $subj = if ($parts.Count -gt 1) { $parts[1] } else { '' };" ^
    "    $date = if ($parts.Count -gt 2) { $parts[2] } else { '' };" ^
    "    Write-Host ('  [tag]    ' + $name.PadRight(12) + ' :: ' + $subj + ' (' + $date + ')');" ^
    "}"
echo.
echo -----------------------------------------------------------------
set "TARGET_BRANCH="
set /p TARGET_BRANCH=" Enter branch or tag to checkout (or press Enter/0 to cancel): "

if "%TARGET_BRANCH%"=="" goto GITHUB_OPS
if "%TARGET_BRANCH%"=="0" goto GITHUB_OPS
if /I "%TARGET_BRANCH%"=="q" goto GITHUB_OPS
git checkout %TARGET_BRANCH%
pause
goto GITHUB_OPS

:CREATE_BRANCH
echo.
set "NEW_BRANCH="
set /p NEW_BRANCH=" Enter new feature branch name (or press Enter to cancel): "
if "%NEW_BRANCH%"=="" goto GITHUB_OPS
if "%NEW_BRANCH%"=="0" goto GITHUB_OPS
git checkout -b %NEW_BRANCH%
echo ^>^>^> Switched to new branch '%NEW_BRANCH%'. ^<^<^<
pause
goto GITHUB_OPS

:REVERT_DISCARD
echo ^>^>^> Discarding all uncommitted changes and cleaning workspace...
git reset --hard HEAD
git clean -fd
echo ^>^>^> Workspace clean and reverted. ^<^<^<
pause
goto GITHUB_OPS

:WIPE_RECLONE
call :VERIFY_TOKEN
if %ERRORLEVEL% neq 0 goto MENU

echo.
echo -----------------------------------------------------------------
echo             TOTAL WORKSPACE WIPE ^& RE-CLONE PROTOCOL             
echo -----------------------------------------------------------------
echo  WARNING: This will completely destroy this folder and clone a
echo  fresh copy from GitHub. Run this ONLY when you want a clean reset.
echo -----------------------------------------------------------------

set "REPO_URL="
for /f "delims=" %%u in ('git config --get remote.origin.url 2^>nul') do set "REPO_URL=%%u"
if "%REPO_URL%"=="" set "REPO_URL=https://github.com/trex20xx/atem-web-manager.git"

for %%I in ("%PROJECT_ROOT%") do set "PARENT_DIR=%%~dpI"
if "%PARENT_DIR:~-1%"=="\" set "PARENT_DIR=%PARENT_DIR:~0,-1%"
for %%I in ("%PROJECT_ROOT%") do set "FOLDER_NAME=%%~nxI"

echo  Remote Repository: %REPO_URL%
echo  Target Folder:     %PROJECT_ROOT%
echo -----------------------------------------------------------------
set /p WIPE_CONFIRM=" Type 'RECLONE' to execute (or press Enter to cancel): "
if not "%WIPE_CONFIRM%"=="RECLONE" (
    echo ^>^>^> Wipe and re-clone aborted. ^<^<^<
    pause
    goto MENU
)

call :CLEANUP_PORTS

set "GHOST_BAT=%USERPROFILE%\atem_ghost_reclone.bat"
(
    echo @echo off
    echo title ATEM_GHOST_WIPER
    echo powershell -NoProfile -Command "8080, 3000, 8000 | ForEach-Object { $p = (Get-NetTCPConnection -LocalPort $_ -State Listen -ErrorAction SilentlyContinue).OwningProcess; if ($p) { Stop-Process -Id $p -Force -ErrorAction SilentlyContinue } }"
    echo timeout /t 2 /nobreak ^>nul
    echo if not exist "%PROJECT_ROOT%\.atem_workspace_token" ^(
    echo     del "%%~f0" ^>nul 2^>^&1
    echo     exit
    echo ^)
    echo rmdir /S /Q "%PROJECT_ROOT%" ^>nul 2^>^&1
    echo cd /d "%PARENT_DIR%"
    echo git clone "%REPO_URL%" "%FOLDER_NAME%" ^>nul 2^>^&1
    echo del "%%~f0" ^>nul 2^>^&1
    echo exit
) > "%GHOST_BAT%"

echo ^>^>^> Starting silent background wipe and fresh re-clone...
powershell -NoProfile -WindowStyle Hidden -Command "Start-Process cmd -ArgumentList '/c \"%GHOST_BAT%\"' -WindowStyle Hidden"
echo ^>^>^> Session closing. Your workspace is being freshly re-cloned.
timeout /t 2 /nobreak >nul
exit

:EXPORT
call :EXPORT_CODEBASE
pause
goto MENU

:QUIT
call :CLEANUP_PORTS
cls
exit /b 0