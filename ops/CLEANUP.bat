@echo off
:: =========================================================================
:: ATEM WEB MANAGER - WORKSPACE STANDARDIZER & CLEANUP (v2.05)
:: =========================================================================
TITLE ATEM Web Manager - Standardizing File Names
color 0E
cls

echo ================================================================
echo        ATEM WEB MANAGER - WORKSPACE STANDARDIZATION
echo ================================================================

set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

:: 1. Ensure ops folder exists
if not exist "ops" mkdir "ops"

:: 2. Move & Standardize documentation and scripts to ALL-CAPS in ops\
echo [*] Moving and normalizing ops\ files to ALL-CAPS...
if exist "CHANGELOG.md" move /y "CHANGELOG.md" "ops\CHANGELOG.MD" >nul
if exist "ops\CHANGELOG.md" ren "ops\CHANGELOG.md" "CHANGELOG.MD" >nul

if exist "README.md" move /y "README.md" "ops\README.MD" >nul
if exist "ops\README.md" ren "ops\README.md" "README.MD" >nul

if exist "HANDOVER.md" move /y "HANDOVER.md" "ops\HANDOVER.MD" >nul
if exist "ops\HANDOVER.md" ren "ops\HANDOVER.md" "HANDOVER.MD" >nul

if exist "FILE_TREE.md" move /y "FILE_TREE.md" "ops\FILE_TREE.MD" >nul
if exist "ops\FILE_TREE.md" ren "ops\FILE_TREE.md" "FILE_TREE.MD" >nul

if exist "git_instructions.md" move /y "git_instructions.md" "ops\GIT_INSTRUCTIONS.MD" >nul
if exist "ops\git_instructions.md" ren "ops\git_instructions.md" "GIT_INSTRUCTIONS.MD" >nul

if exist "INIT.bat" move /y "INIT.bat" "ops\INIT.BAT" >nul
if exist "ops\INIT.bat" ren "ops\INIT.bat" "INIT.BAT" >nul

if exist "INIT.sh" move /y "INIT.sh" "ops\INIT.SH" >nul
if exist "ops\INIT.sh" ren "ops\INIT.sh" "INIT.SH" >nul

if exist "PUSH.bat" move /y "PUSH.bat" "ops\PUSH.BAT" >nul
if exist "ops\PUSH.bat" ren "ops\PUSH.bat" "PUSH.BAT" >nul

if exist "PUSH.sh" move /y "PUSH.sh" "ops\PUSH.SH" >nul
if exist "ops\PUSH.sh" ren "ops\PUSH.sh" "PUSH.SH" >nul

if exist "WIPE.bat" move /y "WIPE.bat" "ops\WIPE.BAT" >nul
if exist "ops\WIPE.bat" ren "ops\WIPE.bat" "WIPE.BAT" >nul

if exist "WIPE.sh" move /y "WIPE.sh" "ops\WIPE.SH" >nul
if exist "ops\WIPE.sh" ren "ops\WIPE.sh" "WIPE.SH" >nul

:: 3. Fix bridge package.json.txt
if exist "bridge\package.json.txt" (
    echo [*] Fixing bridge\package.json.txt...
    ren "bridge\package.json.txt" "package.json"
)

:: 4. Remove stray duplicates
echo [*] Cleaning stray duplicate files...
if exist "src\hooks\Sidebar.jsx" del /f /q "src\hooks\Sidebar.jsx"
if exist "src\components\Multiview\AtemConstellationBus.jsx" del /f /q "src\components\Multiview\AtemConstellationBus.jsx"

echo ================================================================
echo    STANDARDIZATION COMPLETE!
echo    All ops files are ALL-CAPS in ops\.
echo    Project file tree is clean and consistent.
echo ================================================================
pause